# Presentation Design — Shared Design System

## Color Palettes (60-30-10 Rule)

Use ONE palette per presentation. Maintain 60% primary, 30% secondary, 10% accent.

| Name | 60% Primary | 30% Secondary | 10% Accent | Best For |
|------|-------------|---------------|------------|----------|
| Corporate Navy | #1B2A4A | #FFFFFF | #4A90D9 | Pitch, Data |
| Tech Startup | #0A192F | #F8F9FA | #64FFDA | Pitch, Sales |
| Healthcare | #FFFFFF | #E8F4F8 | #2E8B8B | Training, Data |
| Finance | #1E1E1E | #F5F5F5 | #00C853 | Pitch, Data |
| Creative | #FAFAFA | #F0F0F0 | #FF6B6B | Conference, Sales |
| Minimalist | #FFFFFF | #F8F9FA | #212529 | All types |
| Bold | #000000 | #FFFFFF | #FFD700 | Conference, Sales |
| ESG Green | #FFFFFF | #E8F5E9 | #2E7D32 | Training, Data |
| Consulting | #FFFFFF | #F5F5F5 | #003366 | Pitch, Sales |
| Dark Mode | #121212 | #1E1E1E | #BB86FC | Conference, Data |

## Font Pairings

| Heading | Body | Personality | Use Case |
|---------|------|-------------|----------|
| Montserrat | Open Sans | Modern, clean | Pitch, Sales |
| Playfair Display | Lato | Elegant, editorial | Conference, Pitch |
| Inter | Inter | Neutral, readable | Training, Data |
| Oswald | Source Sans Pro | Bold, impactful | Conference, Sales |
| Roboto | Roboto | Google-native, safe | All types |

**Font Sizes**:
- Title: 32-44pt bold
- Supporting: 20-28pt
- Body: 14-16pt (minimum 18pt for conferences/training)

## Spacing Rules

- **White space**: 15-20% of slide should be empty
- **Margins**: 10% of slide width/height minimum
- **Line spacing**: 1.5x for body, 1.2x for headings
- **Element spacing**: 24-32px grid between elements
- **Slide padding**: 5% edge padding minimum

## Universal Quality Checklist

Before finalizing ANY presentation:

- [ ] **One-idea test**: Can I state this slide's point in one sentence?
- [ ] **5-second test**: Does the slide make sense in 5 seconds?
- [ ] **Contrast test**: Text has 4.5:1 contrast ratio minimum (WCAG AA)
- [ ] **Text density**: ≤6 lines per slide, ≤6 words per line
- [ ] **Font size**: Title ≥32pt, Body ≥18pt
- [ ] **Color consistency**: Same palette throughout
- [ ] **Alignment**: Elements aligned to grid
- [ ] **Image quality**: High-res, relevant, properly credited
- [ ] **Accessibility**: Color not the only information channel

## Action Title Format

Slide titles must state the POINT, not describe the content:

❌ **Bad**: "Company Overview", "Market Analysis", "Product Features"
✅ **Good**: "AI Reduces Supply Chain Costs 40%", "$12B TAM Growing 25% YoY", "3-Click Setup with Real-Time Dashboard"

## Visual Design Rules

### Image-to-Text Ratios

| Slide Type | Visual Dominance | Text Role |
|-----------|------------------|-----------|
| Title / Cover | 70-80% image | Headline + subtitle only |
| Data / Chart | 60-70% chart/visual | Title + 1-2 insight bullets |
| Concept / Diagram | 50-70% diagram | Title + brief explanation |
| Comparison | 50/50 split | Labels per side |
| Feature List | 40-50% icons | Short labels per item |
| Quote / Testimonial | 30-40% photo | Quote text |
| Text-heavy (exception) | 10-20% accent shapes | Detailed explanation |

### Micro-Visual Guidelines

Even slides without full images benefit from micro-visuals:

- **Icon before heading**: 24-32px icon, same color as text or accent color
- **Accent shape behind metric**: Colored rectangle/oval behind key number, extends 10-20px beyond text
- **Arrow connectors**: Between related text blocks, subtle gray or accent color
- **Progress indicators**: Small dots/bars showing sequence (e.g., Step 1 of 3)
- **Color coding**: Consistent color for same category across slides (e.g., all revenue metrics in green)

### Generated Image Integration

When placing AI-generated images on slides:

1. **Full-bleed**: Image fills entire slide (x=0, y=0, w=10, h=5.625). Add dark overlay (40-60% opacity) if text overlays image.
2. **Half-slide**: Image occupies left or right 50% (w=5.0). Text on opposite side.
3. **Accent**: Image is 20-30% of slide (w=2-3in). Place beside or above text.
4. **Background**: Low-contrast pattern/image behind content. Ensure text remains readable.

### Color Overlay for Text-on-Image

When text must sit on an image, add a semi-transparent shape behind the text:

- Dark images: White text with dark overlay (rgba(0,0,0,0.5))
- Light images: Dark text with light overlay (rgba(255,255,255,0.7))
- Never place body text directly on busy photographs

### Visual Consistency Checklist

- [ ] All generated images include the deck's color palette
- [ ] Icon style is consistent (all flat, all outline, or all filled)
- [ ] Image aspect ratios match their containers (no stretching)
- [ ] Text over images has sufficient contrast (overlay if needed)
- [ ] Visual hierarchy is clear: headline > visual > supporting text
- [ ] No decorative images that don't communicate anything
- [ ] Maximum one dominant visual per slide (dashboard-style excluded)
