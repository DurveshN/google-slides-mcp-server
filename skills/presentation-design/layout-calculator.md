---
name: layout-calculator
description: "Reference for calculating safe text box dimensions, character counts per inch, and element positioning to prevent text overflow in Google Slides. Use before every add_text_box, add_shape, or add_table call."
---

# Layout Calculator

## The Problem

Google Slides API text boxes are **fixed-size** and **auto-fit is automatically disabled** when text is inserted via API. There is no text metrics API to measure character widths. You must calculate dimensions yourself.

## Slide Canvas

Standard 16:9 presentation: **10 inches wide × 5.625 inches tall**

Safe content area: **x: 0.3 to 9.7, y: 0.3 to 5.3** (0.3 inch margins on all sides)

## Character Width Table (Proportional Fonts)

Average character widths at common font sizes (in inches):

| Font Size (pt) | Avg Char Width (in) | Chars per Inch | Chars in 9.4in box |
|----------------|---------------------|----------------|-------------------|
| 10             | 0.055               | 18             | 169               |
| 12             | 0.065               | 15             | 141               |
| 14             | 0.076               | 13             | 122               |
| 16             | 0.087               | 11.5           | 108               |
| 18             | 0.098               | 10             | 94                |
| 20             | 0.109               | 9              | 85                |
| 24             | 0.131               | 7.5            | 71                |
| 28             | 0.153               | 6.5            | 61                |
| 32             | 0.175               | 5.7            | 54                |
| 36             | 0.196               | 5.1            | 48                |
| 40             | 0.218               | 4.6            | 43                |
| 44             | 0.240               | 4.2            | 39                |

## Line Height Table

| Font Size (pt) | Line Height (in) | Lines in 3.2in box |
|----------------|------------------|-------------------|
| 10             | 0.14             | 22                |
| 12             | 0.17             | 18                |
| 14             | 0.20             | 16                |
| 16             | 0.22             | 14                |
| 18             | 0.25             | 13                |
| 20             | 0.28             | 11                |
| 24             | 0.33             | 9                 |
| 28             | 0.39             | 8                 |
| 32             | 0.44             | 7                 |
| 36             | 0.50             | 6                 |
| 40             | 0.56             | 5                 |
| 44             | 0.61             | 5                 |

## Safe Dimension Formulas

### Text Box Width
```
width = (max_chars × char_width_at_font_size) + 0.2in padding
```

Where `char_width_at_font_size` is from the Character Width Table above.

### Text Box Height
```
height = (line_count × line_height_at_font_size) + 0.2in padding
```

Where `line_height_at_font_size` is from the Line Height Table above.

### Quick Reference by Content Type

| Content Type | Font Size | Width | Max Chars | Height | Max Lines |
|--------------|-----------|-------|-----------|--------|-----------|
| Title (1 line) | 36pt | 9.4in | 48 | 0.7in | 1 |
| Subtitle (2 lines) | 20pt | 9.0in | 76 | 0.8in | 2 |
| Body text | 14pt | 9.0in | 117 | 3.2in | 15 |
| Bullet item | 14pt | 8.5in | 110 | 0.25in | 1 |
| Caption | 12pt | 4.0in | 60 | 0.4in | 2 |
| Metric label | 12pt | 2.0in | 30 | 0.4in | 1 |
| Metric value | 32pt | 3.0in | 17 | 0.6in | 1 |

## Positioning Rules

### Title Zone
- x: 0.3, y: 0.3
- width: 9.4, height: 0.9
- Max 1-2 lines at 32-36pt

### Body Zone
- x: 0.3, y: 1.8
- width: 9.4, height: 3.2
- Max 14-16 lines at 14-16pt

### Footer Zone
- x: 0.3, y: 5.0
- width: 9.4, height: 0.4
- Max 1 line at 10-12pt

### Two-Column Layout
- Left column: x: 0.3, width: 4.4
- Right column: x: 5.3, width: 4.4
- Gap between columns: 0.6in

### Image Zones
- Full-slide background: x: 0, y: 0, w: 10, h: 5.625
- Inline image: width ~2-3in, align at matching y to adjacent text
- Centered: x = (10 - width) / 2, y = (5.625 - height) / 2

## Overflow Prevention Checklist

Before every `add_text_box` call, verify:

- [ ] Character count ≤ max for font size and box width
- [ ] Line count ≤ max for font size and box height  
- [ ] Box stays within safe margins (x: 0.3-9.7, y: 0.3-5.3)
- [ ] If text is close to limit, add 10% extra height/width buffer
- [ ] For bullets: each bullet item gets its own line count check

## Handling Overflow

If text exceeds calculated capacity:

1. **Reduce font size** — Drop 2pt and recalculate
2. **Increase box size** — Make taller or wider if space permits
3. **Split into multiple boxes** — Break content across 2+ text boxes
4. **Truncate with ellipsis** — Cut text and add "..." if non-critical

## Examples

### Example 1: Title that fits
Text: "Q4 Revenue Up 23%, Churn Down 15%"
Length: 36 chars
Font: 36pt (max 48 chars in 9.4in)
Box: x=0.3, y=0.3, w=9.4, h=0.7 ✅

### Example 2: Body text that needs 2 boxes
Text: 300 chars of body text at 14pt
Capacity: 117 chars in 9.0in wide, 15 lines in 3.2in tall
Split: Box 1 (first 150 chars), Box 2 (remaining 150 chars)

### Example 3: Metric card
Label: "Revenue Growth" (14 chars)
Value: "23%" (3 chars)
Font: 32pt for value, 12pt for label
Box: x=0.3, y=2.0, w=3.0, h=1.0 ✅
