# Transforms and Page Elements

This guide describes the underlying concepts used in transforming (that is,
moving, rotating, scaling, and shearing) page elements, focusing especially
on the underlying *affine transform* and its operations.

For more about how to use affine transforms to achieve specific results,
see the [Size and Position Shapes](https://developers.google.com/workspace/slides/how-tos/transform) guide.

The visual size and position of a page element are controlled by two
properties: *size* and *transform* . The size describes the ideal or built-in size
of the page element being created. The transform specifies a two-dimensional
[affine transform](https://en.wikipedia.org/wiki/Affine_transformation) matrix
that specifies how an object at its built-in size is transformed to result in its
final visual appearance.

![Diagram of a shape rendered through an affine transform](https://developers.google.com/static/workspace/slides/api/images/affine.png)

When you select a page element in the Slides UI and change its visual size
using the adjustment handles, you are actually updating this transform matrix.
Moving the element across the page or rotating it also updates the element's
transform matrix.

## Use the Slides UI to get started

The matrix arithmetic that you use to transform and resize page elements is
very powerful, but can be daunting at first; most of this page describes these
calculations. However, you can simplify the specification of transforms and
sizes using the following approach:

1. Create page elements using the Slides UI.
2. Position scale these page elements as desired, still using the Slides UI.
3. Read the size and transform of those elements using the get method.

That can be enough to get you started; the rest of this guide explains the
transform calculations that you can use to manipulate page elements in detail.

## Affine transform matrices

Two-dimensional affine transform matrices are commonly used by graphics
libraries to control the scale, rotation, shear, reflection and translation of
elements. In the Slides API, a page element's transform is represented
as a 3x3 matrix:
$$A=\\begin{bmatrix} scale\\_x \& shear\\_x \& translate\\_x\\\\ shear\\_y \& scale\\_y \& translate\\_y\\\\ 0 \& 0 \& 1 \\end{bmatrix}$$

The parameters used in the transform are:

|---|---|
| `translate_x` | The translate parameters specify the (X,Y) position of the upper-left corner of the page element, relative to the upper-left corner of the page. You specify the relative position using [Units](https://developers.google.com/workspace/slides/reference/rest/v1/Unit) of either points (pt) or English metric units (EMU). |
| `translate_y` | The translate parameters specify the (X,Y) position of the upper-left corner of the page element, relative to the upper-left corner of the page. You specify the relative position using [Units](https://developers.google.com/workspace/slides/reference/rest/v1/Unit) of either points (pt) or English metric units (EMU). |
| `scale_x` | The scale parameters control how large a page element is when rendered. These are unitless multiplying factors; for example, a `scale_x` value of 1.5 enlarges the element's width by 50%. |
| `scale_y` | The scale parameters control how large a page element is when rendered. These are unitless multiplying factors; for example, a `scale_x` value of 1.5 enlarges the element's width by 50%. |
| `shear_x` | The shear parameters are also unitless and control the tilt of a page element. Scale and shear parameters can be used together to rotate a page element. |
| `shear_y` | The shear parameters are also unitless and control the tilt of a page element. Scale and shear parameters can be used together to rotate a page element. |

You can find many examples on the web showing
[how 2-D transformation matrices](https://en.wikipedia.org/wiki/Transformation_matrix#/media/File:2D_affine_transformation_matrix.svg)
affect graphical object rendering.

The transform matrix is relative to the containing group or page of the
element. For example, if you rotate a group that contains a rectangle,
the group's [`transform`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#pageelement)
field values reflect the rotation, but the rectangle's [`transform`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#pageelement)
field values do not.

## Calculating visual size

To determine the visual (*rendered*) size of a page element, you must consider
both the size and transform properties together. You can't determine which of
two page elements is visually larger just by comparing their size properties:
you must map the boundaries of the element using the transform matrix and
compute a rendered size.

### Mapping a point

To map a specific point using the transform matrix, convert the point (x, y)
into a vector \[x, y, 1\] and then perform matrix multiplication. Consider the
mapping of a point *p*:

\\\[p' = Ap\\\]

This becomes:
$$\\begin{bmatrix} x'\\\\ y'\\\\ 1 \\end{bmatrix} =\\begin{bmatrix} scale\\_x \& shear\\_x \& translate\\_x\\\\ shear\\_y \& scale\\_y \& translate\\_y\\\\ 0 \& 0 \& 1 \\end{bmatrix} \\begin{bmatrix} x\\\\ y\\\\ 1 \\end{bmatrix}$$

Therefore the coordinates of the new point *p'* are:
$$x' = (scale\\_x \\times x) + (shear\\_x \\times y) + translate\\_x\\\\ y' = (scale\\_y \\times y) + (shear\\_y \\times x) + translate\\_y$$

### Calculating the boundary

To determine the rendered size of an element's bounding box after a transform
that shears and scales, use:
$$width' = (scale\\_x \\times width) + (shear\\_x \\times height)\\\\ height' = (scale\\_y \\times height) + (shear\\_y \\times width)$$

For more about how to use affine transforms to achieve specific results,
see the [Size and Position Shapes](https://developers.google.com/workspace/slides/how-tos/transform) guide.

## Limitations

Some sizing and positioning fields are incompatible with some types of page
elements. The table below summarizes the compatibility of certain page elements with sizing and positioning fields.

| Field | Shape | Video | Table |
|---|---|---|---|
| **Translation** | ✔ | ✔ | ✔ |
| **Scale** | ✔ | ✔ | No\*\* |
| **Shear** | ✔ | No | No |

\*\* To update table row and column dimensions, use
`https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#UpdateTableRowPropertiesRequest`
and
`https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#UpdateTableColumnPropertiesRequest`.

All sizing and positioning fields might give unexpected results if the page element has shearing. All limitations are subject to change. For up to date information, see [Google Slides API](https://developers.google.com/workspace/slides/api/reference/rest).