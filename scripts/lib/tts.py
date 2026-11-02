"""
tts.py — Gemini TTS utilities: generate_tts, save_wav, TTS_PROMPTS, load_env.

Extracted from ownership_narrate.py for use by scripts/narrate.py and
any content_types module that needs TTS generation.
Never import * from this module — always use named imports.
"""

import os
import time
import wave
from pathlib import Path


# ── TTS prompts per language ───────────────────────────────────────────────────
TTS_PROMPTS = {
    "en": (
        "Say the following text exactly as written, in a confident and engaging "
        "Indian English narrator voice. Use natural Indian English pronunciation and pacing.\n\n{text}"
    ),
    "hi": (
        "Say the following text exactly as written, in a confident and engaging "
        "Hindi narrator voice. Use natural Hindustani pronunciation and pacing. "
        "English words like brand names and technical terms should be pronounced naturally "
        "as an Indian Hindi speaker would say them:\n\n{text}"
    ),
    "mr": (
        "Say the following text exactly as written, in a confident and engaging "
        "Marathi narrator voice. Use natural Marathi pronunciation and pacing. "
        "English words like brand names and technical terms should be pronounced naturally "
        "as an Indian Marathi speaker would say them:\n\n{text}"
    ),
    "te": (
        "Say the following text exactly as written, in a confident and engaging "
        "Telugu narrator voice. Use natural Telugu pronunciation and pacing. "
        "English words like brand names and technical terms should be pronounced naturally "
        "as an Indian Telugu speaker would say them:\n\n{text}"
    ),
}


def load_env(env_path):
    """Load KEY=VALUE pairs from an env file into os.environ."""
    p = Path(env_path)
    if not p.exists():
        return
    with open(p) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())


def generate_tts(text: str, voice: str = "Achird", lang: str = "en",
                 max_retries: int = 3) -> bytes:
    """Call Gemini 2.5 Flash TTS, return raw PCM bytes (16-bit, 24kHz, mono).

    Automatically retries on 429 rate limits, respecting the API's retryDelay.
    """
    import re
    from google import genai
    from google.genai import types

    # Vertex AI (higher quotas) when GOOGLE_CLOUD_PROJECT is set and ADC is
    # configured; otherwise the Gemini API key (AI Studio).
    client = None
    project = os.environ.get("GOOGLE_CLOUD_PROJECT")
    if project:
        try:
            client = genai.Client(
                vertexai=True,
                project=project,
                location=os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1"),
            )
            print("  Using Vertex AI endpoint")
        except Exception as e:
            print(f"  Vertex AI unavailable ({e}); falling back to GEMINI_API_KEY")
            client = None
    if client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "No TTS credentials: set GEMINI_API_KEY (or GOOGLE_CLOUD_PROJECT + ADC), "
                "or run narrate.py with --tts silent / --tts prebaked"
            )
        client = genai.Client(api_key=api_key)

    prompt_template = TTS_PROMPTS.get(lang, TTS_PROMPTS["en"])
    prompt = prompt_template.format(text=text)
    config = types.GenerateContentConfig(
        response_modalities=["AUDIO"],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(
                    voice_name=voice,
                )
            )
        ),
    )

    last_err = None
    for attempt in range(max_retries + 1):
        try:
            response = client.models.generate_content(
                model=os.environ.get("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts"),
                contents=prompt,
                config=config,
            )
            candidate = response.candidates[0]
            if not candidate.content or not candidate.content.parts:
                raise RuntimeError(
                    f"Gemini TTS returned no audio. finish_reason={candidate.finish_reason}"
                )
            return candidate.content.parts[0].inline_data.data
        except Exception as e:
            last_err = e
            err_str = str(e)
            if "429" in err_str and attempt < max_retries:
                m = re.search(r'retryDelay.*?(\d+\.?\d*)s', err_str)
                delay = float(m.group(1)) + 2 if m else 30
                print(f"    Rate limited, waiting {delay:.0f}s (attempt {attempt + 1}/{max_retries})...")
                time.sleep(delay)
            else:
                raise

    raise last_err


def save_wav(pcm_data: bytes, path: Path, speed: float = 1.0) -> Path:
    """Wrap raw PCM in WAV, then convert to 48kHz stereo.

    Gemini TTS outputs 24kHz mono PCM. The assembler mixes at 48kHz stereo, so we
    write the raw WAV first, then use ffmpeg to resample + upmix.
    Optional speed adjustment via atempo filter (e.g., 1.2 = 20% faster).
    """
    import subprocess
    path.parent.mkdir(parents=True, exist_ok=True)

    # Write raw 24kHz mono WAV from Gemini
    raw_path = path.with_suffix(".raw.wav")
    with wave.open(str(raw_path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit = 2 bytes
        wf.setframerate(24000)
        wf.writeframes(pcm_data)

    # Convert to 48kHz stereo, with optional speed adjustment
    ffmpeg_cmd = ["ffmpeg", "-y", "-i", str(raw_path)]
    if speed != 1.0:
        ffmpeg_cmd += ["-filter:a", f"atempo={speed}"]
    ffmpeg_cmd += ["-ar", "48000", "-ac", "2", str(path)]

    result = subprocess.run(ffmpeg_cmd, capture_output=True)
    raw_path.unlink(missing_ok=True)

    if result.returncode != 0:
        # Fallback: keep raw 24kHz if ffmpeg fails
        raw_path2 = path.with_suffix(".raw.wav")
        if raw_path2.exists():
            raw_path2.rename(path)
    return path
