# Transform operations

The Google Slides API lets you manipulate the location, size, and orientation of a
[`PageElement`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages#pageelement)
(text boxes, images, tables, and basic shapes) on a page, while keeping lines
straight and preserving points and parallel lines. These are known as *affine
transformations* . The examples here show some common page element transform
operations using the
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
method.

These examples use the following variables:

- <var translate="no">PRESENTATION_ID</var>---Indicates where you provide the [presentation
  ID](https://developers.google.com/workspace/slides/api/guides/overview#the_structure_of_a_presentation). You can discover the value for this ID from the presentation URL.
- <var translate="no">PAGE_ID</var>---Indicates where you provide the [page object
  ID](https://developers.google.com/workspace/slides/api/guides/overview#working_with_object_ids). You can retrieve the value for this from the URL or by using an API read request.
- <var translate="no">PAGE_ELEMENT_ID</var>---Indicates where you provide the [page
  element object ID](https://developers.google.com/workspace/slides/api/guides/overview#working_with_object_ids). You can specify this ID for elements you create (with [some
  restrictions](https://developers.google.com/workspace/slides/api/guides/overview#specifying_object_ids_on_creation)) or allow the Slides API to automatically create one. Element IDs can be retrieved through an API read request.

These examples are presented as HTTP requests to be language neutral. To learn
how to implement a batch update in different languages using the Google API
client libraries, see [Add shapes and
text](https://developers.google.com/workspace/slides/api/guides/add-shape#example).

## Example arrow shape

For these examples below, assume that there exists an example arrow shape page
element with the following size and transform data (that can be found with a
[`presentations.pages.get`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/get)
method request). The example shape uses the measurement
[`unit`](https://developers.google.com/workspace/slides/api/reference/rest/v1/Unit) EMU (English Metric Unit) and pt
(point).

```
{
  "objectId": PAGE_ELEMENT_ID,
  "size": {
    "width": {
      "magnitude": 3000000,
      "unit": "EMU"
    },
    "height": {
      "magnitude": 3000000,
      "unit": "EMU"
    }
  },
  "transform": {
    "scaleX": 0.3,
    "scaleY": 0.12,
    "shearX": 0,
    "shearY": 0,
    "translateX": 2000000,
    "translateY":  550000,
    "unit": "EMU"
  },
  "shape": {
    "shapeType": "RIGHT_ARROW"
  }
}
```

## Align an element with another

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`CreateShapeRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#createshaperequest)
method to create new shapes in the correct positions that are aligned with the
[example arrow shape](https://developers.google.com/workspace/slides/api/samples/transform#example-shape) on the page. In both cases, the X and Y
coordinates of the upper-left corner of the new shape must be calculated.

The first request creates a 100 by 50 pt rectangle that's aligned to the left
border of the arrow shape, but is positioned 50 pt (50 \* 12,700 = 635,000 EMU)
below the arrow's top edge. The X coordinate of the new rectangle should be the
same as the arrow's X coordinate to keep its left border aligned. The Y
coordinate is the same as the arrow's Y coordinate plus 50 pt, since the
distance is measured from the top of the arrow. The rectangle's coordinates are
therefore:

```
x" = 2000000 EMU
y" = 550000 + (50 * 12700) = 1185000 EMU
```

The second request creates a 40 pt wide circle that has the same horizontal
center line as the example arrow, but is positioned 100 pt (1,270,000 EMU) to
the right of the arrow's right edge. The circle's X coordinate is the sum of the
arrow's X coordinate, the arrow width, and 100 pt. Enforcing a center-line
alignment for the new circle requires taking into account the height of both the
arrow and the circle. The Y coordinate of the circle is the arrow's Y coordinate
plus half the arrow height minus half the circle height. In both cases, the
scaling factors associated with the arrow must also be taken into account,
because they affect the rendered width and height of the arrow. The circle's
coordinates are therefore:

```
x = 2000000 + (0.3 * 3000000) + (100 * 12700) = 4170000 EMU
y = 550000 + (0.5 * 0.12 * 3000000) - (0.5 * 40 * 12700) = 476000 EMU
```

The following is the request protocol to align an element with another:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "createShape": {
        "shapeType": "RECTANGLE",
        "elementProperties": {
          "pageObjectId": PAGE_ID,
          "size": {
            "width": {
              "magnitude": 100,
              "unit": "PT"
            },
            "height": {
              "magnitude": 50,
              "unit": "PT"
            }
          },
          "transform": {
            "scaleX": 1,
            "scaleY": 1,
            "translateX": 2000000,
            "translateY": 1185000,
            "unit": "EMU"
          }
        }
      }
    },
    {
      "createShape": {
        "shapeType": "ELLIPSE",
        "elementProperties": {
          "pageObjectId": PAGE_ID,
          "size": {
            "width": {
              "magnitude": 40,
              "unit": "PT"
            },
            "height": {
              "magnitude": 40,
              "unit": "PT"
            }
          },
          "transform": {
            "scaleX": 1,
            "scaleY": 1,
            "translateX": 4170000,
            "translateY":  476000,
            "unit": "EMU"
          }
        }
      }
    }
  ]
}
```

## Move an element

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`UpdatePageElementTransformRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatepageelementtransformrequest)
method to translate the [example arrow shape](https://developers.google.com/workspace/slides/api/samples/transform#example-shape) page element in
two different ways.

The first request in the batch moves the arrow to the (X,Y) = (2000000, 150000)
EMU coordinate (using an *absolute translation*
[`applyMode`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#ApplyMode)).
The second request in the batch moves the arrow from there, this time 40,000 EMU
to the right and 35,000 EMU upward (using a *relative translation* `applyMode`).
The [transformation1 matrices](https://developers.google.com/workspace/slides/api/guides/transform#translation) used
are constructed to avoid altering the element's size and orientation.

After executing both requests, the arrow's upper-left corner rests at the (X,Y)
= (2040000, 115000) EMU coordinate.

The following is the request protocol to move an element:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "updatePageElementTransform": {
        "objectId": PAGE_ELEMENT_ID,
        "applyMode": "ABSOLUTE",
        "transform": {
            "scaleX": 0.3,
            "scaleY": 0.12,
            "translateX": 2000000,
            "translateY":  150000,
            "unit": "EMU"
        }
      }
    },
    {
      "updatePageElementTransform": {
        "objectId": PAGE_ELEMENT_ID,
        "applyMode": "RELATIVE",
        "transform": {
            "scaleX": 1,
            "scaleY": 1,
            "translateX":  40000,
            "translateY": -35000,
            "unit": "EMU"
        }
      }
    }
  ]
}
```

## Reflect an element

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`UpdatePageElementTransformRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatepageelementtransformrequest)
method to reflect the [example arrow shape](https://developers.google.com/workspace/slides/api/samples/transform#example-shape) page element
horizontally along its center, without altering its position on the page or
scaling.

This is done by using a [basic reflection
transform](https://developers.google.com/workspace/slides/api/guides/transform#reflection) in the element's [reference
frame](https://developers.google.com/workspace/slides/api/guides/transform#element_reference_frames). For clarity, the
reference frame shift and reflection are shown with three separate calls to the
[`UpdatePageElementTransformRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatepageelementtransformrequest) method,
but it's more efficient to pre-compute the product of these transformation
matrices and then apply that product as a single request.

For the [translation](https://developers.google.com/workspace/slides/api/guides/transform#translation) transforms, the
center of the arrow shape is moved to and from the origin. The parameter values
are expressed as calculations for clarity.

The following is the request protocol to reflect an element:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "updatePageElementTransform": {
        "objectId": PAGE_ELEMENT_ID,
        "applyMode": "RELATIVE",
        "transform": {
            "scaleX":  1,
            "scaleY":  1,
            "translateX": -2000000 - 0.5 * 0.3  * 3000000,
            "translateY":  -550000 - 0.5 * 0.12 * 3000000,
            "unit": "EMU"
        }
      }
    },
    {
      "updatePageElementTransform": {
        "objectId": PAGE_ELEMENT_ID,
        "applyMode": "RELATIVE",
        "transform": {
            "scaleX": -1,
            "scaleY":  1,
            "unit": "EMU"
        }
      }
    },
    {
      "updatePageElementTransform": {
        "objectId": PAGE_ELEMENT_ID,
        "applyMode": "RELATIVE",
        "transform": {
            "scaleX":  1,
            "scaleY":  1,
            "translateX":  2000000 + 0.5 * 0.3  * 3000000,
            "translateY":   550000 + 0.5 * 0.12 * 3000000,
            "unit": "EMU"
        }
      }
    }
  ]
}
```

## Resize an element

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`UpdatePageElementTransformRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatepageelementtransformrequest)
method to scale the [example arrow shape](https://developers.google.com/workspace/slides/api/samples/transform#example-shape) page element to be 50%
wider and have only 80% of its current height, while keeping the arrow's center
in the same position and maintaining its orientation.

This is done by using a [basic scaling
transform](https://developers.google.com/workspace/slides/api/guides/transform#scaling) in the element's [reference
frame](https://developers.google.com/workspace/slides/api/guides/transform#element_reference_frames). For clarity, the
reference frame shift and scaling are shown with three separate calls to the
[`UpdatePageElementTransformRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatepageelementtransformrequest) method,
but it's more efficient to pre-compute the product of these transformation
matrices and then apply that product as a single request.

For the [translation](https://developers.google.com/workspace/slides/api/guides/transform#translation) transforms, the
center of the arrow shape is moved to and from the origin. The parameter values
are expressed as calculations for clarity.

The following is the request protocol to resize an element:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "updatePageElementTransform": {
          "objectId": PAGE_ELEMENT_ID,
          "applyMode": "RELATIVE",
          "transform": {
              "scaleX":  1,
              "scaleY":  1,
              "translateX": -2000000 - 0.5 * 0.3  * 3000000,
              "translateY":  -550000 - 0.5 * 0.12 * 3000000,
              "unit": "EMU"
          }
      }
    },
    {
      "updatePageElementTransform": {
        "objectId": PAGE_ELEMENT_ID,
        "applyMode": "RELATIVE",
        "transform": {
            "scaleX": 1.5,
            "scaleY": 0.8,
            "unit": "EMU"
        }
      }
    },
    {
      "updatePageElementTransform": {
        "objectId": PAGE_ELEMENT_ID,
        "applyMode": "RELATIVE",
        "transform": {
            "scaleX":  1,
            "scaleY":  1,
            "translateX":  2000000 + 0.5 * 0.3  * 3000000,
            "translateY":   550000 + 0.5 * 0.12 * 3000000,
            "unit": "EMU"
        }
      }
    }
  ]
}
```

## Rotate an element about its center

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`UpdatePageElementTransformRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatepageelementtransformrequest)
method to rotate the [example arrow shape](https://developers.google.com/workspace/slides/api/samples/transform#example-shape) page element 35
degrees counter-clockwise, while keeping the arrow's center in the same position
and maintaining its size.

This is done by using a [basic rotation
transform](https://developers.google.com/workspace/slides/api/guides/transform#rotation) in the element's [reference
frame](https://developers.google.com/workspace/slides/api/guides/transform#element_reference_frames). For clarity, the
reference frame shift and rotation are shown with three separate calls to the
[`UpdatePageElementTransformRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatepageelementtransformrequest) method,
but it's more efficient to pre-compute the product of these transformation
matrices and then apply that product as a single request

For the [translation](https://developers.google.com/workspace/slides/api/guides/transform#translation) transforms, the
center of the arrow shape is moved to and from the origin. The parameter values
are expressed as calculations for clarity.

The following is the request protocol to rotate an element about its center:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "updatePageElementTransform": {
          "objectId": PAGE_ELEMENT_ID,
          "applyMode": "RELATIVE",
          "transform": {
              "scaleX":  1,
              "scaleY":  1,
              "translateX": -2000000 - 0.5 * 0.3  * 3000000,
              "translateY":  -550000 - 0.5 * 0.12 * 3000000,
              "unit": "EMU"
          }
      }
    },
    {
      "updatePageElementTransform": {
        "objectId": PAGE_ELEMENT_ID,
        "applyMode": "RELATIVE",
        "transform": {
            "scaleX":  cos(35 * (pi/180)),
            "scaleY":  cos(35 * (pi/180)),
            "shearX":  sin(35 * (pi/180)),
            "shearY": -sin(35 * (pi/180)),
            "unit": "EMU"
        }
      }
    },
    {
      "updatePageElementTransform": {
        "objectId": PAGE_ELEMENT_ID,
        "applyMode": "RELATIVE",
        "transform": {
            "scaleX":  1,
            "scaleY":  1,
            "translateX":  2000000 + 0.5 * 0.3  * 3000000,
            "translateY":   550000 + 0.5 * 0.12 * 3000000,
            "unit": "EMU"
        }
      }
    }
  ]
}
```