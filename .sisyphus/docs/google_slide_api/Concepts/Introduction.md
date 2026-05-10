# Introduction

The Google Slides API lets you create and modify Google Slides presentations.

Apps can integrate with the Google Slides API to create beautiful slide decks
automatically from user- and system-provided data. For example, you could
use customer details from a database and combine them with predesigned
templates and selected configuration options to create finished presentations
in a fraction of the time it would take to create them manually.

## Overview of the API

The [presentations](https://developers.google.com/workspace/slides/reference/rest/v1/presentations) collection provides
methods that let you get and update elements within the presentation.

Most of your work with the Slides API will probably be creating and updating
presentations. You'll do this using the
[batchUpdate](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate) method;
this method takes a list of
[Request](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#Request)
objects that let you do things like:

- Create slides
- Add elements to slides such as shapes or tables
- Insert, change, and remove text
- Apply transforms to elements
- Change the order of slides

See [Batch updates](https://developers.google.com/workspace/slides/api/guides/overview#batch_updates) for more details. See the Get Started guides
for a simple end-to-end example of how to use the API.

## The structure of a presentation

A presentation in the Slides API is made up of pages, which contain page
elements.

The ID of a presentation can be derived from the URL:

```
https://docs.google.com/presentation/d/presentationId/edit
```

The presentation ID is a string containing letters, numbers, and some special
characters. The following regular expression can be used to extract the
presentation ID from a Google Sheets URL:

```
/presentation/d/([a-zA-Z0-9-_]+)
```

If you're familiar with the Drive API, the `presentationId`
corresponds to the ID of the
[File](https://developers.google.com/workspace/drive/v3/reference/files#resource-representations)
resource.

Pages and page elements are identified by object IDs.

### Pages

Google Slides has the following kinds of pages:

|---|---|
| Masters | Slide masters define the default text styles, background, and page elements that appear in all of the slides that use this master. Page elements that must appear on all slides should be added to the master. Most presentations have one master, but some may have several or none. |
| Layouts | Layouts serve as a template for how page elements will be arranged by default on slides using a layout. Each layout is associated with one master. |
| Slides | These pages contain the content you are presenting to your audience. Most slides are based on a master and a layout. You can specify which layout to use for each slide when it is created. |
| Notes | These pages contain the content for presentation handouts, including a a shape that contains the slide's speaker notes. Each slide has one corresponding notes page. Only the text in the speaker notes shape can be modified with the Slides API. |
| Notes masters | Notes masters define the default text styles and page elements for all notes pages. Notes masters are read-only in the Slides API. |

### Page elements

Page elements are the visual components that are placed on pages. The API
exposes several kinds of page elements:

|---|---|
| Group | A set of page elements that are treated as an individual unit. They can be moved, scaled, and rotated together. |
| Shape | A plain visual object, such as rectangles, ellipses, and text boxes. Shapes can contain text, so they are the most common page elements to build slides. |
| Image | A graphic imported into Slides. |
| Video | A video imported into Slides. |
| Line | A visual line, curve, or connector. |
| Table | A grid of content. |
| WordArt | A visual text element that behaves more like a shape. |
| SheetsChart | A chart imported into Slides from Google Sheets. |

## Batch updates

The [batchUpdate](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate) method
lets you update many aspects of a presentation. Changes are grouped together in
a batch so that if one request fails, none of the other (potentially dependent)
changes are written.

The `batchUpdate` method works by taking one or more
[Request](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#Request)
objects, each one specifying a single kind of request to perform. There are
many different kinds of requests. Here's a breakdown of the types of requests,
grouped into different categories.

|---|---|
| Working with Slides: | [CreateSlideRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#CreateSlideRequest) |
| Working with Slides: | [UpdateSlidesPositionRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UpdateSlidesPositionRequest) |
| Working with Slides: | [DuplicateObjectRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#DuplicateObjectRequest) |
| Working with Slides: | [UpdatePagePropertiesRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UpdatePagePropertiesRequest) |
| Working with Slides: | [DeleteObjectRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#DeleteObjectRequest) |
| Working with Page Elements: | [CreateShapeRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#CreateShapeRequest) |
| Working with Page Elements: | [CreateLineRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#CreateLineRequest) |
| Working with Page Elements: | [UpdatePageElementTransformRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UpdatePageElementTransformRequest) |
| Working with Page Elements: | [UpdateShapePropertiesRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UpdateShapePropertiesRequest) |
| Working with Page Elements: | [DuplicateObjectRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#DuplicateObjectRequest) |
| Working with Page Elements: | [DeleteObjectRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#DeleteObjectRequest) |
| Working with Tables: | [CreateTableRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#CreateTableRequest) |
| Working with Tables: | [InsertTableRowsRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#InsertTableRowsRequest) |
| Working with Tables: | [InsertTableColumnsRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#InsertTableColumnsRequest) |
| Working with Tables: | [DeleteTableRowRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#DeleteTableRowRequest) |
| Working with Tables: | [DeleteTableColumnRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#DeleteTableColumnRequest) |
| Working with Tables: | [UpdateTableRowPropertiesRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UpdateTableRowPropertiesRequest) |
| Working with Tables: | [UpdateTableColumnPropertiesRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UpdateTableColumnPropertiesRequest) |
| Working with Tables: | [UpdateTableBorderPropertiesRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UpdateTableBorderPropertiesRequest) |
| Working with Tables: | [UpdateTableCellPropertiesRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UpdateTableCellPropertiesRequest) |
| Working with Tables: | [MergeTableCellsRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#MergeTableCellsRequest) |
| Working with Tables: | [UnmergeTableCellsRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UnmergeTableCellsRequest) |
| Working with Tables: | [DeleteObjectRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#DeleteObjectRequest) |
| Working with Charts: | [CreateSheetsChartRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#CreateSheetsChartRequest) |
| Working with Charts: | [RefreshSheetsChartRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#RefreshSheetsChartRequest) |
| Working with Charts: | [ReplaceAllShapesWithSheetsChartRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#ReplaceAllShapesWithSheetsChartRequest) |
| Working with Charts: | [DeleteObjectRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#DeleteObjectRequest) |
| Working with Images and Video: | [CreateImageRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#CreateImageRequest) |
| Working with Images and Video: | [CreateVideoRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#CreateVideoRequest) |
| Working with Images and Video: | [UpdateImagePropertiesRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UpdateImagePropertiesRequest) |
| Working with Images and Video: | [UpdateVideoPropertiesRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UpdateVideoPropertiesRequest) |
| Working with Images and Video: | [ReplaceAllShapesWithImageRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#ReplaceAllShapesWithImageRequest) |
| Working with Images and Video: | [DuplicateObjectRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#DuplicateObjectRequest) |
| Working with Images and Video: | [DeleteObjectRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#DeleteObjectRequest) |
| Working with Text: | [InsertTextRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#InsertTextRequest) |
| Working with Text: | [DeleteTextRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#DeleteTextRequest) |
| Working with Text: | [ReplaceAllTextRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#ReplaceAllTextRequest) |
| Working with Text: | [CreateParagraphBulletsRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#CreateParagraphBulletsRequest) |
| Working with Text: | [DeleteParagraphBulletsRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#DeleteParagraphBulletsRequest) |
| Working with Text: | [UpdateTextStyleRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UpdateTextStyleRequest) |
| Working with Text: | [UpdateParagraphStyleRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#UpdateParagraphStyleRequest) |

The `batchUpdate` method returns a [response body](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate#response-body),
which contains a
[Response](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#Response)
for each request. Each response occupies the same index as the corresponding
request; for requests with no applicable response, the response at that index
will be empty. The various `Create` requests normally do have responses, so
that you know the ID of the newly added object.

## Working with object IDs

A presentation in the Slides API is made up of *pages* and
*page elements* . These objects include an *object ID* string that is unique
within a presentation.

### Specifying object IDs on creation

When creating pages or page elements using the
[batchUpdate](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate)
method, you can optionally specify an object ID for the new object. This lets
you create an object and modify it within the same batchUpdate request,
minimizing the number of calls to the Slides API and reducing  

[quota usage](https://developers.google.com/workspace/slides/limits).

> [!NOTE]
> Object IDs must be between 5 and 50 characters in length.  
> They must start with an alphanumeric character (\[a-zA-Z0-9\]) or an underscore ("_"). Subsequent characters can be alphanumeric, or underscores, dashes ("-"), or colons (":").

We recommend generating a random object ID in most cases. For example, if you
are using Java, `java.util.UUID.randomUUID().toString()` should work well.

When your application wants to keep track of objects over a longer period of
time, don't rely on the object ID, because it may change. See the following
section for more details.

### Keeping track of objects without using the object ID

When you make a Slides API request, the object ID is normally
preserved. (Any exceptions are called out in the method's reference
documentation.) Making a copy of a whole presentation with the
Drive API also preserves object IDs.

However, you cannot depend on an object ID being unchanged after a presentation
is changed in the Slides UI. For example, if someone uses the
Slides UI to copy-paste a page element and then deletes the
original, the page element will now have a new unique ID, and the ID you
previously provided through the API will be lost. As a result, we don't
recommend you store object IDs in your application's storage. Instead, you
should find objects in the presentation by its text content or alt-text.

> [!WARNING]
> Some actions, especially manual editing using the Slides UI, can change object IDs. So in the longer term, keep track of objects using their text content.

Newly created presentations normally use a consistent set of IDs for default
slides, masters, and text boxes. These IDs are subject to change over time,
so we don't recommend that you rely on this feature. Instead, find the elements
you'd like to modify using the presentation object returned by calls to
[create()](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/create) or
[get()](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/get).