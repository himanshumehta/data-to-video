"""
theme_compiler.py — Convert theme.json → theme.css

Reads design system JSON and generates CSS custom properties + utility classes
that templates reference via var(--property-name) and class names.

Usage:
    python scripts/theme_compiler.py              # compile all themes
    python scripts/theme_compiler.py default       # compile one theme
    python scripts/theme_compiler.py cinematic
"""

import json
import sys
from pathlib import Path


def compile_theme(name: str):
    """Read theme.json, emit theme.css with custom properties + utility classes."""
    base = Path(__file__).resolve().parent.parent
    json_path = base / f"design-systems/{name}/theme.json"
    css_path = base / f"design-systems/{name}/theme.css"

    theme = json.loads(json_path.read_text())

    lines = [f"/* Auto-generated from {name}/theme.json — do not edit */"]

    # ── :root custom properties ──────────────────────────────────
    lines.append(":root {")

    # Colors: surface.{1-5}, text.{1-4}, brand.*, semantic.*
    colors = theme.get("colors", {})
    for group, prefix in [("surface", "surface"), ("text", "text"),
                          ("brand", "brand"), ("semantic", "color")]:
        if group in colors:
            for key, value in colors[group].items():
                lines.append(f"  --{prefix}-{key}: {value};")

    # Fonts
    for role, font in theme.get("fonts", {}).items():
        family = font if isinstance(font, str) else font.get("family", "Inter")
        lines.append(f"  --font-{role}: '{family}', sans-serif;")

    # Spacing
    for key, value in theme.get("spacing", {}).items():
        lines.append(f"  --spacing-{key}: {value}px;")

    # Radius
    for key, value in theme.get("radius", {}).items():
        val = f"{value}px" if value != 9999 else "9999px"
        lines.append(f"  --radius-{key}: {val};")

    # Glass
    glass = theme.get("glass", {})
    for key in ["bg", "border", "bg_heavy", "border_heavy"]:
        if key in glass:
            lines.append(f"  --glass-{key.replace('_', '-')}: {glass[key]};")

    # Cards
    for card_type, props in theme.get("cards", {}).items():
        prefix = card_type.replace("_", "-")
        if "background" in props:
            lines.append(f"  --card-{prefix}-bg: {props['background']};")
        if "border" in props:
            lines.append(f"  --card-{prefix}-border: {props['border']};")
        if "border_radius" in props:
            lines.append(f"  --card-{prefix}-radius: {props['border_radius']}px;")
        if "padding" in props:
            lines.append(f"  --card-{prefix}-padding: {props['padding']}px;")

    # Watermark
    wm = theme.get("watermark", {})
    if wm:
        lines.append(f"  --watermark-color: {wm.get('color', 'rgba(255,255,255,0.08)')};")
        lines.append(f"  --watermark-size: {wm.get('font_size', 16)}px;")
        lines.append(f"  --watermark-weight: {wm.get('font_weight', 600)};")
        lines.append(f"  --watermark-opacity: {wm.get('opacity', 0.15)};")
        lines.append(f"  --watermark-spacing: {wm.get('letter_spacing', 0.1)}em;")

    # Slide chrome
    chrome = theme.get("slide_chrome", {})
    sn = chrome.get("slide_number", {})
    if sn:
        lines.append(f"  --slide-num-size: {sn.get('font_size', 28)}px;")
        lines.append(f"  --slide-num-weight: {sn.get('font_weight', 700)};")
        lines.append(f"  --slide-num-current: {sn.get('current_color', 'rgba(255,255,255,0.4)')};")
        lines.append(f"  --slide-num-total: {sn.get('total_color', 'rgba(255,255,255,0.2)')};")
    dots = chrome.get("progress_dots", {})
    if dots:
        lines.append(f"  --dot-size: {dots.get('dot_size', 12)}px;")
        lines.append(f"  --dot-gap: {dots.get('gap', 12)}px;")
        lines.append(f"  --dot-active: {dots.get('active_color', '#10B981')};")
        lines.append(f"  --dot-inactive: {dots.get('inactive_color', '#27272a')};")

    # Section colors
    for section, color in theme.get("section_colors", {}).items():
        lines.append(f"  --section-{section}: {color};")

    # Data viz
    dv = theme.get("data_viz", {})
    ring = dv.get("rating_ring", {})
    if ring:
        lines.append(f"  --ring-width: {ring.get('ring_width', 10)}px;")
        lines.append(f"  --ring-track: {ring.get('track_color', 'rgba(255,255,255,0.08)')};")
    bar = dv.get("comparison_bar", {})
    if bar:
        lines.append(f"  --bar-height: {bar.get('bar_height', 20)}px;")
        lines.append(f"  --bar-radius: {bar.get('bar_radius', 10)}px;")
        lines.append(f"  --bar-active: {bar.get('active_color', '#10B981')};")
        lines.append(f"  --bar-rival: {bar.get('rival_color', '#3b82f6')};")
        lines.append(f"  --bar-track: {bar.get('track_color', '#18181b')};")

    # Shadows
    for shadow_name, s in theme.get("shadows", {}).items():
        x = s.get("offset_x", 0)
        y = s.get("offset_y", 0)
        blur = s.get("blur", 20)
        color = s.get("color", "rgba(0,0,0,0.5)")
        lines.append(f"  --shadow-{shadow_name.replace('_', '-')}: {x}px {y}px {blur}px {color};")

    lines.append("}")

    # ── Typography utility classes ───────────────────────────────
    lines.append("")
    lines.append("/* Typography styles */")
    font_roles = theme.get("fonts", {})
    for style_name, style in theme.get("typography", {}).get("styles", {}).items():
        cls = style_name.replace("_", "-")
        role = style.get("font_role", "body")
        font_family = font_roles.get(role, "Inter")
        if isinstance(font_family, str):
            font_family = f"'{font_family}', sans-serif"

        props = [f"  font-family: {font_family};"]
        props.append(f"  font-weight: {style.get('weight', 400)};")
        props.append(f"  font-size: {style.get('size_pt', 16)}px;")
        props.append(f"  line-height: {style.get('line_height', 1.4)};")
        if "letter_spacing" in style:
            props.append(f"  letter-spacing: {style['letter_spacing']}em;")
        if "text_transform" in style:
            props.append(f"  text-transform: {style['text_transform']};")
        # Color: resolve "colors.text.1" → var(--text-1), "colors.brand.primary" → var(--brand-primary)
        color_ref = style.get("color", "")
        if color_ref.startswith("colors."):
            parts = color_ref.split(".")
            if len(parts) == 3:
                group_map = {"surface": "surface", "text": "text",
                             "brand": "brand", "semantic": "color"}
                prefix = group_map.get(parts[1], parts[1])
                props.append(f"  color: var(--{prefix}-{parts[2]});")
        elif color_ref:
            props.append(f"  color: {color_ref};")

        lines.append(f".{cls} {{")
        lines.extend(props)
        lines.append("}")

    css_path.write_text("\n".join(lines) + "\n")
    print(f"  Compiled: {css_path}")


def compile_all():
    base = Path(__file__).resolve().parent.parent
    ds_dir = base / "design-systems"
    compiled = 0
    for theme_dir in sorted(ds_dir.iterdir()):
        if theme_dir.is_dir() and (theme_dir / "theme.json").exists():
            compile_theme(theme_dir.name)
            compiled += 1
    print(f"Done — {compiled} theme(s) compiled")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        compile_theme(sys.argv[1])
    else:
        compile_all()
