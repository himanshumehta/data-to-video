# Service Bill Slides — UI Rework Prompt

You are redesigning 9:16 Instagram Reels slides for a "Service Bill Inspection" content type at BikeNCars (bikencars.com). These slides analyze real service bills line by line and present findings to viewers.

## Context

- Canvas: 1080x1920 (9:16 portrait)
- Framework: Remotion (React + TypeScript)
- Design system: Dark theme (#09090b background), Inter font, glass morphism cards
- Brand colors: Blue (#4783ff), Rose (#f43f5e), Emerald (#10b981), Amber (#f59e0b)
- Logo: BikeNCars V2 with bike/car SVG icons (see `remotion/src/components/Logo.tsx`)
- Reference: The ownership-cost reels slides are the gold standard for quality — see `remotion/src/slides/reels/HookReels.tsx` and siblings for design language

## Safe Zones (MANDATORY)

All content MUST stay within these bounds:
- **Top**: 15% = 288px (Logo goes at top: 72, above safe zone)
- **Bottom**: 15% = 288px (Watermark lives here)
- **Left**: 8% = 86px
- **Right**: 8% = 86px
- **Usable content area**: 288-1632 vertically (1344px), 86-994 horizontally (908px)
- **Screen utilization**: 80%+ of the safe area must contain visible content. No empty dark voids.

## Color Scheme (Service Bills — NOT ownership cost)

Service bill slides use a **teal/emerald** accent instead of amber/blue:
- Primary accent: Teal `#0d9488` / Bright teal `#14b8a6`
- Essential items: Emerald `#10b981`
- Optional/upsell items: Amber `#f59e0b`
- Labor: Blue `#4783ff`
- Negative/overcharged: Red `#ef4444`
- Text: `#f4f4f5` (primary), `#e4e4e7` (secondary), `#a1a1aa` (tertiary), `#52525b` (muted)
- Background: `#09090b` (base), `#030f0d` (thumbnail variant)

## Slides to Design (8 slides)

### Slide 00 — Bill Overview (Hook)
**Purpose**: First impression. Vehicle + service type + total + item count summary.
**Data available**: `bill.manufacturer_name`, `bill.vehicle_name`, `bill.vehicle_year`, `bill.vehicle_variant`, `bill.fuel_type`, `bill.service_type_label`, `bill.is_authorized`, `bill.total_display`, `bill.items.length`, `bill.essential_count`, `bill.upsell_count`, `bill.primary_nobg_url` (vehicle image)
**Must show**: Vehicle image (large), vehicle name, year/variant/fuel badges, service type, authorized/local badge, total amount (HERO size), item count breakdown, "We inspected every line item"
**Tone**: Professional, authoritative. Not clickbait.

### Slide 01 — Cost Split
**Purpose**: Where the money went — labor vs parts vs tax visual breakdown.
**Data**: `bill.labor_display`, `bill.labor_pct`, `bill.parts_display`, `bill.tax_display`, `bill.total_display`
**Must show**: Horizontal stacked bar (thick, animated), 3 segment cards with color dots + amounts, total footer
**Design notes**: Bar should be 60px+ tall. Cards should fill width. Colors: blue=labor, emerald=parts, amber=tax.

### Slide 02 — Essential Items
**Purpose**: What your vehicle genuinely needed. Validates the necessary parts of the bill.
**Data**: `bill.top_essentials` (array of {name, price_display, category}), `bill.essential_display`, `bill.essential_count`
**Must show**: Receipt-style list with ✓ checkmarks, item name + category + price per row, essential total footer in green
**Design notes**: Up to 7 items. Each row should breathe — 18-22px vertical padding. Green border/background theme.

### Slide 03 — Optional Add-Ons
**Purpose**: Items that were optional (or "Clean Bill" if none found).
**Data**: `bill.top_upsells` (array), `bill.upsell_display`, `bill.upsell_count`
**Variant A (has upsells)**: Amber receipt list with ○ markers, each item + price, savings card at bottom: "Could Have Saved ₹X"
**Variant B (clean bill)**: Big green checkmark, "Clean Bill", "No unnecessary add-ons detected"
**Tone**: Factual, not angry. "These were added, you can skip next time" — not "YOU WERE RIPPED OFF"

### Slide 04 — Labor Charges
**Purpose**: Is the labor ratio reasonable for this service type?
**Data**: `bill.labor_pct`, `bill.labor_display`, `bill.top_labor` (array of {name, price_display})
**Must show**: Animated percentage ring (big, center), percentage + amount, verdict badge ("Reasonable"/"High"/"Low"), top labor items list
**Design notes**: Ring should be 130-140px radius, 22px stroke. Verdict pill below amount.

### Slide 05 — Key Takeaways
**Purpose**: 2-3 specific, actionable insights from this bill.
**Data**: `bill.tips` (array of strings, max 3)
**Must show**: Numbered cards (1, 2, 3) with colored borders, each tip as readable text
**Design notes**: Cards should fill the available space equally. Number badges: 52px square, rounded. Alternate colors: blue, emerald, amber.

### Slide 06 — Bill Rating (Scorecard)
**Purpose**: Trust metric — how does this bill rate on transparency, fairness, value?
**Data**: Computed from bill data — `transparencyScore`, `fairnessScore`, `valueScore`, `overallScore`
**Must show**: Big overall score (160px), 3 horizontal bar charts with labels + scores, verdict banner at bottom
**Design notes**: Bars should be 28px tall, animated fill. Score colors: ≥7 emerald, ≥5 amber, <5 red.

### Slide 07 — Thumbnail (Static)
**Purpose**: Thumbnail for reels/shorts — must be eye-catching at small size.
**Data**: `bill.manufacturer_name`, `bill.vehicle_name`, `bill.vehicle_year`, `bill.vehicle_variant`, `bill.fuel_type`, `bill.service_type_label`, `bill.primary_nobg_url`
**Must show**: Vehicle image (upper half), massive vehicle name text, year/variant/fuel badges, "SERVICE BILL" in teal (like "OWNERSHIP COST" in amber)
**Color scheme**: Dark teal background (#030f0d), teal accents — visually distinct from ownership cost thumbnails

## Design Rules

1. **Text hierarchy**: Hero numbers 100-160px → amounts 42-52px → body 24-28px → labels 16-18px → meta 14px
2. **Glass cards**: `background: rgba(color, 0.04-0.08)`, `border: 2px solid rgba(color, 0.10-0.20)`, `borderRadius: 20px`
3. **Animations**: fade-in + translateY(18-24px) over 12 frames. Stagger items by 3-6 frames each.
4. **Click sounds**: `staticFile("click.wav")` at key animation moments (3-5 per slide)
5. **Content density**: Fill 80%+ of safe zone. Use `flex: 1` spacers to distribute content vertically. No large empty gaps.
6. **Consistency**: Every slide has Logo at top, vehicle name + section label as header, Watermark at bottom
7. **Receipt pattern**: Item lists use alternating subtle borders, consistent padding, price right-aligned
8. **Color coding**: Essential=emerald, Optional=amber, Labor=blue, Negative=red, Neutral=white

## File Structure

Each slide is a single `.tsx` file in `remotion/src/slides/reels/`:
- `BillHookReels.tsx`
- `BillCostSplitReels.tsx`
- `BillEssentialReels.tsx`
- `BillOptionalReels.tsx`
- `BillLaborReels.tsx`
- `BillTakeawayReels.tsx`
- `BillRatingReels.tsx`
- `BillThumbnailReels.tsx`

Props interface: `{ bill: any; [key: string]: any; }`

## Sample Bill Data

```json
{
  "manufacturer_name": "Hyundai",
  "vehicle_name": "Verna",
  "vehicle_year": 2017,
  "vehicle_variant": "Fluidic 1.4 CRDi",
  "fuel_type": "diesel",
  "service_type_label": "Paid Service",
  "is_authorized": true,
  "total_display": "₹25,291",
  "labor_display": "₹10,067",
  "labor_pct": 41,
  "parts_display": "₹15,224",
  "tax_display": "₹0",
  "essential_display": "₹5,004",
  "essential_count": 11,
  "upsell_display": "₹10,200",
  "upsell_count": 6,
  "verdict": "overcharged",
  "verdict_label": "Overcharged",
  "verdict_detail": "₹10,200 in unnecessary add-ons (40% of bill)",
  "items": [{"name": "Eng Oil Diesel 5W30", "price_display": "₹2,273", "insight_class": "essential"}, ...],
  "top_essentials": [{"name": "Eng Oil Diesel 5W30", "price_display": "₹2,273", "category": "engine_oil"}, ...],
  "top_upsells": [{"name": "Internal Panel Protection", "price_display": "₹3,121"}, ...],
  "top_labor": [{"name": "Periodic Maintenance Service", "price_display": "₹3,398"}, ...],
  "tips": ["Skip Internal Panel Protection next time — saves ₹3,104", "Engine Decarbonising is optional", "Labor at 41% is reasonable"],
  "primary_nobg_url": "bikes/hyundai-verna-ex.png"
}
```

## What Good Looks Like

Reference the ownership-cost reels slides for design quality:
- `HookReels.tsx`: Vehicle image fills top 40%, massive price number, glass card receipt below
- `AnnualBreakdownReels.tsx`: Stacked bar chart + donut, dense data, every pixel used
- `VsSegmentReels.tsx`: Ranked list with colored bars, self highlighted in amber

The service bill slides should match this energy — bold, data-dense, professional, zero wasted space.
