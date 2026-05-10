# Size and position page elements

This guide explains how you size and position page elements using affine
transforms with the Google Slides API. For a conceptual introduction to affine
transforms, see the [Transforms and page elements](https://developers.google.com/workspace/slides/concepts/transforms)
concept guide.

## Transform elements

The Slides API lets you reposition and scale elements on a page. To do
this, first determine what kind of transformation needs to be applied and then
apply that transform using the
[`presentations.batchUpdate()`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
method containing one or more
[`UpdatePageElementTransformRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatepageelementtransformrequest)
elements.

Transforms can be made using an
[`ApplyMode`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#applymode):

- `ABSOLUTE` transforms *replace* the element's existing transformation
  matrix. Any parameters you omit from the transform update request are set to
  zero.

- `RELATIVE` transforms are *multiplied* with the element's existing
  transformation matrix (the order of multiplication matters):

$$A' = BA$$

Relative transforms move or scale the page element from where it is. For
example, moving a shape 100 points to the left, or rotating it 40 degrees.
Absolute transforms discard existing position and scale information; for
example, moving a shape to the center of the page, or scaling it to be a
specific width.

Complex transformations can usually be expressed as a sequence of simpler ones.
Precalculating a transform---combining multiple transformations using
matrix multiplication---can often reduce overhead.

> [!NOTE]
> The order of transform operations matters---in most cases, rotating an element about a point then translating produces different results than translating it first.

For some operations, you must know what an element's existing transform
parameters are. If you don't have these values, you can retrieve them using the
[`presentations.pages.get()`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/get)
method.

### Translation

Translation is the action of moving a page element to a new position on the same
page. *Absolute* translations move the element to a specific point, while
*relative* translations move the element a specific distance.

> [!NOTE]
> Remember that the translation parameters specify the position of the element's upper-left corner, not its center.

A basic translation transform matrix has the form:
$$T=\\begin{bmatrix} 1 \& 0 \& translate\\_x\\\\ 0 \& 1 \& translate\\_y\\\\ 0 \& 0 \& 1 \\end{bmatrix}$$

When you use an
[`UpdatePageElementTransformRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatepageelementtransformrequest)
to translate an element (without altering its size, shear, or orientation), you
can use one of the following
[AffineTransform](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/other#affinetransform)
structures:

```
// Absolute translation:
{
  'https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/other#affinetransform': {
    'scaleX':  current scaleX value,
    'scaleY':  current scaleY value,
    'shearX':  current shearX value,
    'shearY':  current shearY value,
    'translateX': X coordinate to move to,
    'translateY': Y coordinate to move to,
    'https://developers.google.com/workspace/slides/api/reference/rest/v1/Unit': 'EMU' // or 'PT'
  }
}

// Relative translation (scaling must also be provided to avoid a matrix multiplication error):
{
  'https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/other#affinetransform': {
    'scaleX':  1,
    'scaleY':  1,
    'translateX': X coordinate to move by,
    'translateY': Y coordinate to move by,
    'https://developers.google.com/workspace/slides/api/reference/rest/v1/Unit': 'EMU' // or 'PT'
  }
}
```

### Scale

Scaling is the action of stretching or squeezing an element along the X or Y
dimension to change its size. A basic scaling transform matrix has the form:
$$S=\\begin{bmatrix} scale\\_x \& 0 \& 0\\\\ 0 \& scale\\_y \& 0\\\\ 0 \& 0 \& 1 \\end{bmatrix}$$

You can use this matrix form directly as a `RELATIVE` transform to resize an
element, but this can also affect the element's rendered shear and translation.
To scale the element without affecting its shear or translation, [shift to its
element reference frame](https://developers.google.com/workspace/slides/how-tos/transform#element-reference-frames).

### Rotation

Rotation transforms rotate a page element around a point, using the scaling and
shear parameters. The basic rotation transform matrix has the following form,
where the angle of rotation (in radians) is measured from the X-axis, moving
counterclockwise:
$$R=\\begin{bmatrix} cos(\\theta) \& sin(\\theta) \& 0\\\\ -sin(\\theta) \& cos(\\theta) \& 0\\\\ 0 \& 0 \& 1 \\end{bmatrix}$$

As with scaling, you can use this matrix form directly as a `RELATIVE` transform
to rotate an element, but this causes the element to be rotated about the origin
*of the page* . To rotate the element about its center or a different point,
[shift to that element reference
frame](https://developers.google.com/workspace/slides/how-tos/transform#element-reference-frames).

### Reflection

Reflection mirrors an element across a specific line or axis. The basic x- and
y-axis reflection transform matrix has the following forms:
$$F_x=\\begin{bmatrix} 1 \& 0 \& 0\\\\ 0 \& -1 \& 0\\\\ 0 \& 0 \& 1\\\\ \\end{bmatrix}\\qquad\\qquad F_y=\\begin{bmatrix} -1 \& 0 \& 0\\\\ 0 \& 1 \& 0\\\\ 0 \& 0 \& 1\\\\ \\end{bmatrix}$$

As with scaling, you can use this matrix form directly as a `RELATIVE` transform
to reflect an element, but this causes the element to translate as well. To
reflect the element without any translation, [shift to its element reference
frame](https://developers.google.com/workspace/slides/how-tos/transform#element-reference-frames).

### Element reference frames

Applying a basic [scale](https://developers.google.com/workspace/slides/how-tos/transform#scale),
[rotation](https://developers.google.com/workspace/slides/how-tos/transform#rotation), or
[reflection](https://developers.google.com/workspace/slides/how-tos/transform#reflection) transform directly to a page
element produces a transformation in the page's reference frame. For example, a
basic rotation rotates the element about the page's origin (the upper-left
corner). However, you can operate in the reference frame of the element, for
example to rotate an element around its center point.

To transform an element within its own reference frame, enclose it between two
other translations: a preceding translation `T1` that moves the element center
to the page origin, and a following translation `T2` that moves the element back
to its original position. The full operation can be expressed as a matrix
product:
$$A' = T2 \\times B \\times T1 \\times A$$

You can also switch to other reference frames, by translating different points
to the origin instead. These points become the center of the new reference
frame.

It's possible to perform each of these transformations individually as
sequential `RELATIVE` transform requests. Ideally, you should precompute `A'`
above with matrix multiplications and apply the result as a single `ABSOLUTE`
transform. Alternatively, precompute the `T2 * B * T1` product and apply that as
a single `RELATIVE` transform. These are both more efficient, in terms of API
operations, then sending the transform requests individually.

## Limitations

Some sizing and positioning fields are incompatible with some types of page
elements. The following table summarizes the compatibility of certain page
elements with sizing and positioning fields:

| Field | Shape | Video | Table |
|---|---|---|---|
| **Translation** | ✔ | ✔ | ✔ |
| **Scale** | ✔ | ✔ | No\*\* |
| **Shear** | ✔ | No | No |

To update the table row and column dimensions, use
[`UpdateTableRowPropertiesRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatetablerowpropertiesrequest)
and
[`UpdateTableColumnPropertiesRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#updatetablecolumnpropertiesrequest).

All sizing and positioning fields might give unexpected results if the page
element has shearing. All limitations are subject to change. For current
information, see [Google Slides API](https://developers.google.com/workspace/slides/api/reference/rest).

## Refactored values

When you create a page element, you can specify a size and transform that
provide a certain visual result. However, the Slides API might replace
your provided values with other ones that yield the same visual appearance. In
general, if you write a size using the API, you're not guaranteed to be returned
the same size. However, you should get the same results if you take the
transform into account.