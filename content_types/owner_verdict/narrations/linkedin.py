"""
Owner Verdict narrations for LinkedIn.
NOTE: LinkedIn audio is derived from Instagram.
Run assemble.py with --platform linkedin; it copies audio from instagram output.
No need to run narrate.py for linkedin separately.
"""

AUDIO_FROM = "instagram"   # assemble.py reads this, skips TTS for linkedin

NARRATIONS = {}   # Not used when AUDIO_FROM is set
