---
name: deck-plan-schema
description: "Reference for the DeckPlan JSON schema. Use when building, validating, or debugging structured presentation plans."
---

# DeckPlan JSON Schema Reference

## Overview

The DeckPlan JSON is the structured intermediate representation between the `presentation-design` skill and the Google Slides MCP server. It stores everything needed to create a presentation except actual pixel coordinates.

**File location:** `.sisyphus/slide-plans/{deck-name}/deck-plan.json`

## Schema (TypeScript / Zod)

The following schemas define the shape of DeckPlan JSON. These are used for runtime validation.

```typescript
const DeckPlanSchema = z.object({
  version: z.literal("1.0"),
  deck: z.object({
    title: z.string(),
    type: z.enum(["pitch", "sales", "training", "conference", "data"]),
    audience: z.string(),
    durationMinutes: z.number().optional(),
    theme: z.string().optional(),
    slides: z.array(SlidePlanSchema),
    approval: ApprovalStateSchema,
  }),
});
```

## Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | `"1.0"` | Yes | Schema version |
| `deck` | object | Yes | Deck metadata and slides |

## Deck Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Presentation title |
| `type` | enum | Yes | `pitch`, `sales`, `training`, `conference`, `data` |
| `audience` | string | Yes | Target audience description |
| `durationMinutes` | number | No | Target duration in minutes |
| `theme` | string | No | Visual theme name (from design-system.md) |
| `slides` | SlidePlan[] | Yes | Array of slide plans |
| `approval` | ApprovalState | Yes | Approval gate state |

## SlidePlan Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Stable ID like `slide-001` |
| `role` | string | Yes | Narrative role: `title`, `problem`, `solution`, etc. |
| `actionTitle` | string | Yes | Slide title stating the point |
| `layout` | string | Yes | Layout hint for MCP tool |
| `purpose` | string | Yes | One-line why this slide exists |
| `contentBlocks` | ContentBlock[] | Yes | Array of content blocks |
| `visualDirection` | string | No | Layout/color guidance |
| `status` | enum | No | `planned`, `approved`, `executed`, `modified` |
| `notes` | string | No | Speaker notes or design notes |

## ContentBlock Union

| `kind` | Fields | Purpose |
|--------|--------|---------|
| `text` | `text: string` | Plain text paragraph |
| `bullets` | `items: string[]` | Bullet list |
| `metric` | `label`, `value`, `change?` | Key number |
| `table` | `headers`, `rows` | Tabular data |
| `image` | `url`, `alt?` | Image reference (public URL) |
| `generate_image` | `prompt: string`, `size?: string` | AI-generated image prompt for CallMissed API |
| `chart` | `chartType`, `data` | Chart data |
| `quote` | `text`, `attribution?` | Pull quote |
| `icon` | `name: string`, `label?: string` | Icon name with optional label |
| `shape` | `shapeType: string`, `color?: string` | Decorative or accent shape |

**Visual-first content blocks:**
- `generate_image` is preferred over `image` when you need a custom visual (diagram, illustration, background)
- `icon` adds micro-visuals that anchor concepts without full images
- `shape` adds color accents, backgrounds, or decorative elements

**When to use which:**
- Use `generate_image` for: diagrams, illustrations, backgrounds, cover images, metaphors
- Use `image` for: existing photos, screenshots, logos, charts from external tools
- Use `icon` for: feature lists, categorical markers, visual bullets
- Use `shape` for: accent backgrounds behind metrics, dividers, decorative elements
- Use `chart` for: data visualizations (bar, line, pie) from structured data

## ApprovalState Object

| Field | Type | Description |
|-------|------|-------------|
| `outlineApproved` | boolean | User approved outline |
| `detailApproved` | boolean | User approved detailed plan |
| `executionApproved` | boolean | User confirmed execution |

## Example

```json
{
  "version": "1.0",
  "deck": {
    "title": "Q4 Board Review",
    "type": "data-deck",
    "audience": "board",
    "durationMinutes": 20,
    "theme": "corporate-navy",
    "slides": [
      {
        "id": "slide-001",
        "role": "title-kpi-summary",
        "actionTitle": "Q4 Revenue Up 23%, Churn Down 15%",
        "layout": "title_body",
        "purpose": "Open with board-level performance summary",
        "contentBlocks": [
          { "kind": "metric", "label": "Revenue Growth", "value": "23%", "change": "+5pp YoY" }
        ],
        "visualDirection": "Large KPI cards with navy background",
        "status": "planned"
      }
    ],
    "approval": {
      "outlineApproved": true,
      "detailApproved": true,
      "executionApproved": false
    }
  }
}
```

## Validation

When producing or consuming DeckPlan JSON, validate it against the schema above:

1. **Check required fields** — `version`, `deck.title`, `deck.type`, `deck.audience`, `deck.slides`, `deck.approval`
2. **Check slide IDs** — Must be unique, sequential (slide-001, slide-002, ...)
3. **Check content block types** — Must be one of: `text`, `bullets`, `metric`, `table`, `image`, `chart`, `quote`
4. **Check approval state** — All three booleans must be present

Use a Zod schema validator in TypeScript or equivalent in your runtime.

## Related Files

- **Planning guide**: `planning.md` — How to produce DeckPlan JSON from user requirements
- **Design system**: `design-system.md` — Valid themes, palettes, fonts, and spacing rules
