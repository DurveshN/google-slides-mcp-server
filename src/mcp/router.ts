/**
 * MCP Router - Tool Registry and Request Routing
 */

import type {
  Tool,
  ToolDefinition,
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCError,
  ToolsListRequest,
  ToolsListResponse,
  ToolsCallRequest,
  ToolsCallResponse,
  ResourcesListRequest,
  ResourcesListResponse,
  ResourcesReadRequest,
  ResourcesReadResponse,
} from "./types.js";
import { add_image, add_table, add_text_box, add_shape } from "../tools/elements.js";
import { generateAndUploadImage } from "../utils/image-generator.js";
import { debugLog } from "../utils/debug-logger.js";
import {
  insert_text,
  delete_text,
  replace_all_text,
  update_text_style,
  update_paragraph_style,
  create_bullets,
} from "../tools/text.js";
import {
  updatePagePropertiesToolDef,
  updateElementTransformToolDef,
} from "../tools/properties.js";
import {
  listPresentationsToolDef,
  exportPresentationToolDef,
  updatePermissionsToolDef,
  deletePresentationToolDef,
} from "../tools/drive.js";
import { batchUpdateToolDef } from "../tools/batch.js";
import { deleteSlideToolDef, reorderSlidesToolDef } from "../tools/slides.js";

const EMU_PER_INCH = 914400;

export class MCPRouter {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    // Register T9: Element tools
    this.registerTool({
      name: "add_image",
      description: `Add an image to a slide from a public URL. Images are page elements sized and positioned via PageElementProperties.

• **Aspect ratio**: Preserve original ratio by calculating width/height proportionally
• **Positioning**: Center for visual balance (x≈(10−w)/2), or align inline beside text
• **Safe margins**: Keep within x: 0.3 to 9.7, y: 0.3 to 5.3
• **Cover images**: Full-slide background at x=0, y=0, w=10, h=5.625; add text on top
• **Inline images**: Place beside text at matching y, width ~2-3in
• Images must be <50MB, <25 megapixels, PNG/JPEG/GIF only
• Uses CreateImageRequest with url and elementProperties`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          slideId: { type: "string" },
          imageUrl: { type: "string" },
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
        },
        required: ["presentationId", "slideId", "imageUrl", "x", "y", "width", "height"],
      },
      handler: async (args) => add_image(args as { presentationId: string; slideId: string; imageUrl: string; x: number; y: number; width: number; height: number }),
    });

    this.registerTool({
      name: "generate_image",
      description: `Generate an AI image from a text prompt and return a public URL ready for add_image.
• **Use when**: You need custom images (diagrams, flowcharts, illustrations) for a slide
• **MANDATORY**: Always use size="512x512". Larger sizes will timeout and fail with "Connection closed".
• **Process**: Calls CallMissed image API → uploads to Google Drive → returns public URL
• **Takes ~4-5 seconds**: If you get a timeout, retry the exact same call once
• **After calling**: Use the returned URL with add_image tool to place on slide`,
      inputSchema: {
        type: "object",
        properties: {
          prompt: { type: "string" },
          model: { type: "string" },
          size: { type: "string" },
        },
        required: ["prompt"],
      },
      handler: async (args) => {
        const startTime = Date.now();
        debugLog('[generate_image handler] Called', args);
        const { prompt, model = 'flux-2-klein-9b', size = '512x512' } = args as { prompt: string; model?: string; size?: string };
        if (!prompt || typeof prompt !== 'string') {
          throw new Error("prompt is required and must be a string");
        }

        try {
          debugLog('[generate_image handler] Calling generateAndUploadImage');
          const result = await generateAndUploadImage({ prompt, model, size });
          const elapsed = Date.now() - startTime;
          debugLog('[generate_image handler] Success', { elapsed, publicUrl: result.publicUrl.slice(0, 80) + '...' });
          return {
            publicUrl: result.publicUrl,
            fileId: result.fileId,
            mimeType: result.mimeType,
            revisedPrompt: result.revisedPrompt,
            elapsedMs: elapsed,
          };
        } catch (err: any) {
          const elapsed = Date.now() - startTime;
          debugLog('[generate_image handler] Error', { elapsed, message: err.message });
          if (err.message?.includes('fetch failed') || err.message?.includes('timeout')) {
            throw new Error(`Image generation timed out after ${elapsed}ms. The CallMissed API may be slow. Try again with size="512x512" for faster generation, or retry in a few seconds.`);
          }
          throw err;
        }
      },
    });

    this.registerTool({
      name: "add_table",
      description: `Add a table (grid of rows and columns) to a slide. Best for data comparison, feature lists, and organized content.

• **Column width**: Divide total width by column count (e.g., 9in width / 3 cols = 3in per col)
• **Row height**: Divide total height by row count (e.g., 3in height / 4 rows = 0.75in per row)
• **Header row**: Style first row bold with larger font (14pt vs 12pt body) via update_text_style
• **Max rows**: Limit to 4-5 rows per slide to prevent overflow and maintain readability
• **Sizing**: Full-width table at x=0.5, y=2.0, w=9.0, h=3.0
• Uses CreateTableRequest with rows, columns, and elementProperties`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          slideId: { type: "string" },
          rows: { type: "number" },
          columns: { type: "number" },
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
        },
        required: ["presentationId", "slideId", "rows", "columns", "x", "y", "width", "height"],
      },
      handler: async (args) => add_table(args as { presentationId: string; slideId: string; rows: number; columns: number; x: number; y: number; width: number; height: number }),
    });

    // Register T6: Presentations tools
    this.registerTool({
      name: "create_presentation",
      description: `Create a new Google Slides presentation and return its ID and URL.

**When to use:**
• Start of every deck creation workflow.
• Use a clear, descriptive title that reflects the deck's purpose.

**Design tips:**
• Canvas is 10 x 5.625 inches (16:9). Plan element placement within this boundary.
• The deck starts with one blank title slide — customize it immediately with add_text_box and update_text_style.
• Follow with get_presentation to inspect slide IDs, then build out content slides.`,
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string" },
        },
        required: ["title"],
      },
      handler: async (args) => {
        const { title } = args as { title: string };
        if (!title || typeof title !== "string") {
          throw new Error("Title is required and must be a string");
        }
        const auth = await this.getAuth();
        const slidesClient = await this.createSlidesClient(auth);
        const driveClient = await this.createDriveClient(auth);
        const presentation = await slidesClient.presentations.create({
          requestBody: { title },
        });
        return {
          presentationId: presentation.data.presentationId,
          title: presentation.data.title,
          url: `https://docs.google.com/presentation/d/${presentation.data.presentationId}`,
        };
      },
    });

    this.registerTool({
      name: "get_presentation",
      description: `Fetch full presentation metadata including all slide IDs and element IDs.

**When to use:**
• Before modifying any slide — you need slideId and elementId values.
• To inspect existing layouts, masters, and page element positions.

**Design tips:**
• Object IDs let you target elements for batch updates without guessing.
• Check the pageSize (10 x 5.625 inches) to align new elements with existing content.
• Use this after create_presentation or copy_presentation to map the deck structure.`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
        },
        required: ["presentationId"],
      },
      handler: async (args) => {
        const { presentationId } = args as { presentationId: string };
        if (!presentationId || typeof presentationId !== "string") {
          throw new Error("presentationId is required and must be a string");
        }
        const auth = await this.getAuth();
        const slidesClient = await this.createSlidesClient(auth);
        const presentation = await slidesClient.presentations.get({ presentationId });
        return presentation.data;
      },
    });

    this.registerTool({
      name: "copy_presentation",
      description: `Duplicate an existing presentation via the Drive API.

**When to use:**
• Creating template-based decks (copy a master, then customize).
• Iterating on designs while preserving the original.
• Before major batch updates — create a backup copy first.

**Design tips:**
• Copied decks preserve all object IDs, so get_presentation works immediately.
• Rename with a clear newTitle to avoid confusion in Drive.
• Canvas remains 10 x 5.625 inches; all layouts and masters are cloned.`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          newTitle: { type: "string" },
        },
        required: ["presentationId", "newTitle"],
      },
      handler: async (args) => {
        const { presentationId, newTitle } = args as {
          presentationId: string;
          newTitle: string;
        };
        if (!presentationId || typeof presentationId !== "string") {
          throw new Error("presentationId is required and must be a string");
        }
        if (!newTitle || typeof newTitle !== "string") {
          throw new Error("newTitle is required and must be a string");
        }
        const auth = await this.getAuth();
        const driveClient = await this.createDriveClient(auth);
        const copied = await driveClient.files.copy({
          fileId: presentationId,
          requestBody: { name: newTitle },
        });
        return {
          newPresentationId: copied.data.id,
          title: copied.data.name,
          url: `https://docs.google.com/presentation/d/${copied.data.id}`,
        };
      },
    });

    this.registerTool({
      name: "delete_presentation",
      description: `Permanently delete a presentation by ID. This action cannot be undone.

**When to use:**
• Cleaning up draft decks or outdated versions.
• Removing test presentations after verifying a workflow.

**Design tips:**
• Always confirm the presentationId before calling — deletion is immediate.
• Consider copying the deck first if any content might be needed later.
• Frees up Drive space; use after successful delivery of the final deck.`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
        },
        required: ["presentationId"],
      },
      handler: async (args) => {
        const { presentationId } = args as { presentationId: string };
        if (!presentationId || typeof presentationId !== "string") {
          throw new Error("presentationId is required and must be a string");
        }
        const auth = await this.getAuth();
        const driveClient = await this.createDriveClient(auth);
        await driveClient.files.delete({ fileId: presentationId });
        return { success: true, message: `Presentation ${presentationId} deleted` };
      },
    });

    // Register T7: Slides tools
    this.registerTool({
      name: "create_slide",
      description: `Create a new slide in a presentation with a specific layout and position.

**Layout types — pick the right one for your content:**
• \`TITLE\` — Section headers, chapter dividers, or single-title slides.
• \`TITLE_AND_BODY\` — Standard content slide with a title and one content area (text, bullets, or a single image).
• \`TITLE_AND_TWO_COLUMNS\` — Comparison slides, side-by-side pros/cons, or two parallel points.
• \`BLANK\` — Fully custom layout; you must add all text boxes, shapes, and images manually.

**Parameters:**
• \`presentationId\` (required) — ID of the presentation.
• \`layout\` (optional) — One of the predefined layouts above. Defaults to the presentation's default layout if omitted.
• \`insertionIndex\` (optional) — Zero-based position to insert the slide. \`0\` = first slide. Defaults to \`0\` if omitted.

> **Tip:** Prefer \`TITLE_AND_BODY\` for most content slides. Use \`BLANK\` only when the predefined layouts don't fit your design.`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          layout: { type: "string" },
          insertionIndex: { type: "number" },
        },
        required: ["presentationId"],
      },
      handler: async (args) => {
        const { presentationId, layout, insertionIndex } = args as {
          presentationId: string;
          layout?: string;
          insertionIndex?: number;
        };
        if (!presentationId || typeof presentationId !== "string") {
          throw new Error("presentationId is required and must be a string");
        }
        const auth = await this.getAuth();
        const slidesClient = await this.createSlidesClient(auth);
        const slideId = crypto.randomUUID().slice(0, 50);
const requests = [
          {
            createSlide: {
              objectId: slideId,
              insertionIndex: insertionIndex ?? 0,
              slideLayoutReference: layout
                ? {
                    predefinedLayout: layout as 'TITLE' | 'TITLE_AND_BODY' | 'TITLE_AND_TWO_COLUMN_BODY' | 'BLANK' | 'SLIDE_LAYOUT_UNSPECIFIED',
                  }
                : undefined,
            },
          },
        ];
        await slidesClient.presentations.batchUpdate({
          presentationId,
          requestBody: { requests },
        });
        return { success: true, slideId };
      },
    });

    this.registerTool(deleteSlideToolDef);
    this.registerTool(reorderSlidesToolDef);

    // Register T8: Elements tools
    this.registerTool({
      name: "add_text_box",
      description: `Add a text box (TEXT_BOX shape) to a slide. Primary method for titles, body text, bullets, and captions.

• **CRITICAL**: Text boxes are FIXED-SIZE. Calculate dimensions before calling or text will overflow silently.
• **Font metrics**: Character widths vary by font size. Use these averages:
  12pt = ~15 chars per inch, 14pt = ~13 chars/in, 16pt = ~11.5 chars/in, 18pt = ~10 chars/in, 20pt = ~9 chars/in, 24pt = ~7.5 chars/in, 28pt = ~6.5 chars/in, 32pt = ~5.7 chars/in, 36pt = ~5.1 chars/in, 40pt = ~4.6 chars/in
• **Line heights**: 12pt = 0.17in, 14pt = 0.20in, 16pt = 0.22in, 18pt = 0.25in, 20pt = 0.28in, 24pt = 0.33in, 28pt = 0.39in, 36pt = 0.50in per line
• **Overflow prevention**: Calculate (char_count / chars_per_inch) + 0.2in = min_width. Calculate (line_count * line_height) + 0.2in = min_height. If text exceeds these, split into multiple boxes or reduce font size.
• **Layout zones**: Title y=0.3, h=0.9; Body y=1.8, h=3.2; Footer y=5.0, h=0.4
• **Safe margins**: Keep x≥0.3 and x≤9.7; y≥0.3 and y≤5.3 (slide is 10 x 5.625 inches)
• **Width**: 9.4in for full-width; ~4.4in per column for two-column layouts
• **Quick capacity**: 14pt body text fits ~117 chars in 9.0in width, ~15 lines in 3.2in height
• Uses CreateShapeRequest with shapeType TEXT_BOX, then InsertTextRequest`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          slideId: { type: "string" },
          text: { type: "string" },
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
          fontSize: { type: "number" },
          bold: { type: "boolean" },
          color: { type: "string" },
        },
        required: ["presentationId", "slideId", "text", "x", "y", "width", "height"],
      },
      handler: async (args) => {
        const {
          presentationId,
          slideId,
          text,
          x,
          y,
          width,
          height,
          fontSize = 12,
          bold = false,
          color = "#000000",
        } = args as {
          presentationId: string;
          slideId: string;
          text: string;
          x: number;
          y: number;
          width: number;
          height: number;
          fontSize?: number;
          bold?: boolean;
          color?: string;
        };
        if (!presentationId || typeof presentationId !== "string") {
          throw new Error("presentationId is required and must be a string");
        }
        if (!slideId || typeof slideId !== "string") {
          throw new Error("slideId is required and must be a string");
        }
        if (!text || typeof text !== "string") {
          throw new Error("text is required and must be a string");
        }
        if (text.length > 10000) {
          throw new Error("Text length must be ≤ 10,000 characters");
        }
        if (typeof x !== "number" || typeof y !== "number") {
          throw new Error("x and y must be numbers");
        }
        if (typeof width !== "number" || typeof height !== "number") {
          throw new Error("width and height must be numbers");
        }
        if (fontSize !== undefined && (typeof fontSize !== "number" || fontSize <= 0)) {
          throw new Error("fontSize must be a positive number");
        }
        const auth = await this.getAuth();
        const slidesClient = await this.createSlidesClient(auth);
        const elementId = crypto.randomUUID().slice(0, 50);
        const requests = [
          {
            createShape: {
              objectId: elementId,
              shapeType: "TEXT_BOX",
              elementProperties: {
                pageObjectId: slideId,
                size: {
                  width: { magnitude: width * EMU_PER_INCH, unit: "EMU" },
                  height: { magnitude: height * EMU_PER_INCH, unit: "EMU" },
                },
                transform: {
                  scaleX: 1,
                  scaleY: 1,
                  translateX: x * EMU_PER_INCH,
                  translateY: y * EMU_PER_INCH,
                  unit: "EMU",
                },
              },
            },
          },
          {
            insertText: {
              objectId: elementId,
              text,
              insertionIndex: 0,
            },
          },
          {
            updateParagraphStyle: {
              objectId: elementId,
              style: {
                alignment: "START",
              },
              fields: "alignment",
            },
          },
          {
            updateTextStyle: {
              objectId: elementId,
              style: {
                fontSize: {
                  magnitude: fontSize,
                  unit: "PT",
                },
                bold,
                foregroundColor: {
                  opaqueColor: {
                    rgbColor: this.hexToRgb(color),
                  },
                },
              },
              fields: "fontSize,bold,foregroundColor",
            },
          },
        ];
        await slidesClient.presentations.batchUpdate({
          presentationId,
          requestBody: {
            requests,
          },
        });
        return { elementId };
      },
    });

    this.registerTool({
      name: "add_shape",
      description: `Add a visual shape to a slide. Use for callout boxes, decorative elements, dividers, or background blocks behind text.

• **Popular types**: RECTANGLE, ROUND_RECTANGLE, ELLIPSE, ARROW
• **Layering**: Create colored background shape first, then add text box on top with same x/y/w/h
• **Background blocks**: Large shapes at x=0, y=1.5, w=10, h=3.0 for section backgrounds
• **Positioning**: Align to grid; left margin ~0.3in, right ~9.7in
• Uses CreateShapeRequest with PageElementProperties for size and transform`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          slideId: { type: "string" },
          shapeType: { type: "string" },
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
        },
        required: ["presentationId", "slideId", "shapeType", "x", "y", "width", "height"],
      },
      handler: async (args) => {
        const {
          presentationId,
          slideId,
          shapeType,
          x,
          y,
          width,
          height,
        } = args as {
          presentationId: string;
          slideId: string;
          shapeType: string;
          x: number;
          y: number;
          width: number;
          height: number;
        };
        if (!presentationId || typeof presentationId !== "string") {
          throw new Error("presentationId is required and must be a string");
        }
        if (!slideId || typeof slideId !== "string") {
          throw new Error("slideId is required and must be a string");
        }
        if (!shapeType || typeof shapeType !== "string") {
          throw new Error("shapeType is required and must be a string");
        }
        if (typeof x !== "number" || typeof y !== "number") {
          throw new Error("x and y must be numbers");
        }
        if (typeof width !== "number" || typeof height !== "number") {
          throw new Error("width and height must be numbers");
        }
        const auth = await this.getAuth();
        const slidesClient = await this.createSlidesClient(auth);
        const elementId = crypto.randomUUID().slice(0, 50);
        await slidesClient.presentations.batchUpdate({
          presentationId,
          requestBody: {
            requests: [
              {
                createShape: {
                  objectId: elementId,
                  shapeType: shapeType as string,
                  elementProperties: {
                    pageObjectId: slideId,
                    size: {
                      width: { magnitude: width * EMU_PER_INCH, unit: "EMU" },
                      height: { magnitude: height * EMU_PER_INCH, unit: "EMU" },
                    },
                    transform: {
                      scaleX: 1,
                      scaleY: 1,
                      translateX: x * EMU_PER_INCH,
                      translateY: y * EMU_PER_INCH,
                      unit: "EMU",
                    },
                  },
                },
              },
            ],
          },
        });
        return { elementId };
      },
    });

    // Register T10: Text editing tools
    this.registerTool({
      name: "insert_text",
      description: `Insert text into a shape or table cell at a specific zero-based index.

• \`insertionIndex\`: Position to insert (0 = beginning; use current text length to append).
• Newline characters implicitly create new paragraphs with inherited paragraph style.
• Inserted text inherits the character style at the insertion point.
• Combine with \`delete_text\` in the same batch to replace text atomically.`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          slideId: { type: "string" },
          elementId: { type: "string" },
          text: { type: "string" },
          insertionIndex: { type: "number" },
        },
        required: ["presentationId", "slideId", "elementId", "text"],
      },
      handler: async (args) => {
        const auth = await this.getAuth();
        const slidesClient = await this.createSlidesClient(auth);
        return insert_text(slidesClient, args as { presentationId: string; slideId: string; elementId: string; text: string; x: number; y: number });
      },
    });

    this.registerTool({
      name: "delete_text",
      description: `Delete a range of text from a shape or table cell.

• \`startIndex\`: Inclusive start position. \`endIndex\`: Exclusive end position.
• Use \`startIndex: 0\`, \`endIndex: <textLength>\` to clear all text.
• Deleting across paragraph boundaries merges paragraphs and combines styles.
• Pair with \`insert_text\` at the same \`startIndex\` to replace content.`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          slideId: { type: "string" },
          elementId: { type: "string" },
          startIndex: { type: "number" },
          endIndex: { type: "number" },
        },
        required: ["presentationId", "slideId", "elementId", "startIndex", "endIndex"],
      },
      handler: async (args) => {
        const auth = await this.getAuth();
        const slidesClient = await this.createSlidesClient(auth);
        return delete_text(slidesClient, args as { presentationId: string; slideId: string; elementId: string; startIndex: number; endIndex: number });
      },
    });

    this.registerTool({
      name: "replace_all_text",
      description: `Globally replace all occurrences of a text string across the entire presentation.

• Ideal for template placeholders like \`{{COMPANY}}\`, \`{{DATE}}\`, \`{{SPEAKER}}\`.
• Set \`matchCase: true\` for case-sensitive replacement.
• Faster than per-shape delete+insert for simple string swaps across multiple slides.
• Does not support regex; uses exact string matching only.`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          oldText: { type: "string" },
          newText: { type: "string" },
          matchCase: { type: "boolean" },
        },
        required: ["presentationId", "oldText", "newText"],
      },
      handler: async (args) => {
        const auth = await this.getAuth();
        const slidesClient = await this.createSlidesClient(auth);
        return replace_all_text(slidesClient, args as { presentationId: string; slideId: string; elementId: string; oldText: string; newText: string; matchCase?: boolean });
      },
    });

    // Register T11: Text styling tools
    this.registerTool({
      name: "update_text_style",
      description: `Apply character-level formatting (font, size, color, bold, italic, underline) to a text range.

• \`fontFamily\`: \`'Roboto'\`, \`'Arial'\`, \`'Montserrat'\`, \`'Open Sans'\`, \`'Lato'\`, \`'Times New Roman'\`.
• \`fontSize\`: Point size (pt). Titles 32-44pt, body 14-18pt, captions 10-12pt.
• \`foregroundColor\`: Hex string \`#RRGGBB\` (e.g., \`#202124\` dark, \`#ffffff\` light, \`#1a73e8\` blue).
• \`bold\`: \`true\` for headings and key terms. \`italic\`: \`true\` for quotes and emphasis.
• \`underline\`: \`true\` for links or highlighted terms.
• Set \`startIndex: 0\` and \`endIndex: <textLength>\` to style all text.`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          elementId: { type: "string" },
          startIndex: { type: "number" },
          endIndex: { type: "number" },
          style: {
            type: "object",
            properties: {
              fontSize: { type: "number" },
              bold: { type: "boolean" },
              italic: { type: "boolean" },
              underline: { type: "boolean" },
              fontFamily: { type: "string" },
              foregroundColor: { type: "string" },
            },
          },
        },
        required: ["presentationId", "elementId", "startIndex", "endIndex", "style"],
      },
      handler: async (args) => {
        const auth = await this.getAuth();
        const slidesClient = await this.createSlidesClient(auth);
        return update_text_style(slidesClient, args as { presentationId: string; slideId: string; elementId: string; startIndex: number; endIndex: number; style: { fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; fontFamily?: string; foregroundColor?: string } });
      },
    });

    this.registerTool({
      name: "update_paragraph_style",
      description: `Apply paragraph-level formatting (alignment, line spacing) to a text range.

• \`alignment\`:
  - \`START\` = left-aligned (best for body text and bulleted lists).
  - \`CENTER\` = center-aligned (best for titles and single-line statements).
  - \`END\` = right-aligned (best for numbers, dates, or footer text).
  - \`JUSTIFIED\` = full justification (use sparingly; can look odd with short lines).
• \`lineSpacing\`: 1.15 to 1.5 for body text readability; 1.0 is too cramped.
• Apply to all text (\`startIndex: 0\`, \`endIndex: length\`) or specific paragraphs.
• Title boxes: \`CENTER\`. Body bullets: \`START\` with \`lineSpacing: 1.3\`.`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          elementId: { type: "string" },
          startIndex: { type: "number" },
          endIndex: { type: "number" },
          style: {
            type: "object",
            properties: {
              alignment: {
                type: "string",
                enum: ["UNSPECIFIED", "START", "CENTER", "END", "JUSTIFIED"],
              },
              lineSpacing: { type: "number" },
            },
          },
        },
        required: ["presentationId", "elementId", "startIndex", "endIndex", "style"],
      },
      handler: async (args) => {
        const auth = await this.getAuth();
        const slidesClient = await this.createSlidesClient(auth);
        return update_paragraph_style(slidesClient, args as { presentationId: string; slideId: string; elementId: string; startIndex: number; endIndex: number; style: { alignment?: 'UNSPECIFIED' | 'START' | 'CENTER' | 'END' | 'JUSTIFIED'; lineSpacing?: number } });
      },
    });

    this.registerTool({
      name: "create_bullets",
      description: `Convert paragraphs in a text element into a bulleted or numbered list.

• Limit to 3-6 items per slide for readability; more becomes too dense.
• \`BULLET_DISC\`: Standard filled circle (most common, general lists).
• \`BULLET_NUMBER\`: 1, 2, 3 (sequential steps, ranked items).
• \`BULLET_ARROW\`: Right arrow (action items, next steps).
• \`BULLET_DIAMOND\`: Diamond (special highlights, key takeaways).
• \`BULLET_STAR\`: Star (ratings, favorites).
• Combine with \`update_paragraph_style\` (\`START\`, \`lineSpacing: 1.3\`) for polish.`,
      inputSchema: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          elementId: { type: "string" },
          startIndex: { type: "number" },
          endIndex: { type: "number" },
          bulletPreset: {
            type: "string",
            enum: [
              "BULLET_ARROW",
              "BULLET_DIAMOND",
              "BULLET_DIAMOND_SQUARE",
              "BULLET_DISC",
              "BULLET_DISC_CIRCLE",
              "BULLET_DISC_SQUARE",
              "BULLET_NUMBER",
              "BULLET_NUMBER_TRIANGLE",
              "BULLET_NUMBER_TRIANGLE_WITH_DOTS",
              "BULLET_SQUARE",
              "BULLET_STAR",
              "BULLET_TICK",
            ],
          },
        },
        required: ["presentationId", "elementId", "startIndex", "endIndex"],
      },
      handler: async (args) => {
        const auth = await this.getAuth();
        const slidesClient = await this.createSlidesClient(auth);
        return create_bullets(slidesClient, args as { presentationId: string; slideId: string; elementId: string; startIndex: number; endIndex: number; bulletPreset?: 'BULLET_ARROW' | 'BULLET_DIAMOND' | 'BULLET_DIAMOND_SQUARE' | 'BULLET_DISC' | 'BULLET_DISC_CIRCLE' | 'BULLET_DISC_SQUARE' | 'BULLET_NUMBER' | 'BULLET_NUMBER_TRIANGLE' | 'BULLET_NUMBER_TRIANGLE_WITH_DOTS' | 'BULLET_SQUARE' | 'BULLET_STAR' | 'BULLET_TICK' });
      },
    });

    this.registerTool(updatePagePropertiesToolDef);
    this.registerTool(updateElementTransformToolDef);

    this.registerTool(listPresentationsToolDef);
    this.registerTool(exportPresentationToolDef);
    this.registerTool(updatePermissionsToolDef);
    this.registerTool(deletePresentationToolDef);

    this.registerTool(batchUpdateToolDef);
  }

  /**
   * Register a tool with the router
   */
  registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Execute a tool by name
   */
  async executeTool(
    name: string,
    arguments_: Record<string, unknown>,
    requestId?: string | number | null
  ): Promise<ToolsCallResponse> {
    const tool = this.tools.get(name);

    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    // Execute the tool handler
    const result = await tool.handler(arguments_);

    const response: ToolsCallResponse = {
      jsonrpc: "2.0",
      id: requestId ?? null,
      result: {
        content: [
          {
            type: "text",
            text: typeof result === "string" ? result : JSON.stringify(result),
          },
        ],
      },
    };
    return response;
  }

  /**
   * List all registered tools
   */
  listTools(requestId?: string | number | null): ToolsListResponse {
    const tools: Tool[] = Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      handler: tool.handler,
    }));

    return {
      jsonrpc: "2.0",
      id: requestId ?? null,
      result: {
        tools,
      },
    };
  }

  /**
   * List all registered resources
   */
  listResources(requestId?: string | number | null): ResourcesListResponse {
    return {
      jsonrpc: "2.0",
      id: requestId ?? null,
      result: {
        resources: [],
      },
    };
  }

  /**
   * Read a resource by URI
   */
  readResource(uri: string, requestId?: string | number | null): ResourcesReadResponse {
    return {
      jsonrpc: "2.0",
      id: requestId ?? null,
      result: {
        contents: [],
      },
    };
  }

  /**
   * Route a JSON-RPC request to the appropriate handler
   */
  async routeRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    switch (request.method) {
      case "initialize": {
        return {
          jsonrpc: "2.0",
          id: request.id ?? null,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
              resources: {},
            },
            serverInfo: {
              name: "google-slides-mcp",
              version: "1.0.0",
            },
          },
        };
      }

      case "tools/list": {
        return this.listTools(request.id);
      }

      case "tools/call": {
        const params = request.params as {
          name: string;
          arguments?: Record<string, unknown>;
        };

        if (!params || !params.name) {
          throw new Error("Invalid tools/call params: missing name");
        }

        const response = await this.executeTool(params.name, params.arguments || {}, request.id);
        return response;
      }

      case "resources/list": {
        return this.listResources(request.id);
      }

      case "resources/read": {
        const params = request.params as { uri: string };

        if (!params || !params.uri) {
          throw new Error("Invalid resources/read params: missing uri");
        }

        return this.readResource(params.uri, request.id);
      }

      case "notifications/initialized": {
        // No-op notification
        return {
          jsonrpc: "2.0",
          id: null,
        };
      }

      default: {
        throw new Error(`Unknown method: ${request.method}`);
      }
    }
  }

  /**
   * Get authentication client
   */
  async getAuth() {
    const { getAuthenticatedClient } = await import('../auth.js');
    return getAuthenticatedClient();
  }

  /**
   * Create slides client
   */
  async createSlidesClient(auth: any) {
    const { google } = await import('googleapis');
    return google.slides({ version: 'v1', auth });
  }

  /**
   * Create drive client
   */
  async createDriveClient(auth: any) {
    const { google } = await import('googleapis');
    return google.drive({ version: 'v3', auth });
  }

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex: string): { red: number; green: number; blue: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          red: parseInt(result[1], 16) / 255,
          green: parseInt(result[2], 16) / 255,
          blue: parseInt(result[3], 16) / 255,
        }
      : { red: 0, green: 0, blue: 0 };
  }
}