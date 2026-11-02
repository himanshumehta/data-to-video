"""
platforms.py: config/platforms.json, which maps one rendered master to the
targets it is published on.
"""

import json
from pathlib import Path
from typing import List, Optional

ROOT = Path(__file__).resolve().parents[2]
PLATFORMS_JSON = ROOT / "config" / "platforms.json"


def load_platforms(path: Path = PLATFORMS_JSON) -> dict:
    return json.loads(path.read_text())


def fan_out_targets(rendered_platform: str, cfg: dict) -> List[str]:
    """Every target that reuses the master rendered as `rendered_platform`."""
    for fmt in cfg["formats"].values():
        if rendered_platform == fmt.get("rendered_as") or rendered_platform in fmt["targets"]:
            return list(fmt["targets"])
    return [rendered_platform]


def targets_for(rendered_platform: str, lang: str, cfg: dict) -> List[str]:
    """Fan-out targets that accept `lang`."""
    return [t for t in fan_out_targets(rendered_platform, cfg)
            if lang in cfg["targets"].get(t, {}).get("languages", [])]


def max_duration(rendered_platform: str, cfg: dict) -> Optional[float]:
    """Shortest time limit among the master's targets, or None if none has one."""
    limits = [cfg["targets"].get(t, {}).get("max_duration_s") for t in fan_out_targets(rendered_platform, cfg)]
    limits = [x for x in limits if x]
    return min(limits) if limits else None
