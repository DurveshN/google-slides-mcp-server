# Table operations

The Google Slides API lets you create and edit tables on pages. The examples on
this page show some common table operations using the
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
method.

These examples use the following variables:

- <var translate="no">PRESENTATION_ID</var>---Indicates where you provide the [presentation
  ID](https://developers.google.com/workspace/slides/api/guides/overview#the_structure_of_a_presentation). You can discover the value for this ID from the presentation URL.
- <var translate="no">PAGE_ID</var>---Indicates where you provide the [page object
  IDs](https://developers.google.com/workspace/slides/api/guides/overview#working_with_object_ids). You can retrieve the value for this from the URL or by using an API read request.
- <var translate="no">TABLE_ID</var>---Indicates where you provide the [page
  element object ID](https://developers.google.com/workspace/slides/api/guides/overview#working_with_object_ids) for a table you're working with. You can specify this ID for elements you create (with [some
  restrictions](https://developers.google.com/workspace/slides/api/guides/overview#specifying_object_ids_on_creation)) or allow the Slides API to automatically create one. Element IDs can be retrieved through an API read request.

These examples are presented as HTTP requests to be language neutral. To learn
how to implement a batch update in different languages using the Google API
client libraries, see [Add shapes and
text](https://developers.google.com/workspace/slides/api/guides/add-shape#example).

## Create a table

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`CreateTableRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#createtablerequest)
method to add a table to a slide specified by the <var translate="no">PAGE_ID</var>.

This table has eight rows and five columns. Note that the Slides API
ignores any `size` or `transform` fields provided as part of the
[`elementProperties`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#PageElementProperties).
Instead, the API creates a table that's roughly centered on the slide and is
sized to accommodate the specified number of rows and columns, if possible.

The following is the request protocol to create a table:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "createTable": {
        "objectId": TABLE_ID,
        "elementProperties": {
          "pageObjectId": PAGE_ID,
        },
        "rows": 8,
        "columns": 5
      }
    }
  ]
}
```

## Delete table rows or columns

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`DeleteTableRowRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#DeleteTableRowRequest)
method to remove the sixth row. It then uses the
[`DeleteTableColumnRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#deletetablecolumnrequest)
method to remove the fourth column. The table is specified by the
<var translate="no">TABLE_ID</var>. Both the `rowIndex` and the `columnIndex` within the
`cellLocation` are zero based.

The following is the request protocol to delete table rows or columns:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "deleteTableRow": {
        "tableObjectId": TABLE_ID,
        "cellLocation": {
          "rowIndex": 5
        }
      }
    },
    {
      "deleteTableColumn": {
        "tableObjectId": TABLE_ID,
        "cellLocation": {
          "columnIndex": 3
        }
      }
    }
  ]
}
```

## Edit table data

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`DeleteTextRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#DeleteTextRequest)
method to remove all the text in a cell within the
[`textRange`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#Range). It
then uses the
[`InsertTextRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#InsertTextRequest)
method to replace it with the new text of "Kangaroo".

The table is specified by the <var translate="no">TABLE_ID</var>. The affected cell is in
the fifth row and third column. Both the `rowIndex` and the `columnIndex` within
the `cellLocation` are zero based.

The following is the request protocol to edit table data:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#Request": [
    {
      "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#DeleteTextRequest": {
        "objectId": TABLE_ID,
        "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/tables#Page.TableCellLocation": {
          "rowIndex": 4,
          "columnIndex": 2
        },
        "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#Range": {
          "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#Type": "ALL",
        }
      }
    },
    {
      "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#InsertTextRequest": {
        "objectId": TABLE_ID,
        "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/tables#Page.TableCellLocation": {
          "rowIndex": 4,
          "columnIndex": 2
        },
        "text": "Kangaroo",
        "insertionIndex": 0
      }
    }
  ]
}
```

## Format a table header row

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`UpdateTableCellPropertiesRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#UpdateTableCellPropertiesRequest)
method to format the header row of a table element, within the
[`tableRange`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#TableRange),
specified by the <var translate="no">TABLE_ID</var>. It then uses the
[`TableCellProperties`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/tables#Page.TableCellProperties)
method to set the background color of the header row to black.

Each following request uses the
[`UpdateTextStyleRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatetextstylerequest)
method to set the text format in one cell of the header row to bold, white 18-pt
Cambria font within the
[`textRange`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#Range). You
then need to repeat this request for each additional cell in the header.

Both the `rowIndex` and the `columnIndex` within the `location` and
`cellLocation` are zero based.

The following is the request protocol to format a table header row:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#Request": [
    {
      "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#UpdateTableCellPropertiesRequest": {
        "objectId": TABLE_ID,
        "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#TableRange": {
          "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/tables#Page.TableCellLocation": {
            "rowIndex": 0,
            "columnIndex": 0
          },
          "rowSpan": 1,
          "columnSpan": 3
        },
        "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/tables#Page.TableCellProperties": {
          "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/tables#Page.TableCellBackgroundFill": {
            "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/other#Page.SolidFill": {
              "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/other#Page.OpaqueColor": {
                "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/other#Page.RgbColor": {
                  "red": 0.0,
                  "green": 0.0,
                  "blue": 0.0
                }
              }
            }
          }
        },
        "fields": "tableCellBackgroundFill.solidFill.color"
      }
    },
    {
      "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatetextstylerequest": {
        "objectId": TABLE_ID,
        "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/tables#Page.TableCellLocation": {
          "rowIndex": 0,
          "columnIndex": 0
        },
        "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/text#Page.TextStyle": {
          "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/text#Page.OptionalColor": {
            "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/other#Page.OpaqueColor": {
              "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/other#Page.RgbColor": {
                "red": 1.0,
                "green": 1.0,
                "blue": 1.0
              }
            }
          },
          "bold": true,
          "fontFamily": "Cambria",
          "https://developers.google.com/workspace/slides/api/reference/rest/v1/Dimension": {
            "magnitude": 18,
            "https://developers.google.com/workspace/slides/api/reference/rest/v1/Unit": "PT"
          }
        },
        "https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#Range": {
          "type": "ALL"
        },
        "fields": "foregroundColor,bold,fontFamily,fontSize"
      }
    },
    // Repeat the above request for each additional cell in the header row....
  ]
}
```

Here's what the formatted header row looks like after these updates:

![Format header row recipe result.](https://developers.google.com/static/workspace/slides/api/images/table_header_example.png)

## Insert table rows or columns

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`InsertTableRowsRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#inserttablerowsrequest)
method to add three rows below the sixth row. It then uses the
[`InsertTableColumnsRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#inserttablecolumnsrequest)
method to add two columns to the left of the fourth column in the same table.

The table is specified by the <var translate="no">TABLE_ID</var>. Both the `rowIndex` and
the `columnIndex` within the `cellLocation` are zero based.

The following is the request protocol to insert table rows or columns:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "insertTableRows": {
        "tableObjectId": TABLE_ID,
        "cellLocation": {
          "rowIndex": 5
        },
        "insertBelow": true,
        "number": 3
      }
    },
    {
      "insertTableColumns": {
        "tableObjectId": TABLE_ID,
        "cellLocation": {
          "columnIndex": 3
        },
        "insertRight": false,
        "number": 2
      }
    }
  ]
}
```