# Slide operations

The Google Slides API lets you create, move, and delete slides. The examples on
this page show some common slide operations using the
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
method.

These examples use the following variables:

- <var translate="no">PRESENTATION_ID</var>---Indicates where you provide the [presentation
  ID](https://developers.google.com/workspace/slides/api/guides/overview#the_structure_of_a_presentation). You can discover the value for this ID from the presentation URL.
- <var translate="no">PAGE_ID</var> and <var translate="no">PAGE_ID2</var>---Indicates where you provide the [page object
  IDs](https://developers.google.com/workspace/slides/api/guides/overview#working_with_object_ids). You can retrieve the value for this from the URL or by using an API read request.

These examples are presented as HTTP requests to be language neutral. To learn
how to implement a batch update in different languages using the Google API
client libraries, see the following guides: [Create a
slide](https://developers.google.com/workspace/slides/api/guides/create-slide#example) and [Add shapes and
text](https://developers.google.com/workspace/slides/api/guides/add-shape#example).

## Copy a slide

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`DuplicateObjectRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#DuplicateObjectRequest)
method to copy of a slide and insert it after the original in the presentation.
The original slide is specified by <var translate="no">PAGE_ID</var>.

The request lets you specify if some or all of the page element IDs should be in
the copy (with [some
restrictions](https://developers.google.com/workspace/slides/api/guides/overview#specifying_object_ids_on_creation)).
In this example, the original slide contains a table element (specified by the
<var translate="no">TABLE_ELEMENT_ID</var>), that's mapped to a new table (specified by
the <var translate="no">COPY_TABLE_ELEMENT_ID</var>) in the slide copy (specified by the
<var translate="no">COPY_PAGE_ID</var>). All other elements on the copy are given random
IDs.

For more information about copying a
[`PageElement`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages#pageelement),
including text boxes, images, tables, basic shapes, lines, and embedded videos,
see the sample [Copy and edit an
element](https://developers.google.com/workspace/slides/api/samples/elements#copy-edit).

The following is the request protocol to copy a slide:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "duplicateObject": {
        "objectId": PAGE_ID,
        "objectIds": {
          "PAGE_ID": "COPY_PAGE_ID",
          "TABLE_ELEMENT_ID": "COPY_TABLE_ELEMENT_ID"
        }
      }
    }
  ]
}
```

## Create a slide

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`CreateSlideRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#CreateSlideRequest)
method to create a slide and insert it as the fourth slide (using the zero-based
`insertionIndex`) in the presentation.

The new slide is set to use the
[`PredefinedLayout`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#PredefinedLayout)
of `TITLE_AND_TWO_COLUMNS`. You can specify a string to use as the
<var translate="no">PAGE_ID</var> for the slide (with [some
restrictions](https://developers.google.com/workspace/slides/api/guides/overview#specifying_object_ids_on_creation)),
or allow the API to generate the <var translate="no">PAGE_ID</var> by omitting the field
in the request.

The following is the request protocol to create a slide:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "createSlide": {
        "objectId": "PAGE_ID",
        "insertionIndex": 3,
        "slideLayoutReference": {
          "predefinedLayout": "TITLE_AND_TWO_COLUMNS"
        }
      }
    }
  ]
}
```

## Create a slide and modify placeholders

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`CreateSlideRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#CreateSlideRequest)
method to create a slide using the
[`PredefinedLayout`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#PredefinedLayout)
of `TITLE_AND_TWO_COLUMNS`.

You can specify a string to use as the <var translate="no">PAGE_ID</var> for the slide
(with [some
restrictions](https://developers.google.com/workspace/slides/api/guides/overview#specifying_object_ids_on_creation)).
The
[`placeholderIdMappings`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#LayoutPlaceholderIdMapping)
uses the
[`Type`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/other#type_1) of
`TITLE`. The <var translate="no">TITLE_ID</var> references the slide's placeholder shape
so it can be modified.

The following is the request protocol to create a slide and modify placeholders:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#Request": [
    {
      "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#CreateSlideRequest": {
        "objectId": PAGE_ID,
        "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#LayoutReference": {
          "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#PredefinedLayout": "TITLE_AND_TWO_COLUMNS"
        },
        "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#LayoutPlaceholderIdMapping": [
          {
            "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#LayoutPlaceholderIdMapping": {
              "type": "TITLE",
              "index": 0
            },
            "objectId": TITLE_ID,
           },
        ],
      }
    },
    {
      "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#InsertTextRequest": {
        "objectId": TITLE_ID,
        "text": "This is my slide title",
      }
    },
  ]
}
```

## Move slides to a new position

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`UpdateSlidesPositionRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#UpdateSlidesPositionRequest)
method to take the two specified slides and move them to the beginning of the
presentation, maintaining their relative ordering.

The specified slide IDs (<var translate="no">PAGE_ID</var> and <var translate="no">PAGE_ID2</var>)
must be provided in the existing presentation order, without duplicates. The
zero-based `insertionIndex` denotes where the slides should be inserted, based
on the order before the move takes place. The value must be between zero and the
number of slides in the presentation, inclusive.

The following is the request protocol to move slides to a new position:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "updateSlidesPosition": {
        "slideObjectIds": [
          PAGE_ID,
          PAGE_ID2
          ],
        "insertionIndex": 0
      }
    }
  ]
}
```

## Set a slide background image

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`UpdatePagePropertiesRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#UpdatePagePropertiesRequest)
method to set the background image of a slide specified by the
<var translate="no">PAGE_ID</var>. The API retrieves the image using the
<var translate="no">IMAGE_URL</var>.

A [field mask](https://developers.google.com/workspace/slides/api/guides/field-masks) is used to specify that only the
slide background should be changed to preserve the other properties. Using field
masks also improves performance.

Alternatively, an `UpdatePagePropertiesRequest` method can be used to set the
background of a slide to a solid color.

The following is the request protocol to set a slide background image:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "updatePageProperties": {
        "objectId": PAGE_ID,
        "pageProperties": {
          "pageBackgroundFill": {
            "stretchedPictureFill": {
              "contentUrl": IMAGE_URL
            }
          }
        },
        "fields": "pageBackgroundFill"
      }
    }
  ]
}
```

## Generate thumbnail

You can generate a thumbnail of the latest version of a specific page in the
presentation by calling the
[`presentations.pages.getThumbnail`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/getThumbnail)
method, which returns a thumbnail image of the page as a content URL. The image
URL has a default lifetime of 30 minutes.

You can also specify the `mimeType` and `thumbnailSize` returned using the
[`ThumbnailProperties`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/getThumbnail#thumbnailproperties)
field as a query parameter.

The following is the request protocol to generate the page's thumbnail with the
`ThumbnailProperties` set:

```
 GET https://slides.googleapis.com/v1/presentations/PRESENTATION_ID/pages/PAGE_ID/thumbnail?thumbnailProperties.mimeType=PNG&thumbnailProperties.thumbnailSize=MEDIUM
```

```
{
  "width": 800,
  "height": 450,
  "contentUrl": "CONTENT_URL"
}
```