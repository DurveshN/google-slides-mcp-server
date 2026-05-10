---
name: visual-principles
description: "Core principles for making presentations visually compelling. Use before planning any slide to determine the best visual approach. AI agent should apply judgment per-slide — these are guidelines, not rigid rules."
---

# Visual Principles for Compelling Presentations

## The Core Philosophy

A presentation is not a document. Every slide should earn its place by communicating something faster, clearer, or more memorably than text alone could.

Before planning any slide, ask:
> "What is the single thing this slide needs to communicate? What is the fastest, most memorable way to show that?"

The answer is rarely a list of bullet points.

## Golden Rules

### Rule 1: Start with "What Should This SHOW?"

Do not start with "What text should go here?" Start with "What visual would make this point instantly clear?"

- Data point? Use Chart, big number, or sparkline
- Process? Use Flowchart, timeline, or step diagram
- Comparison? Use Split layout, Venn diagram, or side-by-side
- System? Use Architecture diagram
- Emotion? Use Illustration, photograph, or metaphor image
- Concept? Use Icon grid, metaphor image, or diagram

Text should support the visual, not replace it.

### Rule 2: One Idea Per Slide

If a slide communicates more than one distinct idea, split it. Each slide gets one visual concept.

Exception: Dashboard-style slides (KPI cards) can show 2-3 related metrics.

### Rule 3: Think in Visual Shortcuts

The human brain processes images 60,000x faster than text. Use visual shortcuts:

- Icon + 2 words > 1 sentence
- Diagram with arrows > paragraph explaining flow
- Big number with context > "Revenue increased by 47 percent"
- Split-screen before/after > bullet list of differences
- Timeline with milestones > "Phase 1, Phase 2, Phase 3..."

### Rule 4: Micro-Visuals Matter

You do not need a full-bleed image on every slide. Small visuals are powerful:

- Icon before a heading — anchors the concept instantly
- Color-coded accent shape behind a key metric — draws the eye
- Arrow between two text blocks — shows relationship without explanation
- Small diagram in corner — illustrates while text explains
- Progress bar or gauge — shows status visually

### Rule 5: Every Visual Must Earn Its Place

A random stock photo adds nothing. A custom-generated diagram that clarifies your architecture is invaluable.

Ask before adding any visual:
- Does this make the point clearer?
- Would the slide be weaker without it?
- Does it match the deck's color palette and style?

If no, skip it. If yes but not strong enough, regenerate with a better prompt.

### Rule 6: Text Density is a Spectrum

There is no "max 10 words" rule. Some slides need more text. The question is: does the text support or compete with the visual?

- Heavy text is okay for: legal disclaimers, detailed methodology, appendix slides
- Light text is preferred for: opening hooks, data reveals, concept explanations
- No text is powerful for: full-bleed images, diagrams that speak for themselves

Let the content dictate the density, not an arbitrary limit.

### Rule 7: Choose the Right Tool for the Job

| What you need to communicate | Best visual approach | When to use text instead |
|------------------------------|---------------------|--------------------------|
| A single striking number | Big Number template | When context is complex |
| A process or workflow | Flowchart or timeline | When steps are highly conditional |
| System architecture | Architecture diagram | When components are too numerous |
| Before/after comparison | Split-screen layout | When differences are nuanced |
| Feature list | Icon grid (3-5 max) | When features need detailed explanation |
| Emotional hook | Full-bleed image | When data is more persuasive |
| Data trend | Chart (line/bar) | When data is sparse |
| Testimonial | Quote card with photo | When attribution is critical |
| Roadmap | Timeline or milestone track | When dates are uncertain |

### Rule 8: Generated Images Must Match the Palette

Every image generated via generate_image should include the deck's color palette in the prompt. This makes the deck feel cohesive and professional.

Example prompt for a tech startup deck (palette: #0A192F / #64FFDA):
"Clean flat-design architecture diagram, dark navy #0A192F background, teal #64FFDA accents, white #FFFFFF text elements, minimalist geometric style, no gradients"

## Visual Decision Framework

For each slide, walk through this decision tree:

1. What is the ONE thing this slide must communicate?
2. Is there a visual shortcut that communicates this faster than text?
   - Yes → Use a visual template, add minimal supporting text
   - No → Use text, but add a micro-visual if it helps
3. What visual template best fits this content?
   - See planning.md for the visual template library
4. Can I make this clearer with an icon, color accent, or small diagram?
   - Yes → Add it
   - No → Keep it clean
5. Does the planned visual match the deck's color palette?
   - Yes → Proceed
   - No → Adjust the generate_image prompt to include palette colors
6. Would I want to look at this slide for 30 seconds in a presentation?
   - Yes → Good
   - No → Rethink the approach

## Anti-Patterns to Avoid

- **Wall of text**: Dense paragraphs that should be a diagram or split across slides
- **Decorative fluff**: Images that look pretty but communicate nothing
- **Bullet point addiction**: Defaulting to bullets when a visual would work better
- **Generic stock photos**: Smiling people shaking hands says nothing about your product
- **Chart junk**: 3D effects, unnecessary gridlines, too many data series
- **Inconsistent style**: Mixing photography with cartoons with diagrams without purpose
