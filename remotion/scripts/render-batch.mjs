#!/usr/bin/env node
/**
 * render-batch.mjs — Queue-driven batch renderer for Remotion.
 *
 * Reads a render-queue.json file and renders all jobs using Remotion's
 * programmatic API. Bundles ONCE, then renders N jobs concurrently.
 *
 * Smart render routing per job:
 *   "still"     → renderStill() — one PNG frame (~0.3s/slide)
 *   "animation" → renderMedia() for animationFrames only → ffmpeg tpad extends (~2s/slide)
 *   "full"      → renderMedia() for full duration (~3s/slide)
 *
 * Usage:
 *   node scripts/render-batch.mjs render-queue.json --concurrency=3
 *   node scripts/render-batch.mjs render-queue.json --resume
 *   node scripts/render-batch.mjs render-queue.json --dry-run
 *   node scripts/render-batch.mjs render-queue.json --test
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import pLimit from "p-limit";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Parse CLI args ──────────────────────────────────────────────────
const args = process.argv.slice(2);
const queuePath = args.find((a) => !a.startsWith("-")) || "render-queue.json";
const concurrency = Number.parseInt(
  args.find((a) => a.startsWith("--concurrency="))?.split("=")[1] || "3",
  10
);
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 16) {
  console.error("--concurrency must be an integer between 1 and 16");
  process.exit(1);
}
const resume = args.includes("--resume");
const dryRun = args.includes("--dry-run");
const testMode = args.includes("--test");
const GL_BACKENDS = ["angle", "egl", "swangle", "swiftshader", "vulkan"];
const glBackend =
  args.find((a) => a.startsWith("--gl="))?.split("=")[1] || "angle";
if (!GL_BACKENDS.includes(glBackend)) {
  console.error(`--gl must be one of: ${GL_BACKENDS.join(", ")}`);
  process.exit(1);
}
const RENDER_MODES = ["still", "animation", "full"];

// ── Load queue ──────────────────────────────────────────────────────
if (!fs.existsSync(queuePath)) {
  console.error(`Queue file not found: ${queuePath}`);
  process.exit(1);
}

console.log(`Loading queue from ${queuePath}`);
const queue = JSON.parse(fs.readFileSync(queuePath, "utf-8"));

if (!Array.isArray(queue) || queue.length === 0) {
  console.error("Queue is empty or not an array");
  process.exit(1);
}
// The queue is written by remotion_render.py; reject anything malformed up front.
for (const [i, j] of queue.entries()) {
  const ok =
    typeof j.compositionId === "string" &&
    typeof j.outputPath === "string" &&
    j.outputPath.endsWith(".mp4") &&
    (j.propsPath === undefined || typeof j.propsPath === "string") &&
    RENDER_MODES.includes(j.renderMode || "full");
  if (!ok) {
    console.error(`Queue job ${i} is malformed`);
    process.exit(1);
  }
}

// ── Resume: filter out jobs whose output already exists ─────────────
let jobs = queue;
if (resume) {
  jobs = queue.filter((j) => !fs.existsSync(j.outputPath));
  console.log(
    `Resume mode: ${queue.length - jobs.length} already done, ${jobs.length} remaining`
  );
}
if (testMode) {
  jobs = jobs.slice(0, 1);
  console.log("Test mode: rendering 1 job only");
}

// ── Tally render modes for logging ──────────────────────────────────
const modeCounts = { still: 0, animation: 0, full: 0 };
jobs.forEach((j) => modeCounts[j.renderMode || "full"]++);
console.log(
  `${jobs.length} jobs (${modeCounts.still} still, ${modeCounts.animation} animation, ${modeCounts.full} full), concurrency ${concurrency}, gl=${glBackend}`
);

if (dryRun) {
  jobs.forEach((j) =>
    console.log(
      `  [${j.renderMode || "full"}] ${j.compositionId} -> ${j.outputPath}`
    )
  );
  console.log("Dry run complete.");
  process.exit(0);
}

// ── Bundle ONCE — this is the key speed improvement ─────────────────
const bundleStart = Date.now();
console.log("Bundling...");
const bundled = await bundle({
  entryPoint: path.join(__dirname, "..", "src", "index.ts"),
  webpackOverride: (config) => config,
});
console.log(
  `Bundle ready (${((Date.now() - bundleStart) / 1000).toFixed(1)}s)`
);

// ── Render jobs concurrently ────────────────────────────────────────
const limit = pLimit(concurrency);
const results = [];
let done = 0;
let failed = 0;
const batchStart = Date.now();

/**
 * Extend a short video to target duration by cloning the last frame.
 * tpad + libx264 re-encodes the video (~1-2s overhead). Still faster
 * than rendering all frames in Remotion for static-after-animation slides.
 * ffprobe/ffmpeg get argument arrays (no shell), so paths are never parsed
 * as shell syntax.
 */
function extendWithFfmpeg(inputPath, outputPath, targetDurationSec) {
  const probe = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration",
     "-of", "default=noprint_wrappers=1:nokey=1", inputPath],
    { encoding: "utf-8" }
  ).trim();
  const currentDuration = parseFloat(probe);
  const padDuration = Math.max(0, targetDurationSec - currentDuration);

  if (padDuration < 0.1) {
    // No padding needed
    if (inputPath !== outputPath) fs.renameSync(inputPath, outputPath);
    return;
  }

  execFileSync(
    "ffmpeg",
    ["-y", "-i", inputPath,
     "-vf", `tpad=stop_mode=clone:stop_duration=${padDuration.toFixed(2)}`,
     "-c:v", "libx264", "-crf", "12", "-preset", "medium", outputPath],
    { stdio: "pipe" }
  );
  // Clean up temp file
  if (inputPath !== outputPath && fs.existsSync(inputPath)) {
    fs.unlinkSync(inputPath);
  }
}

await Promise.all(
  jobs.map((job) =>
    limit(async () => {
      const { compositionId, outputPath, renderMode = "full" } = job;
      // Props: load from file path if propsPath given, else use inline props
      const props = job.propsPath
        ? JSON.parse(fs.readFileSync(job.propsPath, "utf-8"))
        : job.props;
      const jobStart = Date.now();

      try {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        const composition = await selectComposition({
          serveUrl: bundled,
          id: compositionId,
          inputProps: props,
        });

        if (renderMode === "still") {
          // ── Still mode: one PNG frame (final settled frame) ──
          const pngPath = outputPath.replace(/\.mp4$/, ".png");
          await renderStill({
            composition,
            serveUrl: bundled,
            output: pngPath,
            inputProps: props,
            frame:
              (job.animationFrames || composition.durationInFrames) - 1,
            chromiumOptions: { gl: glBackend },
          });
        } else if (renderMode === "animation" && job.animationFrames) {
          // ── Animation mode: render only animated frames, then extend ──
          const tempPath = outputPath.replace(/\.mp4$/, ".anim.mp4");
          await renderMedia({
            composition: {
              ...composition,
              durationInFrames: job.animationFrames,
            },
            serveUrl: bundled,
            codec: "h264",
            outputLocation: tempPath,
            inputProps: props,
            scale: job.scale || 1,
            chromiumOptions: { gl: glBackend },
          });
          // Extend to full narration duration
          const targetSec =
            job.durationSec ||
            props.durationSec ||
            composition.durationInFrames / composition.fps;
          extendWithFfmpeg(tempPath, outputPath, targetSec);
        } else {
          // ── Full mode: render every frame (fallback) ──
          await renderMedia({
            composition,
            serveUrl: bundled,
            codec: "h264",
            outputLocation: outputPath,
            inputProps: props,
            chromiumOptions: { gl: glBackend },
          });
        }

        const elapsed = ((Date.now() - jobStart) / 1000).toFixed(1);
        done++;
        results.push({
          compositionId,
          outputPath,
          renderMode,
          status: "ok",
          seconds: +elapsed,
        });
        const eta = (
          ((Date.now() - batchStart) / done) *
          (jobs.length - done) /
          1000
        ).toFixed(0);
        console.log(
          `[${done + failed}/${jobs.length}] ok ${compositionId} [${renderMode}] (${elapsed}s) ETA ${eta}s`
        );
      } catch (err) {
        const elapsed = ((Date.now() - jobStart) / 1000).toFixed(1);
        failed++;
        results.push({
          compositionId,
          outputPath,
          renderMode,
          status: "failed",
          error: err.message,
          seconds: +elapsed,
        });
        console.error(
          `[${done + failed}/${jobs.length}] FAIL ${compositionId}: ${err.message}`
        );
      }
    })
  )
);

// ── Summary + results file ──────────────────────────────────────────
const totalSec = ((Date.now() - batchStart) / 1000).toFixed(1);
console.log(
  `\nDone: ${done} rendered, ${failed} failed, ${jobs.length} total (${totalSec}s)`
);

const resultsPath = queuePath.replace(".json", "-results.json");
fs.writeFileSync(
  resultsPath,
  JSON.stringify(
    { done, failed, totalSeconds: +totalSec, jobs: results },
    null,
    2
  )
);
console.log(`Results written to ${resultsPath}`);

process.exit(failed > 0 ? 1 : 0);
