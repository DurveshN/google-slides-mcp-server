# 📖 API Reference

Complete reference for all Google Slides MCP Server tools.

## Table of Contents

- [Presentation Management](#presentation-management)
- [Slide Operations](#slide-operations)
- [Content Elements](#content-elements)
- [Text Editing](#text-editing)
- [Properties & Transforms](#properties--transforms)
- [Drive Operations](#drive-operations)
- [Batch Operations](#batch-operations)
- [Common Types](#common-types)

---

## Presentation Management

### create_presentation

Create a new Google Slides presentation.

**Parameters:**
- `title` (string, required) - Title of the presentation

**Returns:**
```typescript
{
  presentationId: string;
  title: string;
  url: string;
}
```

**Example:**
```typescript
const result = await create_presentation({
  title: "Q4 Sales Report"
});
// Returns: { presentationId: "abc123...", title: "Q4 Sales Report", url: "https://..." }
```

---

### get_presentation

Retrieve complete presentation details including all slides and elements.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation

**Returns:**
Complete presentation object with slides, layouts, and page elements.

**Example:**
```typescript
const presentation = await get_presentation({
  presentationId: "abc123..."
});
```

---

### copy_presentation

Duplicate an existing presentation.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation to copy
- `newTitle` (string, required) - Title for the new presentation

**Returns:**
```typescript
{
  newPresentationId: string;
  title: string;
  url: string;
}
```

**Example:**
```typescript
const copy = await copy_presentation({
  presentationId: "abc123...",
  newTitle: "Q4 Sales Report (Copy)"
});
```

---

### delete_presentation

Permanently delete a presentation from Google Drive.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation to delete

**Returns:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Example:**
```typescript
await delete_presentation({
  presentationId: "abc123..."
});
```

---

## Slide Operations

### create_slide

Add a new slide to a presentation.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `layout` (string, optional) - Predefined layout to use
- `insertionIndex` (number, optional) - Position to insert the slide (0-based)

**Available Layouts:**
- `TITLE_SLIDE` - Title slide with title and subtitle placeholders
- `BLANK` - Empty slide with no placeholders
- `TITLE_AND_BODY` - Title at top with body content area
- `TITLE_ONLY` - Only a title placeholder
- `SECTION_HEADER` - Section divider slide
- `TITLE_AND_TWO_COLUMNS` - Title with two-column layout
- `BIG_NUMBER` - Large number display slide
- `CAPTION_ONLY` - Caption text only

**Returns:**
```typescript
{
  slideId: string;
}
```

**Example:**
```typescript
const slide = await create_slide({
  presentationId: "abc123...",
  layout: "TITLE_AND_BODY",
  insertionIndex: 1
});
```

---

### delete_slide

Remove a slide from a presentation.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `slideId` (string, required) - ID of the slide to delete

**Returns:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Example:**
```typescript
await delete_slide({
  presentationId: "abc123...",
  slideId: "slide1"
});
```

---

### reorder_slides

Change the position of a slide in the presentation.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `slideId` (string, required) - ID of the slide to move
- `newIndex` (number, required) - New position (0-based, 0 = first slide)

**Returns:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Example:**
```typescript
// Move slide to position 3 (4th slide)
await reorder_slides({
  presentationId: "abc123...",
  slideId: "slide1",
  newIndex: 3
});
```

---

## Content Elements

### add_text_box

Add a text box to a slide with custom styling.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `slideId` (string, required) - ID of the slide
- `text` (string, required) - Text content (max 10,000 characters)
- `x` (number, required) - X position in inches from left
- `y` (number, required) - Y position in inches from top
- `width` (number, required) - Width in inches
- `height` (number, required) - Height in inches
- `fontSize` (number, optional) - Font size in points (default: 12)
- `bold` (boolean, optional) - Bold text (default: false)
- `color` (string, optional) - Text color in hex format (default: "#000000")

**Returns:**
```typescript
{
  elementId: string;
}
```

**Example:**
```typescript
const textBox = await add_text_box({
  presentationId: "abc123...",
  slideId: "slide1",
  text: "Welcome to our presentation!",
  x: 1,
  y: 2,
  width: 8,
  height: 1,
  fontSize: 24,
  bold: true,
  color: "#1a73e8"
});
```

**Coordinate System:**
- Standard slide: 10 inches wide × 5.625 inches tall
- Origin (0, 0) is top-left corner
- X increases to the right, Y increases downward

---

### add_shape

Add a shape to a slide.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `slideId` (string, required) - ID of the slide
- `shapeType` (string, required) - Type of shape to create
- `x` (number, required) - X position in inches
- `y` (number, required) - Y position in inches
- `width` (number, required) - Width in inches
- `height` (number, required) - Height in inches

**Available Shape Types:**
- `RECTANGLE` - Rectangle or square
- `ELLIPSE` - Circle or oval
- `TRIANGLE` - Triangle
- `RIGHT_TRIANGLE` - Right-angled triangle
- `ROUND_RECTANGLE` - Rectangle with rounded corners
- `DIAMOND` - Diamond shape
- `HEXAGON` - Hexagon
- `OCTAGON` - Octagon
- `STAR_5` - 5-pointed star
- `ARROW_NORTH` - Up arrow
- `ARROW_EAST` - Right arrow
- `ARROW_SOUTH` - Down arrow
- `ARROW_WEST` - Left arrow
- `CLOUD` - Cloud shape
- `HEART` - Heart shape
- `LIGHTNING_BOLT` - Lightning bolt

**Returns:**
```typescript
{
  elementId: string;
}
```

**Example:**
```typescript
const shape = await add_shape({
  presentationId: "abc123...",
  slideId: "slide1",
  shapeType: "RECTANGLE",
  x: 2,
  y: 2,
  width: 3,
  height: 2
});
```

---

### add_image

Add an image from a URL to a slide.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `slideId` (string, required) - ID of the slide
- `imageUrl` (string, required) - Public URL of the image
- `x` (number, required) - X position in inches
- `y` (number, required) - Y position in inches
- `width` (number, required) - Width in inches
- `height` (number, required) - Height in inches

**Returns:**
```typescript
{
  elementId: string;
}
```

**Example:**
```typescript
const image = await add_image({
  presentationId: "abc123...",
  slideId: "slide1",
  imageUrl: "https://example.com/logo.png",
  x: 3,
  y: 1.5,
  width: 4,
  height: 2.5
});
```

**Image Requirements:**
- Must be a publicly accessible URL
- Supported formats: PNG, JPEG, GIF, SVG
- Maximum file size: 50 MB
- Google Slides will download and embed the image

---

### add_table

Create a table on a slide.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `slideId` (string, required) - ID of the slide
- `rows` (number, required) - Number of rows (max: 20)
- `columns` (number, required) - Number of columns (max: 10)
- `x` (number, required) - X position in inches
- `y` (number, required) - Y position in inches
- `width` (number, required) - Total width in inches
- `height` (number, required) - Total height in inches

**Returns:**
```typescript
{
  elementId: string;
}
```

**Example:**
```typescript
const table = await add_table({
  presentationId: "abc123...",
  slideId: "slide1",
  rows: 4,
  columns: 3,
  x: 1,
  y: 1.5,
  width: 8,
  height: 3
});
```

**Note:** After creating a table, use `batch_update` with `insertText` requests to populate cells.

---

## Text Editing

### insert_text

Insert text into an existing text element.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `slideId` (string, required) - ID of the slide
- `elementId` (string, required) - ID of the text element
- `text` (string, required) - Text to insert
- `insertionIndex` (number, optional) - Character position to insert at (default: 0)

**Returns:**
```typescript
{
  elementId: string;
}
```

**Example:**
```typescript
await insert_text({
  presentationId: "abc123...",
  slideId: "slide1",
  elementId: "textBox1",
  text: "New text here",
  insertionIndex: 0
});
```

---

### delete_text

Remove text from an element.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `slideId` (string, required) - ID of the slide
- `elementId` (string, required) - ID of the text element
- `startIndex` (number, required) - Start position (inclusive)
- `endIndex` (number, required) - End position (exclusive)

**Returns:**
```typescript
{
  elementId: string;
}
```

**Example:**
```typescript
// Delete characters 5-10
await delete_text({
  presentationId: "abc123...",
  slideId: "slide1",
  elementId: "textBox1",
  startIndex: 5,
  endIndex: 10
});
```

---

### replace_all_text

Find and replace text throughout the entire presentation.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `oldText` (string, required) - Text to find
- `newText` (string, required) - Replacement text
- `matchCase` (boolean, optional) - Case-sensitive matching (default: false)

**Returns:**
```typescript
{
  elementId: string;
}
```

**Example:**
```typescript
await replace_all_text({
  presentationId: "abc123...",
  oldText: "{{company_name}}",
  newText: "Acme Corp",
  matchCase: false
});
```

---

### update_text_style

Apply text formatting to a range of text.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `elementId` (string, required) - ID of the text element
- `startIndex` (number, required) - Start position
- `endIndex` (number, required) - End position
- `style` (object, required) - Style properties to apply

**Style Properties:**
- `fontSize` (number) - Font size in points
- `bold` (boolean) - Bold text
- `italic` (boolean) - Italic text
- `underline` (boolean) - Underlined text
- `fontFamily` (string) - Font family name
- `foregroundColor` (string) - Text color in hex format

**Returns:**
```typescript
{
  elementId: string;
}
```

**Example:**
```typescript
await update_text_style({
  presentationId: "abc123...",
  elementId: "textBox1",
  startIndex: 0,
  endIndex: 10,
  style: {
    fontSize: 18,
    bold: true,
    italic: false,
    foregroundColor: "#e74c3c"
  }
});
```

---

### update_paragraph_style

Apply paragraph-level formatting.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `elementId` (string, required) - ID of the text element
- `startIndex` (number, required) - Start position
- `endIndex` (number, required) - End position
- `style` (object, required) - Paragraph style properties

**Style Properties:**
- `alignment` (string) - Text alignment: `START`, `CENTER`, `END`, `JUSTIFIED`
- `lineSpacing` (number) - Line spacing in points

**Returns:**
```typescript
{
  elementId: string;
}
```

**Example:**
```typescript
await update_paragraph_style({
  presentationId: "abc123...",
  elementId: "textBox1",
  startIndex: 0,
  endIndex: 100,
  style: {
    alignment: "CENTER",
    lineSpacing: 1.5
  }
});
```

---

### create_bullets

Add bullet points to paragraphs.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `elementId` (string, required) - ID of the text element
- `startIndex` (number, required) - Start position
- `endIndex` (number, required) - End position
- `bulletPreset` (string, optional) - Bullet style preset

**Available Bullet Presets:**
- `BULLET_DISC` - Filled circle (default)
- `BULLET_CIRCLE` - Hollow circle
- `BULLET_SQUARE` - Filled square
- `BULLET_DIAMOND` - Diamond shape
- `BULLET_ARROW` - Arrow
- `BULLET_STAR` - Star
- `BULLET_NUMBER` - Numbered list (1, 2, 3...)
- `BULLET_TICK` - Checkmark

**Returns:**
```typescript
{
  elementId: string;
}
```

**Example:**
```typescript
await create_bullets({
  presentationId: "abc123...",
  elementId: "textBox1",
  startIndex: 0,
  endIndex: 50,
  bulletPreset: "BULLET_DISC"
});
```

---

## Properties & Transforms

### update_page_properties

Update slide properties like background color.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `slideId` (string, required) - ID of the slide
- `backgroundColor` (string, optional) - Background color in hex format

**Returns:**
Batch update response object.

**Example:**
```typescript
await update_page_properties({
  presentationId: "abc123...",
  slideId: "slide1",
  backgroundColor: "#f8f9fa"
});
```

**Recommended Colors:**
- Light backgrounds: `#ffffff`, `#f8f9fa`, `#e8eaed`
- Dark backgrounds: `#202124`, `#1a1a2e`
- Accent backgrounds: `#e8f0fe` (blue), `#fce8e6` (red), `#e6f4ea` (green)

---

### update_element_transform

Move, resize, or rotate a page element.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `elementId` (string, required) - ID of the element
- `x` (number, required) - X position in inches
- `y` (number, required) - Y position in inches
- `width` (number, required) - Width in inches
- `height` (number, required) - Height in inches
- `rotation` (number, optional) - Rotation angle in degrees (0-360)

**Returns:**
Batch update response object.

**Example:**
```typescript
await update_element_transform({
  presentationId: "abc123...",
  elementId: "shape1",
  x: 2.5,
  y: 3,
  width: 4,
  height: 2,
  rotation: 15
});
```

**Important Notes:**
- This uses **ABSOLUTE** positioning (replaces entire transform)
- Position (x, y) is the element's upper-left corner
- Rotation is clockwise from 0 degrees
- Keep elements within slide bounds (10 × 5.625 inches)

---

## Drive Operations

### list_presentations

List Google Slides presentations from Drive.

**Parameters:**
- `query` (string, optional) - Filter by presentation name
- `pageSize` (number, optional) - Maximum results to return

**Returns:**
```typescript
{
  presentations: Array<{
    id: string;
    name: string;
    modifiedTime: string;
  }>;
  nextPageToken?: string;
}
```

**Example:**
```typescript
const result = await list_presentations({
  query: "Sales Report",
  pageSize: 10
});
```

---

### export_presentation

Export a presentation as PDF.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `mimeType` (string, optional) - Export format (default: "application/pdf")

**Returns:**
```typescript
{
  content: Buffer;
  mimeType: string;
  presentationId: string;
}
```

**Example:**
```typescript
const pdf = await export_presentation({
  presentationId: "abc123...",
  mimeType: "application/pdf"
});
```

---

### update_permissions

Share a presentation with a user.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `email` (string, required) - Email address of the user
- `role` (string, required) - Permission level: `reader`, `writer`, or `commenter`

**Returns:**
```typescript
{
  permissionId: string;
  email: string;
  role: string;
  presentationId: string;
}
```

**Example:**
```typescript
await update_permissions({
  presentationId: "abc123...",
  email: "colleague@example.com",
  role: "writer"
});
```

**Permission Roles:**
- `reader` - View-only access
- `writer` - Full edit access
- `commenter` - Can view and comment, but not edit

---

## Batch Operations

### batch_update

Execute multiple Slides API requests atomically.

**Parameters:**
- `presentationId` (string, required) - ID of the presentation
- `requests` (array, required) - Array of Google Slides API request objects

**Returns:**
Complete batch update response with replies for each request.

**Example:**
```typescript
await batch_update({
  presentationId: "abc123...",
  requests: [
    {
      createShape: {
        objectId: "shape1",
        shapeType: "RECTANGLE",
        elementProperties: {
          pageObjectId: "slide1",
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 914400,  // 1 inch in EMU
            translateY: 914400,
            unit: "EMU"
          }
        }
      }
    },
    {
      insertText: {
        objectId: "shape1",
        text: "Hello World",
        insertionIndex: 0
      }
    }
  ]
});
```

**Benefits:**
- All requests succeed or fail together (atomic)
- Reduces network round trips
- Requests execute in order
- Later requests can reference earlier results

---

## Common Types

### Dimensions

All dimensions use **inches** as the unit:
- Standard slide: 10 inches wide × 5.625 inches tall
- Widescreen slide: 10 inches wide × 5.625 inches tall
- Custom sizes supported

### Colors

Colors use **hex format**:
- With hash: `#FF0000`
- Without hash: `FF0000`
- Both formats accepted

### EMU (English Metric Units)

Internal Google Slides unit:
- 1 inch = 914,400 EMU
- Most tools accept inches and convert automatically
- Use EMU directly in `batch_update` for precision

### Object IDs

- Auto-generated for most operations
- Must be unique within a presentation
- Used to reference elements for updates
- Format: alphanumeric string, max 50 characters

---

## Error Handling

All tools include comprehensive error handling:

- **Validation errors** - Invalid parameters return descriptive error messages
- **API errors** - Google API errors are normalized and include helpful context
- **Rate limiting** - Automatic retry with exponential backoff
- **Network errors** - Transient failures are retried automatically

**Example Error Response:**
```typescript
{
  error: {
    code: "INVALID_ARGUMENT",
    message: "presentationId is required and must be a string",
    details: { ... }
  }
}
```

---

## Best Practices

1. **Use batch_update for multiple operations** - More efficient than individual calls
2. **Validate IDs before use** - Check presentation and slide IDs exist
3. **Handle rate limits** - The server retries automatically, but be mindful of quotas
4. **Keep elements within bounds** - Standard slide is 10 × 5.625 inches
5. **Use meaningful object IDs** - Makes debugging easier
6. **Test with small presentations first** - Verify operations before scaling up

---

## Need Help?

- 📚 [Main README](../README.md)
- 🐛 [Report Issues](https://github.com/yourusername/google-slides-mcp/issues)
- 💬 [Discussions](https://github.com/yourusername/google-slides-mcp/discussions)
