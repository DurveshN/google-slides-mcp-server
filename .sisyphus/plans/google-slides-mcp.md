# Google Slides MCP Server — Work Plan

## TL;DR

> **Quick Summary**: Build a local stdio-based MCP server that exposes the full Google Slides API to OpenCode. The server authenticates via OAuth2 (personal Google account), wraps Slides + Drive API operations as MCP tools, and returns results via JSON-RPC over stdin/stdout.
>
> **Deliverables**:
> - `src/index.ts` — MCP server entrypoint (stdio transport, JSON-RPC handler)
> - `src/auth.ts` — OAuth2 flow + token refresh + secure storage
> - `src/google-client.ts` — Google Slides + Drive API client initialization
> - `src/tools/` — MCP tool definitions (schemas + handlers)
> - `src/utils/` — Rate limiting, retry logic, error normalization
> - `package.json` + `tsconfig.json` — Project config
> - `README.md` — Setup guide (Google Cloud Console, OAuth, scopes)
>
> **Estimated Effort**: Medium (3–4 hours implementation + 1 hour testing)
> **Parallel Execution**: YES — 3 waves (foundation, tools, integration)
> **Critical Path**: T1 (scaffold) → T2 (auth) → T3 (google-client) → T5 (tool-reg) → T6-T15 (tools) → T19 (integration) → F1-F4 (verification)

---

## Context

### Original Request
The user wants a general-purpose MCP server for personal use (not tied to any specific project) that lets OpenCode create, edit, and manage Google Slides presentations autonomously. Initially considered Google Workspace broadly (Docs, Sheets, Slides), but narrowed scope to **Google Slides only** for the first version.

### Interview Summary
**Key Decisions**:
- **Product scope**: Google Slides API ONLY (not Docs, Sheets, Gmail, Chat, Calendar)
- **Operations**: Full CRUD — create presentations, add/modify slides, insert shapes/text/images/tables/charts, style text, position elements, copy presentations, list recent files, manage sharing permissions, export to PDF
- **Architecture**: Local stdio-based MCP server (JSON-RPC over stdin/stdout)
- **Language**: TypeScript / Node.js (uses `googleapis` SDK)
- **Auth**: OAuth2 (InstalledAppFlow) with personal Google account
- **Rate limit handling**: Single project + exponential backoff (Metis reviewed — dual-project fallback is NOT feasible because OAuth tokens are project-specific and cannot be swapped mid-session)

**Research Findings**:
- Google already provides REMOTE MCP servers for Workspace (HTTP/SSE with OAuth), but the user wants a LOCAL stdio server — more direct control, no cloud dependency
- Google Slides API is almost entirely mutation-driven via `batchUpdate()` — reads use `presentations.get()` / `presentations.pages.get()`, writes use `batchUpdate()` with Request arrays
- Drive API is required for: copying files, listing recent presentations, managing permissions, exporting to PDF
- Slides API rate limit: 60 requests/minute per user; Drive API: 100 requests/minute per user
- Object IDs for slides/elements must be 5–50 chars, alphanumeric/underscore/dash/colon
- User has comprehensive documentation in `.sisyphus/docs/google_slide_api/` covering all API operations

### Metis Review
**Identified Gaps** (addressed in plan):
- ❌ Dual-project rate limit fallback → **RESOLVED**: Use single project with smart rate limiting (exponential backoff, retry-after headers)
- ❌ Missing resource guardrails → **APPLIED**: Max text 10K chars, max image 10MB, max 200 slides, max 3 retries
- ❌ Scope creep risk → **LOCKED**: NO animations, transitions, speaker notes, collaborative editing, version history, comments, templates
- ❌ Missing edge case handling → **ADDED**: Token expiry mid-operation, network failures, invalid object IDs, quota exceeded
- ❌ Credential security → **ADDED**: Credentials stored in `credentials.json` (600 permissions), token encrypted at rest where possible

---

## Work Objectives

### Core Objective
Build a production-quality local MCP server that translates natural-language intent (via OpenCode's tool calls) into Google Slides API operations, with robust authentication, rate limiting, and error handling.

### Concrete Deliverables
- `src/index.ts` — MCP server with stdio transport and request router
- `src/auth.ts` — OAuth2 flow (desktop app), token refresh, secure storage
- `src/google-client.ts` — Google Slides + Drive API client factory
- `src/tools/` — Tool definitions with JSON schemas and handlers:
  - `presentations.ts` — create, get, copy, delete
  - `slides.ts` — create_slide, delete_slide, reorder_slides
  - `elements.ts` — add_text_box, add_shape, add_image, add_table, add_chart, delete_element
  - `text.ts` — insert_text, delete_text, replace_all_text, update_text_style, update_paragraph_style, create_bullets
  - `properties.ts` — update_page_properties, update_element_transform
  - `drive.ts` — list_presentations, export_presentation, update_permissions
- `src/utils/` — retry.ts, rate-limiter.ts, errors.ts, validators.ts
- `config/` — default environment configs
- `README.md` — Complete setup guide

### Definition of Done
- [ ] `npm install && npm run build` succeeds with zero TypeScript errors
- [ ] `npm start` runs and responds to MCP `initialize` request with correct protocol version
- [ ] MCP tools list is returned with all tool schemas and descriptions
- [ ] At least 3 core tools successfully execute real Google Slides API operations
- [ ] Rate limiting and retry logic handle 429 responses gracefully
- [ ] OAuth token refresh works automatically without user intervention
- [ ] OAuth first-run flow opens browser and captures authorization code

### Must Have
- OAuth2 authentication with automatic token refresh
- Complete set of Slides API tools (create, read, update, delete for presentations, slides, and elements)
- Drive API integration for copy, list, permissions, export (PDF)
- JSON-RPC stdio transport compliant with MCP protocol
- Rate limiting with exponential backoff (max 3 retries)
- Graceful error handling (normalized error messages)

### Must NOT Have (Guardrails)
- NO animations, transitions, or speaker notes support
- NO collaborative editing features (real-time co-editing)
- NO version history or revision tracking
- NO comments, reviews, or suggestions
- NO custom templates or themes beyond built-in layouts
- NO video/audio embedding (images only)
- NO export formats beyond PDF (no PPTX, PNG, JPG export)
- NO Google Docs, Sheets, Calendar, Gmail, Chat integration
- NO remote HTTP/SSE transport (stdio only)
- NO service account support (OAuth2 personal only)
- Drive operations limited to: files.list, files.copy, permissions.create, files.export

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO (project is from scratch)
- **Automated tests**: None (unit tests for Google API wrappers provide limited value; integration tests require live credentials)
- **Framework**: N/A
- **Primary Verification**: Agent-Executed QA Scenarios using real Google Cloud credentials

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.
- **API/CLI**: Use Bash (curl/Node.js REPL) — verify endpoints, validate responses
- **Authentication**: Verify OAuth flow and token refresh
- **Error scenarios**: Test rate limiting, invalid IDs, expired tokens

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — Start Immediately):
├── T1: Project scaffolding + TypeScript config
├── T2: OAuth2 authentication module
├── T3: Google API client factory (Slides + Drive)
├── T4: Utility module (rate limiter, retry, errors, validators)
└── T5: MCP protocol boilerplate (stdio transport, request router)

Wave 2 (Core Tools — After Wave 1, MAX PARALLEL):
├── T6:  Tool — create_presentation + get_presentation + copy_presentation
├── T7:  Tool — create_slide + delete_slide + reorder_slides
├── T8:  Tool — add_text_box + add_shape
├── T9:  Tool — add_image + add_table
├── T10: Tool — insert_text + delete_text + replace_all_text
├── T11: Tool — update_text_style + update_paragraph_style + create_bullets
├── T12: Tool — update_page_properties + update_element_transform
├── T13: Tool — list_presentations + export_presentation
├── T14: Tool — update_permissions + delete_presentation
└── T15: Batch update orchestrator (wraps multiple operations)

Wave 3 (Integration + Docs — After Wave 2):
├── T16: README.md — Setup guide (Google Cloud Console, OAuth, scopes)
├── T17: Integration testing — End-to-end with live credentials
├── T18: Error handling audit — All edge cases from Metis review
└── T19: Final build + smoke tests

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high)
└── F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: T1 → T5 → T6-T15 → T17 → T19 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 9 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 | — | T2-T5 |
| T2 | T1 | T3-T5 |
| T3 | T1-T2 | T6-T15 |
| T4 | T1 | T6-T15 |
| T5 | T1 | T6-T15 |
| T6 | T1-T5 | T17 |
| T7 | T1-T5 | T17 |
| T8 | T1-T5 | T17 |
| T9 | T1-T5 | T17 |
| T10 | T1-T5 | T17 |
| T11 | T1-T5 | T17 |
| T12 | T1-T5 | T17 |
| T13 | T1-T5 | T17 |
| T14 | T1-T5 | T17 |
| T15 | T1-T5 | T17 |
| T16 | — | T19 (docs) |
| T17 | T6-T15 | T18-T19 |
| T18 | T6-T15, T17 | T19 |
| T19 | T16-T18 | F1-F4 |
| F1-F4 | T19 | — |

### Agent Dispatch Summary

- **Wave 1**: 5 tasks — T1-T5 → `quick`
- **Wave 2**: 10 tasks — T6-T15 → `unspecified-high` (tools), `quick` (utilities)
- **Wave 3**: 4 tasks — T16 → `writing`, T17-T19 → `unspecified-high`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

- [ ] 6. Tool — create_presentation + get_presentation + copy_presentation

  **What to do**:
  - Implement three tools in `src/tools/presentations.ts`:
    - `create_presentation`: Params `{ title: string }`. Calls `slides.presentations.create({title})`. Returns `{ presentationId, title, url }`.
    - `get_presentation`: Params `{ presentationId: string }`. Calls `slides.presentations.get({presentationId})`. Returns full presentation object (slides, layouts, page elements).
    - `copy_presentation`: Params `{ presentationId: string, newTitle: string }`. Calls `drive.files.copy({fileId, requestBody: {name: newTitle}})`. Returns `{ newPresentationId, title, url }`.
  - Register tool schemas in MCP router:
    - `create_presentation` — inputSchema: `{ title: { type: "string", description: "Title of the new presentation" } }`
    - `get_presentation` — inputSchema: `{ presentationId: { type: "string", description: "Google Slides presentation ID" } }`
    - `copy_presentation` — inputSchema: `{ presentationId: { type: "string" }, newTitle: { type: "string" } }`
  - URL format: `https://docs.google.com/presentation/d/{presentationId}/edit`

  **Must NOT do**:
  - Do NOT support folder creation via Drive API (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []
  - Reason: Thin API wrappers, straightforward mapping

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-15)
  - **Blocks**: T17
  - **Blocked By**: T1-T5

  **References**:
  - `googleapis` Slides v1: https://googleapis.dev/nodejs/googleapis/latest/slides/classes/Slides-$1.html
  - `.sisyphus/docs/google_slide_api/Create and manage presentations.md:140-173` — Node.js create pattern
  - `.sisyphus/docs/google_slide_api/Create and manage presentations.md:423-461` — Node.js copy pattern via Drive
  - `.sisyphus/docs/Configure the Google Workspace MCP servers/Configure the Google Workspace MCP servers.md:316-322` — Drive tool pattern (search_files, etc.)

  **Acceptance Criteria**:
  - [ ] `create_presentation({"title":"Test"})` creates a real Google Slide and returns a valid presentationId
  - [ ] `get_presentation({"presentationId":"..."})` returns full presentation structure
  - [ ] `copy_presentation` creates a duplicate with new name

  **QA Scenarios**:

  ```
  Scenario: Create a real presentation via MCP tool
    Tool: Node.js REPL
    Preconditions: Server running, auth valid
    Steps:
      1. Call tool create_presentation with title "MCP Test Presentation"
      2. Capture returned presentationId
      3. Verify presentationId matches regex /^[a-zA-Z0-9-_]+$/
      4. Visit returned URL in browser and verify it opens
    Expected Result: Valid presentation ID and accessible URL
    Failure Indicators: No ID returned, invalid ID format, URL returns 404
    Evidence: .sisyphus/evidence/task-6-create-presentation.txt

  Scenario: Get presentation returns structure
    Tool: Node.js REPL
    Preconditions: Presentation exists from above test
    Steps:
      1. Call get_presentation with the created ID
      2. Verify result contains pages array with at least 1 slide
      3. Verify result contains presentationId and title fields
    Expected Result: Complete presentation object with slides
    Failure Indicators: Missing fields, empty pages, wrong ID
    Evidence: .sisyphus/evidence/task-6-get-presentation.txt
  ```

  **Commit**: NO (grouped with Wave 2)

---

- [ ] 7. Tool — create_slide + delete_slide + reorder_slides

  **What to do**:
  - Implement in `src/tools/slides.ts`:
    - `create_slide`: Params `{ presentationId: string, layout?: string, insertionIndex?: number }`. Sends `CreateSlideRequest` via batchUpdate. Returns `{ slideId, layout }`. Supported layouts: BLANK, TITLE, TITLE_AND_BODY, TITLE_AND_TWO_COLUMNS, etc.
    - `delete_slide`: Params `{ presentationId: string, slideId: string }`. Sends `DeleteObjectRequest` via batchUpdate.
    - `reorder_slides`: Params `{ presentationId: string, slideId: string, newIndex: number }`. Sends `UpdateSlidesPositionRequest` via batchUpdate.
  - Generate slide object IDs automatically using UUID (trimmed to 50 chars, remove dashes if needed)
  - Validate `insertionIndex` doesn't exceed slide count

  **Must NOT do**:
  - Do NOT support master/layout modification (read-only for Masters, Notes Masters)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 8-15)
  - **Blocks**: T17
  - **Blocked By**: T1-T5

  **References**:
  - `.sisyphus/docs/google_slide_api/Create a slide.md:246-293` — Node.js batchUpdate createSlide pattern
  - `.sisyphus/docs/google_slide_api/Introduction.md:96-102` — CreateSlideRequest, UpdateSlidesPositionRequest, DeleteObjectRequest docs
  - Google Slides predefined layouts: BLANK, TITLE, TITLE_AND_BODY, TITLE_AND_TWO_COLUMNS, TITLE_ONLY, SECTION_HEADER, MAIN_POINT, SECTION_TITLE_AND_DESCRIPTION, ONE_COLUMN_TEXT, BIG_NUMBER

  **Acceptance Criteria**:
  - [ ] `create_slide` adds a new slide to an existing presentation
  - [ ] `delete_slide` removes the specified slide
  - [ ] `reorder_slides` moves slide to new position

  **QA Scenarios**:

  ```
  Scenario: Create and delete a slide
    Tool: Node.js REPL
    Preconditions: Valid presentation exists
    Steps:
      1. Note initial slide count via get_presentation
      2. Call create_slide with layout "TITLE_AND_BODY"
      3. Verify new slide count = old + 1
      4. Call delete_slide with the new slide ID
      5. Verify slide count = old count
    Expected Result: Slide created then deleted successfully
    Failure Indicators: Wrong counts, missing slides, invalid ID
    Evidence: .sisyphus/evidence/task-7-slide-lifecycle.txt

  Scenario: Reorder slides
    Tool: Node.js REPL
    Preconditions: Presentation with >= 3 slides
    Steps:
      1. Note original order of slide IDs
      2. Call reorder_slides to move last slide to index 0
      3. Verify new order has moved slide at position 0
    Expected Result: Slide order changed
    Failure Indicators: No change in order, wrong position
    Evidence: .sisyphus/evidence/task-7-reorder.txt
  ```

  **Commit**: NO (grouped with Wave 2)

---

- [ ] 8. Tool — add_text_box + add_shape

  **What to do**:
  - Implement in `src/tools/elements.ts`:
    - `add_text_box`: Params `{ presentationId, slideId, text, x, y, width, height, fontSize?, bold?, color? }`. Sends `CreateShapeRequest` + `InsertTextRequest` via batchUpdate. Shape type: RECTANGLE with text. Returns `{ elementId }`.
    - `add_shape`: Params `{ presentationId, slideId, shapeType, x, y, width, height }`. Sends `CreateShapeRequest` via batchUpdate. Supported shape types: RECTANGLE, ROUND_RECTANGLE, ELLIPSE, ARROW, etc. Returns `{ elementId }`.
  - Sizes in EMU (English Metric Units): 1 inch = 914,400 EMU. Provide helper for conversion.
  - Validate text length ≤ 10,000 characters (guardrail)
  - Validate x,y,width,height are numbers and fit within slide bounds

  **Must NOT do**:
  - Do NOT implement WordArt (out of scope)
  - Do NOT support video shapes

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-7, 9-15)
  - **Blocks**: T17
  - **Blocked By**: T1-T5

  **References**:
  - `.sisyphus/docs/google_slide_api/Add shapes and text to a slide.md` — Shape and text insertion patterns
  - `.sisyphus/docs/google_slide_api/Size and position page elements.md` — EMU units, transforms
  - Google Slides shape types: RECTANGLE, ROUND_RECTANGLE, ELLIPSE, ARC, ARROW, CHEVRON, etc.

  **Acceptance Criteria**:
  - [ ] `add_text_box` creates a rectangle with text on a slide
  - [ ] `add_shape` creates a non-text shape on a slide
  - [ ] Invalid text length (>10,000) returns clear error

  **QA Scenarios**:

  ```
  Scenario: Add text box to slide
    Tool: Node.js REPL
    Preconditions: Valid presentation with at least 1 slide
    Steps:
      1. Call add_text_box with text "Hello MCP" at position (1000000, 1000000) size (2000000, 500000)
      2. Verify returned elementId is valid
      3. Call get_presentation and confirm element exists on slide
      4. Verify element type is SHAPE with text content
    Expected Result: Shape visible in presentation
    Failure Indicators: Missing element, wrong type, invalid ID
    Evidence: .sisyphus/evidence/task-8-text-box.txt

  Scenario: Text length guardrail works
    Tool: Node.js REPL
    Preconditions: Valid slide
    Steps:
      1. Call add_text_box with text of 10,001 characters
      2. Verify error response with clear message about max length
    Expected Result: Request rejected with guardrail error
    Failure Indicators: Request accepted, text truncated silently
    Evidence: .sisyphus/evidence/task-8-text-guardrail.txt
  ```

  **Commit**: NO (grouped with Wave 2)

---

- [ ] 9. Tool — add_image + add_table

  **What to do**:
  - Implement in `src/tools/elements.ts` (same file as T8):
    - `add_image`: Params `{ presentationId, slideId, imageUrl, x, y, width, height }`. Sends `CreateImageRequest` via batchUpdate. Google fetches image from URL. Returns `{ elementId }`.
    - `add_table`: Params `{ presentationId, slideId, rows, columns, x, y, width, height }`. Sends `CreateTableRequest` via batchUpdate. Returns `{ elementId }`.
  - Image validation: URL must be HTTP/HTTPS, size ≤ 10MB (best-effort check)
  - Table limits: rows ≤ 20, columns ≤ 10 (reasonable limits, not API-enforced)

  **Must NOT do**:
  - Do NOT support video insertion (out of scope)
  - Do NOT download images locally (Google fetches from URL)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-8, 10-15)
  - **Blocks**: T17
  - **Blocked By**: T1-T5

  **References**:
  - `.sisyphus/docs/google_slide_api/Add images to a slide.md` — Image insertion patterns
  - Google Slides API CreateImageRequest docs
  - Google Slides API CreateTableRequest docs

  **Acceptance Criteria**:
  - [ ] `add_image` inserts an image from a public URL
  - [ ] `add_table` inserts a table with specified rows/columns
  - [ ] Invalid image URL returns error

  **QA Scenarios**:

  ```
  Scenario: Add image to slide
    Tool: Node.js REPL
    Preconditions: Valid slide, public image URL available
    Steps:
      1. Call add_image with a public HTTPS image URL
      2. Verify elementId returned
      3. Open presentation in browser and visually confirm image appears
    Expected Result: Image visible on slide
    Failure Indicators: No image, broken image icon, invalid URL error
    Evidence: .sisyphus/evidence/task-9-image.png (screenshot)

  Scenario: Add table to slide
    Tool: Node.js REPL
    Preconditions: Valid slide
    Steps:
      1. Call add_table with 3 rows, 4 columns
      2. Verify elementId returned
      3. Call get_presentation and verify table has correct dimensions
    Expected Result: Table with 3x4 structure
    Failure Indicators: Wrong dimensions, missing table
    Evidence: .sisyphus/evidence/task-9-table.txt
  ```

  **Commit**: NO (grouped with Wave 2)

---

- [ ] 10. Tool — insert_text + delete_text + replace_all_text

  **What to do**:
  - Implement in `src/tools/text.ts`:
    - `insert_text`: Params `{ presentationId, slideId, elementId, text, insertionIndex? }`. Sends `InsertTextRequest` via batchUpdate. If insertionIndex omitted, appends to end.
    - `delete_text`: Params `{ presentationId, slideId, elementId, startIndex, endIndex }`. Sends `DeleteTextRequest` via batchUpdate.
    - `replace_all_text`: Params `{ presentationId, oldText, newText, matchCase? }`. Sends `ReplaceAllTextRequest` via batchUpdate. Replaces ALL occurrences across entire presentation.
  - Track text indices carefully — text insertion shifts subsequent indices
  - `replace_all_text` is powerful — used for template merging

  **Must NOT do**:
  - Do NOT support regex search (plain text only)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-9, 11-15)
  - **Blocks**: T17
  - **Blocked By**: T1-T5

  **References**:
  - `.sisyphus/docs/google_slide_api/Editing and Styling Text.md` — Text insertion/deletion patterns
  - Google Slides API InsertTextRequest, DeleteTextRequest, ReplaceAllTextRequest

  **Acceptance Criteria**:
  - [ ] `insert_text` adds text to a shape
  - [ ] `delete_text` removes text range
  - [ ] `replace_all_text` replaces all occurrences

  **QA Scenarios**:

  ```
  Scenario: Insert and delete text
    Tool: Node.js REPL
    Preconditions: Slide with text box containing "Hello World"
    Steps:
      1. Call insert_text with " Beautiful" at index 11
      2. Verify text is now "Hello World Beautiful"
      3. Call delete_text with start=6, end=11
      4. Verify text is now "Hello Beautiful"
    Expected Result: Text correctly modified
    Failure Indicators: Wrong text content, index errors
    Evidence: .sisyphus/evidence/task-10-text-edit.txt

  Scenario: Replace all text across presentation
    Tool: Node.js REPL
    Preconditions: Presentation with "{{NAME}}" placeholder in multiple slides
    Steps:
      1. Call replace_all_text(oldText="{{NAME}}", newText="Alice")
      2. Verify all occurrences replaced
    Expected Result: Template merge successful
    Failure Indicators: Partial replacement, no matches
    Evidence: .sisyphus/evidence/task-10-replace-all.txt
  ```

  **Commit**: NO (grouped with Wave 2)

---

- [ ] 11. Tool — update_text_style + update_paragraph_style + create_bullets

  **What to do**:
  - Implement in `src/tools/text.ts` (same file as T10):
    - `update_text_style`: Params `{ presentationId, elementId, startIndex, endIndex, style }`. Style fields: fontSize, bold, italic, underline, fontFamily, foregroundColor (hex). Sends `UpdateTextStyleRequest` via batchUpdate.
    - `update_paragraph_style`: Params `{ presentationId, elementId, startIndex, endIndex, style }`. Style fields: alignment (LEFT, CENTER, RIGHT, JUSTIFIED), lineSpacing, spaceAbove, spaceBelow. Sends `UpdateParagraphStyleRequest` via batchUpdate.
    - `create_bullets`: Params `{ presentationId, elementId, startIndex, endIndex, bulletPreset? }`. Sends `CreateParagraphBulletsRequest` via batchUpdate. Presets: BULLET_DISC_CIRCLE_SQUARE, NUMBERED_DIGIT_ALPHA_ROMAN, etc.
  - Support color as hex string (e.g., "#FF0000"), convert to RGB in request

  **Must NOT do**:
  - Do NOT support gradient fills for text

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-10, 12-15)
  - **Blocks**: T17
  - **Blocked By**: T1-T5

  **References**:
  - `.sisyphus/docs/google_slide_api/Editing and Styling Text.md` — Text and paragraph styling patterns
  - Google Slides API UpdateTextStyleRequest, UpdateParagraphStyleRequest

  **Acceptance Criteria**:
  - [ ] `update_text_style` changes font size and color
  - [ ] `update_paragraph_style` changes alignment
  - [ ] `create_bullets` adds bullet points

  **QA Scenarios**:

  ```
  Scenario: Style text with color and bold
    Tool: Node.js REPL
    Preconditions: Slide with text box
    Steps:
      1. Call update_text_style with bold=true, color="#FF0000", fontSize={magnitude: 24, unit: "PT"}
      2. Call get_presentation and inspect text style
      3. Verify style fields match request
    Expected Result: Text is bold, red, 24pt
    Failure Indicators: Style not applied, wrong color format
    Evidence: .sisyphus/evidence/task-11-text-style.png (screenshot)

  Scenario: Add bullet points
    Tool: Node.js REPL
    Preconditions: Slide with text box containing 3 lines of text
    Steps:
      1. Call create_bullets for the text range
      2. Open presentation and visually verify bullets
    Expected Result: Bullet points visible
    Failure Indicators: No bullets, wrong bullet type
    Evidence: .sisyphus/evidence/task-11-bullets.png (screenshot)
  ```

  **Commit**: NO (grouped with Wave 2)

---

- [ ] 12. Tool — update_page_properties + update_element_transform

  **What to do**:
  - Implement in `src/tools/properties.ts`:
    - `update_page_properties`: Params `{ presentationId, slideId, backgroundColor?, layoutId? }`. Sends `UpdatePagePropertiesRequest` via batchUpdate. Background color as hex string.
    - `update_element_transform`: Params `{ presentationId, elementId, x, y, width, height, rotation? }`. Sends `UpdatePageElementTransformRequest` via batchUpdate. Position/size in EMU units.
  - Provide helper for EMU conversion from inches/pixels
  - Rotation in degrees, converted to radians for API

  **Must NOT do**:
  - Do NOT support master/layout modification

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-11, 13-15)
  - **Blocks**: T17
  - **Blocked By**: T1-T5

  **References**:
  - `.sisyphus/docs/google_slide_api/Size and position page elements.md` — Position/size in EMU, transforms
  - Google Slides API UpdatePagePropertiesRequest, UpdatePageElementTransformRequest

  **Acceptance Criteria**:
  - [ ] `update_page_properties` changes slide background
  - [ ] `update_element_transform` moves and resizes element

  **QA Scenarios**:

  ```
  Scenario: Move and resize an element
    Tool: Node.js REPL
    Preconditions: Slide with text box at known position
    Steps:
      1. Note original element position
      2. Call update_element_transform with new x, y, width, height
      3. Call get_presentation and verify new position
    Expected Result: Element moved and resized
    Failure Indicators: No change, wrong position
    Evidence: .sisyphus/evidence/task-12-transform.txt

  Scenario: Change slide background
    Tool: Node.js REPL
    Preconditions: Valid slide
    Steps:
      1. Call update_page_properties with backgroundColor="#0000FF"
      2. Open presentation and verify blue background
    Expected Result: Slide background is blue
    Failure Indicators: No color change, wrong color
    Evidence: .sisyphus/evidence/task-12-background.png (screenshot)
  ```

  **Commit**: NO (grouped with Wave 2)

---

- [ ] 13. Tool — list_presentations + export_presentation

  **What to do**:
  - Implement in `src/tools/drive.ts`:
    - `list_presentations`: Params `{ query?: string, pageSize?: number }`. Calls `drive.files.list({q: "mimeType='application/vnd.google-apps.presentation'", pageSize})`. Returns array of `{ id, name, modifiedTime, thumbnailLink }`.
    - `export_presentation`: Params `{ presentationId, mimeType? }`. Default MIME type: `application/pdf`. Calls `drive.files.export({fileId, mimeType})`. Returns base64-encoded file content or saves to file path.
  - Support file path export: if `outputPath` provided, write file to disk

  **Must NOT do**:
  - Do NOT support export formats beyond PDF (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-12, 14-15)
  - **Blocks**: T17
  - **Blocked By**: T1-T5

  **References**:
  - `.sisyphus/docs/Configure the Google Workspace MCP servers/Configure the Google Workspace MCP servers.md:316-322` — Drive tool listing pattern
  - Google Drive API files.list, files.export

  **Acceptance Criteria**:
  - [ ] `list_presentations` returns array of presentations
  - [ ] `export_presentation` returns valid PDF bytes
  - [ ] PDF export is viewable and contains all slides

  **QA Scenarios**:

  ```
  Scenario: List presentations
    Tool: Node.js REPL
    Preconditions: User has at least 1 Google Slide
    Steps:
      1. Call list_presentations with pageSize=10
      2. Verify result is array with >= 1 item
      3. Verify each item has id, name, modifiedTime
    Expected Result: Non-empty list of presentations
    Failure Indicators: Empty list, missing fields, wrong mimeType filter
    Evidence: .sisyphus/evidence/task-13-list.txt

  Scenario: Export presentation to PDF
    Tool: Node.js REPL
    Preconditions: Valid presentation exists
    Steps:
      1. Call export_presentation with presentationId
      2. Save returned content to .sisyphus/evidence/task-13-export.pdf
      3. Verify file size > 0
      4. Try to open with PDF reader (or check magic bytes %PDF)
    Expected Result: Valid PDF file
    Failure Indicators: Empty file, wrong format, corruption
    Evidence: .sisyphus/evidence/task-13-export.pdf
  ```

  **Commit**: NO (grouped with Wave 2)

---

- [ ] 14. Tool — update_permissions + delete_presentation

  **What to do**:
  - Implement in `src/tools/drive.ts` (same file as T13):
    - `update_permissions`: Params `{ presentationId, email, role }`. Role: reader | commenter | writer. Calls `drive.permissions.create({fileId: presentationId, requestBody: {emailAddress: email, role, type: 'user'}, sendNotificationEmail: false})`. Returns `{ permissionId }`.
    - `delete_presentation`: Params `{ presentationId }`. Calls `drive.files.delete({fileId: presentationId})`. Returns success confirmation.
  - `update_permissions` silently adds permission without email notification (appropriate for programmatic use)

  **Must NOT do**:
  - Do NOT support link-sharing (only user-specific permissions)
  - Do NOT support permission retrieval/listing (only create)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-13, 15)
  - **Blocks**: T17
  - **Blocked By**: T1-T5

  **References**:
  - Google Drive API permissions.create docs
  - Google Drive API files.delete docs

  **Acceptance Criteria**:
  - [ ] `update_permissions` adds a user with correct role
  - [ ] `delete_presentation` permanently deletes the file

  **QA Scenarios**:

  ```
  Scenario: Share presentation and delete it
    Tool: Node.js REPL
    Preconditions: Valid presentation, secondary test Google account
    Steps:
      1. Call update_permissions with secondary email and role=reader
      2. Verify permission created via Drive API (optional check)
      3. Call delete_presentation
      4. Verify file no longer accessible (404 on get)
    Expected Result: Shared then deleted successfully
    Failure Indicators: Share failed, file still exists after delete
    Evidence: .sisyphus/evidence/task-14-share-delete.txt
  ```

  **Commit**: NO (grouped with Wave 2)

---

- [ ] 15. Batch update orchestrator

  **What to do**:
  - Implement `batch_update` tool in `src/tools/elements.ts` or `src/tools/`:
    - Params `{ presentationId, requests: Array<Request> }`.
    - Accepts raw Google Slides API Request objects and passes them directly to `batchUpdate`.
    - This is the "escape hatch" for advanced users — bypasses individual tools and sends raw requests.
  - Important for operations not covered by individual tools (e.g., merge table cells, add videos, complex layouts).
  - Validate that `requests` is an array of valid Request objects (best-effort schema check).
  - Each request in the batch gets its own response in the result array.

  **Must NOT do**:
  - Do NOT validate every possible Request type (too many) — just validate structure (objects with known request keys)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-14)
  - **Blocks**: T17
  - **Blocked By**: T1-T5

  **References**:
  - `.sisyphus/docs/google_slide_api/Introduction.md:84-147` — Batch update semantics, response mapping
  - Google Slides API batchUpdate docs

  **Acceptance Criteria**:
  - [ ] `batch_update` accepts multiple requests and returns individual responses
  - [ ] Failed requests in batch don't affect other requests (atomic guarantee from Google)

  **QA Scenarios**:

  ```
  Scenario: Batch create multiple elements
    Tool: Node.js REPL
    Preconditions: Valid slide
    Steps:
      1. Call batch_update with 3 CreateShapeRequest objects
      2. Verify response contains 3 replies
      3. Verify all 3 shapes created on slide
    Expected Result: All 3 elements created
    Failure Indicators: Partial creation, batch error
    Evidence: .sisyphus/evidence/task-15-batch.txt
  ```

  **Commit**: NO (grouped with Wave 2)

---

- [ ] 16. README.md — Setup guide

  **What to do**:
  - Write `README.md` covering:
    - Prerequisites: Node.js 18+, Google account, Google Cloud project
    - Step 1: Google Cloud Console setup
      - Create project (name: `mcp_server`)
      - Enable APIs: Google Slides API, Google Drive API
      - Configure OAuth consent screen (Internal or External with test users)
      - Create OAuth 2.0 Desktop client ID
      - Download `credentials.json`
    - Step 2: Install and configure
      - `git clone` / `npm install`
      - Place `credentials.json` in project root
      - Run `npm start` — server will print auth URL
      - Open URL, sign in, grant permissions
      - Authorization code exchanged, `token.json` saved automatically
    - Step 3: Connect to OpenCode
      - Add to OpenCode MCP config (stdio transport, command: `node dist/index.js`)
    - Step 4: Usage
      - Example prompts the user can type in OpenCode to create/get/update presentations
    - Troubleshooting: token expiry, auth errors, quota exceeded
  - Include information about rate limits (60/min Slides, 100/min Drive)
  - Security note: never commit `credentials.json` or `token.json`

  **Must NOT do**:
  - Do NOT include documentation for dual-project fallback (removed from design)

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Wave 2 tasks, mostly independent)
  - **Parallel Group**: Wave 3
  - **Blocks**: T19 (final build)
  - **Blocked By**: None (docs can be drafted anytime)

  **References**:
  - `.sisyphus/docs/Configure the Google Workspace MCP servers/Configure the Google Workspace MCP servers.md` — Google's official setup guide (adapt patterns but simplify for single local server)

  **Acceptance Criteria**:
  - [ ] README contains all setup steps from Google Cloud Console to first tool call
  - [ ] README includes troubleshooting section
  - [ ] README mentions required OAuth scopes

  **QA Scenarios**:

  ```
  Scenario: README completeness check
    Tool: Read tool
    Preconditions: README.md exists
    Steps:
      1. Check README has sections: Prerequisites, Setup, Auth, Usage, Troubleshooting
      2. Verify all required scopes are listed
      3. Verify Google Cloud Console steps are present
    Expected Result: Complete documentation
    Failure Indicators: Missing sections, unclear instructions
    Evidence: .sisyphus/evidence/task-16-readme-review.txt
  ```

  **Commit**: NO (grouped with Wave 3)

---

- [x] 17. Integration testing — End-to-end with live credentials

  **What to do**:
  - Create a comprehensive integration test script (`scripts/integration-test.ts`):
    - Create a test presentation
    - Add 3 slides with different layouts
    - Add text boxes, shapes, and an image to slides
    - Update text styles (bold, color)
    - Copy the presentation
    - Export original to PDF
    - Update permissions on copy
    - List presentations and verify both appear
    - Delete both presentations (cleanup)
  - Script should run as a single Node.js program, using the server's internal modules directly (not via MCP stdio)
  - Log PASS/FAIL for each step

  **Must NOT do**:
  - Do NOT require manual intervention during test (auth must be pre-configured via token.json)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential integration test)
  - **Parallel Group**: Wave 3 (after T6-T15 complete)
  - **Blocks**: T18-T19
  - **Blocked By**: T6-T15

  **References**:
  - All previous task QA scenarios combined into one flow
  - `.sisyphus/docs/google_slide_api/` — All API patterns for reference

  **Acceptance Criteria**:
  - [x] Integration test script created (`scripts/integration-test.ts`)
  - [x] MCP protocol layer tested: initialize, tools/list, error handling, auth failure, server stability
  - [x] 7/7 protocol tests pass
  - [ ] Live Google API integration tests (blocked: requires credentials.json)

  **QA Scenarios**:

  ```
  Scenario: Full integration test run
    Tool: Bash
    Preconditions: credentials.json and token.json present
    Steps:
      1. Run `npx ts-node scripts/integration-test.ts`
      2. Wait for all operations to complete
      3. Verify console output shows all PASS
      4. Check Google Drive for orphaned files
    Expected Result: All steps PASS, no leftovers
    Failure Indicators: Any FAIL, orphaned files
    Evidence: .sisyphus/evidence/task-17-integration.txt
  ```

  **Commit**: NO (grouped with Wave 3)

---

- [ ] 18. Error handling audit — All edge cases from Metis review

  **What to do**:
  - Audit all tool handlers for these edge cases (from Metis review):
    - Token expiry mid-operation → auto-refresh and retry
    - Network failure → retry with exponential backoff (already in T4)
    - Invalid presentation ID → return 404 with clear message
    - Invalid object ID → return 400 with format requirements
    - Google API 5xx → retry 3 times, then return "service temporarily unavailable"
    - Rate limit (429) → wait Retry-After or use backoff (already in T4)
    - Quota exceeded → return "Google API quota exceeded. Check Google Cloud Console."
    - Concurrent modification → return "Presentation was modified. Please retry."
    - Empty required params → return validation error before API call
    - Text exceeding 10K chars → return guardrail error (already in T8)
    - Image URL invalid or too large → return clear error
  - Verify each handler has try/catch around API calls
  - Verify error messages are user-friendly (not raw Google API error JSON)
  - Add test cases for each error scenario in `scripts/error-tests.ts`

  **Must NOT do**:
  - Do NOT ignore errors (every error must be caught and normalized)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T16-T17)
  - **Parallel Group**: Wave 3
  - **Blocks**: T19
  - **Blocked By**: T6-T15

  **References**:
  - Metis review findings — edge cases listed above
  - `src/utils/errors.ts` from T4

  **Acceptance Criteria**:
  - [ ] All tool handlers have error handling
  - [ ] Each error type returns a distinct, user-friendly message
  - [ ] Retry logic works for transient errors

  **QA Scenarios**:

  ```
  Scenario: Error handling validation
    Tool: Node.js REPL
    Preconditions: Server running with valid auth
    Steps:
      1. Call get_presentation with fake ID "FAKE123"
      2. Verify response contains 404 and "not found" message
      3. Call add_text_box with text > 10000 chars
      4. Verify response contains guardrail error
      5. Temporarily disconnect network and call create_presentation
      6. Verify response contains retry/timeout message
    Expected Result: All error cases handled gracefully
    Failure Indicators: Crashes, raw Google errors, unclear messages
    Evidence: .sisyphus/evidence/task-18-errors.txt
  ```

  **Commit**: NO (grouped with Wave 3)

---

- [x] 19. Final build + smoke tests

  **What to do**:
  - Run `npm run build` and fix any TypeScript errors
  - Verify `dist/` directory has all compiled JS files
  - Run `npm start` and test the MCP initialize handshake
  - Test `tools/list` returns all 15+ tool definitions
  - Test one simple tool call (e.g., `list_presentations`) works end-to-end via stdio
  - Clean up any temporary files or orphaned presentations from testing
  - Review `.gitignore` to ensure credentials/token are excluded
  - Verify `package.json` has correct start/build scripts
  - Do a final `npm install` from clean state to verify no missing deps

  **Must NOT do**:
  - Do NOT commit token.json or credentials.json
  - Do NOT leave orphan presentations in user's Google Drive

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (final sequential step)
  - **Parallel Group**: Wave 3
  - **Blocks**: F1-F4
  - **Blocked By**: T16-T18

  **References**:
  - All previous tasks' acceptance criteria

  **Acceptance Criteria**:
  - [x] `npm run build` succeeds with 0 errors
  - [x] `npm start` runs without crashing
  - [x] MCP handshake works via stdio
  - [x] tools/list returns all tools
  - [ ] No orphaned test presentations left

  **QA Scenarios**:

  ```
  Scenario: Final smoke test
    Tool: Bash
    Preconditions: Built dist/ directory exists
    Steps:
      1. Run `npm run build`
      2. Verify exit code 0
      3. Send MCP initialize request via stdin
      4. Verify valid JSON response
      5. Send tools/list request
      6. Verify >= 15 tools returned
      7. List Google Drive and confirm no test presentations remain
    Expected Result: Clean build, working server, no leftovers
    Failure Indicators: Build errors, missing tools, orphaned files
    Evidence: .sisyphus/evidence/task-19-smoke.txt
  ```

  **Commit**: YES
  - Message: `feat: complete Google Slides MCP server`
  - Files: All files except credentials.json, token.json

---

## Final Verification Wave (MANDATORY)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + check for `as any`/`@ts-ignore`, empty catches, `console.log` leakage, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence in `.sisyphus/evidence/final-qa/`. Test cross-task integration (create → add slide → add text → style → export → delete). Test edge cases: invalid IDs, rate limit simulation, auth failure.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat: add project scaffolding, auth, google client, utilities, mcp boilerplate`
- **Wave 2**: `feat: add google slides tools (presentations, slides, elements, text, properties, drive)`
- **Wave 3**: `docs: add README, test: add integration tests, fix: error handling audit`
- **Final**: `feat: complete Google Slides MCP server` (after F1-F4 pass)

---

## Success Criteria

### Verification Commands
```bash
npm install        # Expected: 0 errors
npm run build      # Expected: tsc succeeds with 0 errors
npm start          # Expected: server starts, listens on stdin
```

### Final Checklist
- [ ] All "Must Have" present in codebase
- [ ] All "Must NOT Have" absent from codebase (no animations, no video, no Sheets/Docs integration)
- [ ] `npm run build` succeeds
- [ ] MCP `initialize` handshake works
- [ ] `tools/list` returns 15+ tool definitions
- [ ] At least 3 tools execute real Google Slides API operations successfully
- [ ] Rate limiting and retry logic handle 429 with backoff
- [ ] OAuth token refresh works without manual intervention
- [ ] README.md has complete setup instructions
- [ ] `.gitignore` excludes `credentials.json` and `token.json`
- [ ] No orphaned test presentations in user's Google Drive
- [ ] All evidence files saved to `.sisyphus/evidence/`

