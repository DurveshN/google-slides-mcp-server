---
name: image-prompts
description: "Reference for crafting effective image generation prompts for the CallMissed API. Use when planning any slide that needs a generated image, icon, diagram, or background."
---

# Image Prompt Engineering for Presentations

## The Formula

Every image prompt should include:

1. **Subject** — What is shown
2. **Style** — Flat design, 3D, photorealistic, illustration, etc.
3. **Colors** — The deck's palette hex codes (CRITICAL for cohesion)
4. **Composition** — Full-bleed, centered, split-screen, icon-grid
5. **Negative constraints** — What NOT to include

## Prompt Templates by Visual Type

### Architecture Diagram

```
Clean flat-design system architecture diagram on [BACKGROUND_COLOR] background,
central [CENTRAL_ELEMENT] connected with thin arrows to [COMPONENTS].
Each component in [PRIMARY_COLOR] boxes with [ACCENT_COLOR] icons.
[SECONDARY_COLOR] database cylinders. Minimalist, geometric, no text,
no gradients, 2D top-down view, tech startup aesthetic
```

Example:
```
Clean flat-design system architecture diagram on dark navy #0A192F background,
central API Gateway connected with thin arrows to Auth Service, User Service,
and Order Service. Each component in teal #64FFDA boxes with white icons.
Gray #1E1E1E database cylinders. Minimalist, geometric, no text, no gradients
```

### Flowchart / Process Diagram

```
Horizontal [NUM]-step flowchart on [BACKGROUND_COLOR] background,
rounded rectangles in [PRIMARY_COLOR] connected by [ACCENT_COLOR] arrows.
Step icons: [ICON_DESCRIPTION]. Clean, flat design, generous spacing,
no text labels, minimalist, left-to-right reading direction
```

Example:
```
Horizontal 3-step flowchart on white #FFFFFF background, rounded rectangles
in navy #1B2A4A connected by coral #FF6B6B arrows. Step icons: input form,
processing gear, output chart. Clean flat design, no text labels
```

### Comparison / Before-After Split

```
Split-screen [ORIENTATION] layout, left half [LEFT_COLOR] showing [LEFT_CONCEPT],
right half [RIGHT_COLOR] showing [RIGHT_CONCEPT]. Clean dividing line in [ACCENT_COLOR].
Flat geometric shapes, no text, no gradients, minimalist infographic style
```

Example:
```
Split-screen vertical layout, left half dark gray #2D2D2D showing broken chain
links, right half bright green #00C853 showing connected chain links.
Clean dividing line in white #FFFFFF. Flat geometric shapes, no text,
minimalist infographic style
```

### Icon Grid

```
Grid of [NUM] minimalist icons on [BACKGROUND_COLOR] background,
uniform size, [PRIMARY_COLOR] icons with [ACCENT_COLOR] accent details.
Flat 2D style, consistent stroke width, no text labels, clean spacing,
Material Design inspired
```

Example:
```
Grid of 4 minimalist icons on white #FAFAFA background, uniform size,
dark blue #003366 icons with coral #FF6B6B accent details. Flat 2D style,
consistent stroke width, no text labels, Material Design inspired
```

### Big Number / Metric Background

```
Abstract geometric background for metric display, [PRIMARY_COLOR] base
with [ACCENT_COLOR] accent shapes. Subtle texture, no text, space for
large number overlay, clean, modern, corporate style
```

Example:
```
Abstract geometric background for metric display, dark navy #1B2A4A base
with electric blue #4A90D9 accent shapes and light rays. Subtle texture,
no text, space for large number overlay, clean modern corporate style
```

### Full-Bleed Cover Image

```
Cinematic [STYLE] image representing [CONCEPT], [COLOR_MOOD] tones,
[PRIMARY_COLOR] and [ACCENT_COLOR] color grading. Professional lighting,
high detail, 16:9 aspect ratio, space for text overlay in [AREA_OF_IMAGE],
mood: [EMOTION]
```

Example:
```
Cinematic aerial photograph of a modern city skyline at dusk, deep navy #0A192F
and teal #64FFDA tones. Professional lighting, high detail, 16:9 aspect ratio,
space for text overlay in upper third, mood: futuristic and optimistic
```

### Timeline / Roadmap

```
Horizontal timeline with [NUM] milestones on [BACKGROUND_COLOR] background,
[PRIMARY_COLOR] timeline bar, [ACCENT_COLOR] milestone markers.
Flat design, top-down or isometric view, no text labels, clean spacing,
corporate infographic style
```

Example:
```
Horizontal timeline with 4 milestones on light gray #F5F5F5 background,
dark blue #003366 timeline bar, coral #FF6B6B circular milestone markers.
Flat design, no text labels, clean corporate infographic style
```

### Quote Card Background

```
[STYLE] background for quote display, [PRIMARY_COLOR] base with
[SECONDARY_COLOR] subtle texture. Centered negative space for text,
elegant, minimal, no text in image itself
```

Example:
```
Abstract fluid art background for quote display, deep purple #2E0854 base
with gold #FFD700 subtle texture and light accents. Centered negative space
for text, elegant, minimal, no text in image
```

### Template / Section Divider Background

```
Abstract geometric pattern for presentation background, [PRIMARY_COLOR]
base with [ACCENT_COLOR] subtle shapes. Low contrast, not distracting,
space for text overlay, repeating pattern, corporate professional style
```

Example:
```
Abstract geometric pattern for presentation background, dark navy #1B2A4A
base with subtle electric blue #4A90D9 hexagonal shapes. Low contrast,
not distracting, space for text overlay, repeating pattern
```

## Color Palette Insertion Guide

Always embed the deck's colors into prompts. Here are common palette combinations:

| Palette Name | Primary | Secondary | Accent | Use In Prompts |
|-------------|---------|-----------|--------|----------------|
| Corporate Navy | #1B2A4A | #FFFFFF | #4A90D9 | navy blue background, white text, blue accent |
| Tech Startup | #0A192F | #F8F9FA | #64FFDA | dark background, light gray, teal accent |
| Creative | #FAFAFA | #F0F0F0 | #FF6B6B | light background, coral accent |
| Minimalist | #FFFFFF | #F8F9FA | #212529 | white, light gray, dark text |
| Bold | #000000 | #FFFFFF | #FFD700 | black, white, gold accent |
| Dark Mode | #121212 | #1E1E1E | #BB86FC | dark background, purple accent |
| Finance | #1E1E1E | #F5F5F5 | #00C853 | dark gray, light gray, green accent |
| Healthcare | #FFFFFF | #E8F4F8 | #2E8B8B | white, light blue, teal accent |

## CallMissed API Parameters

- Model: flux-2-klein-9b
- Sizes: 512x512 (icons), 1024x1024 (standard), 1024x1536 (portrait), 1536x1024 (landscape)
- Response: base64 PNG
- After generation: upload to Drive via generate_image tool to get public URL

## Best Practices

1. **No text in generated images** — Add text via add_text_box after placing the image
2. **Specify "no gradients"** unless you want them — AI tends to add gradients
3. **Specify "flat design"** for professional decks — keeps style consistent
4. **Always include background color** — prevents white-background images clashing with dark slides
5. **Use "minimalist" and "clean"** to reduce visual noise
6. **Specify aspect ratio in prompt** even though API accepts sizes — helps the model compose correctly
7. **Generate multiple options** if first result is not perfect
8. **Reuse prompt patterns** across slides for consistency
