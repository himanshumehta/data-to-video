# Security policy

## Reporting a vulnerability

Email **mehta.august@gmail.com** with "data-to-video security" in the subject. Please include the
commit you tested, the command you ran and what happened. Do not open a public issue for an
unfixed vulnerability. You should get a reply within a week.

## Supported versions

Only the `main` branch is maintained. There are no releases or back-ports.

## Scope

This is a command-line pipeline that runs on the operator's own machine. It reads vehicle JSON
files, renders video with Remotion (headless Chrome) and ffmpeg, optionally calls Gemini TTS and
the Claude Code CLI, and optionally uploads the result to a separate publishing service.

In scope:

- Input handling for CLI arguments, vehicle JSON files and the files under `sample_data/`,
  `content_types/` and `config/`.
- The subprocess calls to ffmpeg, ffprobe, node and `claude`.
- The model-output guard in `scripts/lib/guard.py`.
- `scripts/publish.py` and how it handles the publisher URL and token.
- Dependencies pinned in `requirements*.txt` and `remotion/package-lock.json`.

Out of scope: the social-publisher service and the social networks themselves, Remotion and
ffmpeg bugs that do not depend on how this project calls them, and the Remotion gallery dev
server (`npm run gallery`), which binds to localhost and is meant for local preview only.

## What the project protects against

| Threat | Control | Where |
|---|---|---|
| A slug, language, content type or platform that escapes `output/` (`../..`) | Every path segment must match `[a-z0-9][a-z0-9_-]{0,79}` (languages `[a-z]{2,3}`) | `scripts/lib/vehicle_data.py` |
| A vehicle file that writes outside `remotion/public/` or makes headless Chrome fetch an internal URL | Image must be `https://...` or `vehicles/<file>.png`; slug and brand slug validated on load | `scripts/lib/vehicle_data.py` |
| Shell injection through file names | All subprocesses get argument lists; no `shell=True`; Node uses `execFileSync` | `scripts/*.py`, `remotion/scripts/render-batch.mjs` |
| An LLM changing a figure, inventing one or reading out a URL | Numbers in the output must equal the numbers in the source text; URLs and banned phrases rejected; two corrective retries, then the run stops before anything is cached or voiced | `scripts/lib/guard.py`, `scripts/lib/reword.py` |
| The LLM step touching the file system | `claude -p --tools ""`: no tools, prompt on stdin, timeout | `scripts/lib/reword.py` |
| A stale cached script voiced after the data changed | Cached LLM scripts are re-checked against freshly rendered templates | `scripts/narrate.py` |
| Token leaks when publishing | Dry run by default; https required unless the host is loopback; no redirects followed; credentials in the URL rejected; token never printed | `scripts/publish.py` |
| Accidental paid API use | Gemini TTS, the LLM reword and publishing are each behind an explicit flag; `--tts auto` never picks Gemini | `scripts/ownership_pipeline.py`, `scripts/narrate.py` |
| Known-vulnerable dependencies | `pip-audit`, `npm audit`, `bandit` and `gitleaks` run in CI on every push and weekly; Dependabot for pip, npm and GitHub Actions; actions pinned by commit SHA | `.github/` |

## What it does not protect against

- **Untrusted narration templates.** Templates in `content_types/` are code. They are rendered in a
  Jinja2 sandbox, but anyone who can edit them can change what is said.
- **Wrong source data.** The guard proves the narration repeats the data's numbers; it cannot tell
  whether the data is right.
- **Numbers written as words.** The guard only recognises digits. The prompts ask the model to keep
  digits, and a number the model spells out counts as missing (the run stops), but a fact stated
  without any number is not checked.
- **Prebaked sample audio.** The shipped narration in `sample_data/narration/` predates the guard.
  The pipeline audits its scripts and prints the findings as warnings, but plays the audio as is.
- **The publishing service.** Channel credentials, rate limits and upload validation are that
  service's job.
- **A compromised machine or toolchain** (ffmpeg, Node, Chrome, the `claude` CLI).
