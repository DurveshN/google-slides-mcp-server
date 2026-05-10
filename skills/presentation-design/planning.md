---
name: presentation-planning
description: "Sub-skill for translating user requirements and framework guidance into a structured DeckPlan JSON before any slide creation or MCP tool calls. Use after context detection and framework loading, before presenting the plan to the user."
---

# Presentation Planning Sub-Skill

Translate gathered user requirements and the selected framework into a structured, machine-readable DeckPlan JSON. This plan serves as the single source of truth for slide structure, content, and visual direction before any Google Slides MCP tools are invoked.

## Purpose

The planning step bridges qualitative user intent and quantitative slide execution. It forces explicit decisions about:

- What each slide must prove (action title)
- What content blocks belong on each slide
- How long the deck should be relative to duration
- Which theme and palette apply

Without this structured plan, slide creation drifts into generic layouts and unfocused content.

## Step-by-Step Workflow

1. **Analyze user requirements and detected context**
   - Audience (investors, customers, team, etc.)
   - Goal (raise money, sell, teach, inform, share data)
   - Duration (5 min, 15 min, 30 min, etc.)
   - Deck type (pitch, sales, training, conference, data)

2. **Load the appropriate framework from `frameworks.md`**
   - Locate the section matching the classified deck type
   - Extract the slide-by-slide template, action title formats, and content guidelines

3. **Load visual principles from `visual-principles.md`**
   - Review the golden rules for visual-first thinking
   - Understand the visual decision framework
   - Know the available image prompt templates from `image-prompts.md`

4. **For each slide, determine the visual approach FIRST**
   - Ask: "What is the fastest, most memorable way to SHOW this point?"
   - Choose a visual strategy before writing text content
   - Consider: diagram, chart, image, icon grid, split-screen, big number, timeline
   - If a visual shortcut exists, use it and add minimal supporting text
   - If text is the better medium, add a micro-visual (icon, accent shape, arrow)
   - Read `image-prompts.md` for the exact prompt to generate the visual

5. **Define content blocks — visual first, text supports**
   - For each slide, write an action title that states the point
   - Assign a role (e.g., `title`, `problem`, `solution`, `traction`, `team`, `closing`)
   - Define the primary visual element (image prompt, chart type, diagram description)
   - Define supporting text (headline, short bullets, metric label/value)
   - Add visual direction (layout hint, positioning, sizing)

6. **Assign a unique `id` to each slide**
   - Use the format `slide-001`, `slide-002`, etc.
   - IDs must be stable across revisions so DeckState can map them to actual Google Slide IDs later

7. **Set initial status to `planned`**
   - Every slide starts with `"status": "planned"`
   - Status transitions: `planned` → `approved` → `created` → `reviewed`

8. **Output JSON matching the schema documented in `deck-plan-schema.md`**
   - Include deck metadata (title, type, audience, goal, duration, theme, palette)
   - Include slides array with full content block definitions including visual elements
   - Include `approvalState` tracking outline and detailed plan gates

## Example DeckPlan JSON

Below is a complete DeckPlan for a 3-slide pitch deck:

```json
{
  "deckId": "deck-pitch-001",
  "title": "Acme AI Pitch",
  "type": "pitch",
  "audience": "investors",
  "goal": "raise seed funding",
  "durationMinutes": 5,
  "theme": "modern-dark",
  "palette": "indigo-coral",
  "slides": [
    {
      "id": "slide-001",
      "role": "title",
      "actionTitle": "Acme AI Cuts Customer Support Costs by 40%",
      "status": "planned",
        "contentBlocks": [
          {
            "kind": "text",
            "text": "Acme AI — Intelligent Support Automation"
          },
          {
            "kind": "text",
            "text": "Seed Round | $2M"
          }
        ],
      "visualDirection": "Full-bleed hero image with centered text overlay, dark indigo background"
    },
    {
      "id": "slide-002",
      "role": "problem",
      "actionTitle": "Support Teams Drown in Tickets, Burning Budget and Morale",
      "status": "planned",
        "contentBlocks": [
          {
            "kind": "metric",
            "label": "Average cost per ticket",
            "value": "$18"
          },
          {
            "kind": "metric",
            "label": "Tickets per agent per day",
            "value": "80+"
          },
          {
            "kind": "bullets",
            "items": [
              "Response times exceed 24 hours during peak load",
              "Agent churn reaches 35% annually",
              "Escalation paths are manual and error-prone"
            ]
          }
        ],
      "visualDirection": "Split layout: large metrics on left, bullet context on right, coral accent numbers"
    },
    {
      "id": "slide-003",
      "role": "solution",
      "actionTitle": "Acme AI Automates 70% of Tier-1 Support in 48 Hours",
      "status": "planned",
        "contentBlocks": [
          {
            "kind": "text",
            "text": "Deploys via API in under one hour with zero training data required."
          },
          {
            "kind": "bullets",
            "items": [
              "Natural-language intent detection",
              "Auto-escalation with full context handoff",
              "Real-time analytics dashboard"
            ]
          },
          {
            "kind": "metric",
            "label": "Customer satisfaction change",
            "value": "+22 NPS"
          }
        ],
      "visualDirection": "Three-column feature cards with icons, bottom metric banner in indigo"
    }
  ],
  "approvalState": {
    "outlineApproved": false,
    "detailedPlanApproved": false,
    "readyForExecution": false
  }
}
```

## Content Blocks

Each slide is composed of one or more content blocks. Choose block types that match the slide's role and the story being told.

| Block Type | Purpose | Example Usage |
|------------|---------|---------------|
| `text` | Plain text paragraph | Subtitles, explanations, short descriptions |
| `bullets` | Bullet list | Supporting points, features, risks, next steps |
| `metric` | Key number with label | Traction, market size, cost savings, growth rate |
| `table` | Rows and columns | Competitive comparison, pricing tiers, timeline |
| `image` | URL reference | Product screenshot, team photo, diagram, logo |
| `chart` | Chart type + data | Revenue growth, user acquisition, market share |
| `quote` | Pull quote with attribution | Customer testimonial, press mention, expert endorsement |

### Block Guidelines

- **One primary block per slide** — A slide should not compete for attention with three charts and a table.
- **Metrics need context** — A number without a label or comparison is meaningless. Always pair `metric` with a `text` or `bullets` block that explains why the number matters.
- **Images must have purpose** — Do not add decorative stock photos. Every `image` block should clarify or prove the action title.
- **Quotes need sources** — A `quote` block must include attribution (person, title, company) to be credible.

## File Storage Conventions

Each deck gets its own directory under `.sisyphus/slide-plans/`:

```
.sisyphus/slide-plans/{deck-name}/
  deck-plan.json      ← Generated by this sub-skill
  review.md           ← Human-readable rendering for approval
  deck-state.json     ← Generated AFTER execution by MCP tools
  execution-log.md    ← Audit trail of tool calls
```

**deck-plan.json**
- **Produced by:** This planning sub-skill
- **Contains:** Full DeckPlan JSON matching the schema documented in `deck-plan-schema.md` within this skill folder
- **Used by:** Agent before executing MCP tools
- **Naming:** Use kebab-case deck names (e.g., `q4-board-review`)

**review.md**
- **Produced by:** Agent after generating deck-plan.json
- **Contains:** Formatted markdown rendering of the plan for human approval
- **Used by:** User to review and approve before execution

**deck-state.json**
- **Produced by:** Agent AFTER executing Google Slides MCP tools
- **Contains:** Maps each `slide.id` from deck-plan.json to actual Google Slides object IDs
- **Critical:** Without this, the agent cannot update or revise slides later
- **Schema:** See the `DeckState` section in `deck-plan-schema.md` within this skill folder

**execution-log.md**
- **Produced by:** Agent during execution
- **Contains:** Timestamped log of MCP tool calls and results
- **Used by:** Agent for debugging or session resumption

## Deck-State Mapping

After executing MCP tools, the agent MUST create `deck-state.json` to persist the mapping between plan IDs and Google object IDs:

```json
{
  "presentationId": "1A2B3C4D...",
  "slides": [
    {
      "planId": "slide-001",
      "googleSlideId": "slide_abc123def456",
      "elementIds": {
        "title": "element_001",
        "metric_card_1": "element_002"
      }
    }
  ],
  "lastUpdated": "2026-05-09T10:30:00Z"
}
```

**Why this matters:**
- If the user says "update slide-003", the agent looks up `slide-003` in deck-state.json to find the actual Google Slide ID
- Without this mapping, the agent would have to search or recreate slides, causing duplication or errors
- The `elementIds` map allows updating specific text boxes, shapes, or charts without touching other elements

## Approval Gates

The agent must pause for explicit user approval at three checkpoints. Do not proceed past a gate without confirmation.

### Gate 1 — Outline Level

Present a human-readable list of slide roles and action titles only:

```
Proposed outline for your Pitch deck (3 slides, 5 minutes):

1. Title — Acme AI Cuts Customer Support Costs by 40%
2. Problem — Support Teams Drown in Tickets, Burning Budget and Morale
3. Solution — Acme AI Automates 70% of Tier-1 Support in 48 Hours

Does this outline look correct? Reply with changes or approve to continue.
```

Wait for user response. If changes are requested, revise the outline and re-present.

### Gate 2 — Detailed Plan Level

After outline approval, present the full DeckPlan JSON (or a formatted markdown rendering of it) including all content blocks and visual direction. Ask:

```
Here is the detailed plan with content blocks and visual direction for each slide.
Please review and approve, or request edits.
```

Wait for user response. If changes are requested, revise the JSON and re-present.

### Gate 3 — Before Execution

After detailed plan approval, set `approvalState.readyForExecution` to `true` and confirm once more:

```
Plan approved. I will now create the slides in Google Slides using the approved plan.
Proceed? (yes/no)
```

Only invoke Google Slides MCP tools after receiving explicit confirmation.

## Quality Checklist for Plans

Run this checklist against the DeckPlan JSON before presenting it for approval. If any item fails, revise the plan.

- [ ] **Each slide has exactly one action title stating the point**
  - Bad: "Market Analysis" (describes topic)
  - Good: "The $12B Support Automation Market Grows 34% Annually" (states the point)

- [ ] **Content blocks match the slide's role**
  - A `problem` slide should not contain a `metric` showing revenue growth unless it is framed as the incumbents' revenue at the user's expense.
  - A `title` slide should not contain a `table`.

- [ ] **Total slide count fits duration**
  - 5 minutes → 3–5 slides
  - 15 minutes → 8–12 slides
  - 30 minutes → 15–20 slides
  - 60 minutes → 20–30 slides

- [ ] **Theme and palette are specified**
  - `theme` must be defined (e.g., `modern-dark`, `clean-light`, `corporate-blue`)
  - `palette` must be defined (e.g., `indigo-coral`, `slate-emerald`)
  - Both values must exist in `design-system.md`

- [ ] **Every slide has a unique, sequential ID**
  - Format: `slide-001`, `slide-002`, ...
  - No duplicates, no gaps

- [ ] **Every content block has a recognized type**
  - Must be one of: `text`, `bullets`, `metric`, `table`, `image`, `chart`, `quote`

- [ ] **Visual direction is specific enough to guide layout choice**
  - Bad: "Looks good"
  - Good: "Split layout: large metrics on left, bullet context on right, coral accent numbers"

## References

- **Framework details**: `frameworks.md` — Slide-by-slide templates for all deck types
- **Design system**: `design-system.md` — Valid themes, palettes, fonts, and spacing rules
