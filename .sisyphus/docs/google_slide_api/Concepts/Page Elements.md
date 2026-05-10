# Pages, Page Elements, and Properties

In order to use the Slides API effectively, you need to understand the
architecture of presentations and their components, as well as the interactions
between these components. This page provides a detailed overview of these
topics:

- Conceptual model of the presentation components
- How the API represents these components
- Styling properties of the components

Reading this and the other concept overviews will make it easier to understand
and use the [how-to guides](https://developers.google.com/workspace/slides/how-tos/create-slide), the
[reference documentation](https://developers.google.com/workspace/slides/reference/rest), and the [recipe
samples](https://developers.google.com/workspace/slides/samples).

## Presentations, pages, and page elements

The outermost container element in Google Slides is a *presentation*. This is
the unit that can be saved in Google Drive, shared with other users, and so on.

Each presentation contains various types of *pages* . One type of page is a
a *slide*, which are the pages that users
see and flip between when the presentation is rendered on a screen.

Each page contains a number of *page elements*, which together make up the
content of the page, as shown in the following diagram:

![slides architecture diagram](https://developers.google.com/static/workspace/slides/api/images/presentation-architecture.png)

Aside from slides, there are other types of pages that let you apply design to
many different slides, creating a consistent appearance. These other page types
are *masters* and *layouts*, and their properties determine the way slides are
rendered, as shown in the following diagram:

![themes architecture diagram](https://developers.google.com/static/workspace/slides/api/images/theme-architecture.png)

**Masters** --- The master page serves two purposes. Placeholders on the master
contain the defaults for text styles used throughout your presentation. The
background and any other shapes on the master slide make up the default
background for all slides based on that master. If you have a company logo that
you want to appear on every slide in your presentation, put it on the master.

**Layouts** --- Layout templates determine how content is arranged on each type
of slide. If you'd like all your title slides to look a certain way, for
example, you might edit the title layout template.

There are two more kinds of pages---notes pages and notes
masters---which are mostly relevant for working with [speaker
notes](https://developers.google.com/workspace/slides/how-tos/notes).

## API representation types and structure

This section describes how the Google Slides conceptual model, as described
above, is represented in the Slides API.

The following diagram depicts the relationship between presentations, pages,
and page elements as types in the Slides API:

![erd-style diagram](https://developers.google.com/static/workspace/slides/api/images/hierarchy-erd.png)

The following sections show how these types are represented in JSON.

### Presentations

A [presentation](https://developers.google.com/workspace/slides/reference/rest/v1/presentations) includes a
number of properties, and contains the pages that are in it:

    {
      "presentationId": string,
      "pageSize": { object(Size) },
      "slides": [ { object(Page) } ],
      "title": string,
      "masters": [ { object(Page) } ],
      "layouts": [ { object(Page) } ],
      "notesMaster": object(Page),
      "locale": string,
    }

### Pages

A [page](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#Page) includes
a set of properties, and contains the page elements that are in it:

    {
      "objectId": string,
      "pageType": enum(PageType),
      "pageElements": [ { object(PageElement) } ],
      "pageProperties": { object(PageProperties) },

      // Union field properties can be only one of the following:
      "slideProperties": { object(SlideProperties) },
      "layoutProperties": { object(LayoutProperties) },
      "notesProperties": { object(NotesProperties) },
      // End of list of possible types for union field properties.
    }

### Page elements

[Page elements](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#Page.PageElement)
are the visual components that are placed on pages. A page element in the API
contains a number of properties, including a field that varies according to the
kind of page element:

    {
      "objectId": string,
      "size": { object(Size) },
      "transform": { object(AffineTransform) },
      "title": string,
      "description": string,

      // Union field element_kind can be only one of the following:
      "elementGroup": { object(Group) },
      "shape": { object(Shape) },
      "image": { object(Image) },
      "video": { object(Video) },
      "line": { object(Line) },
      "table": { object(Table) },
      "wordArt": { object(WordArt) },
      "sheetsChart": { object(SheetsChart) },
      // End of list of possible types for union field element_kind.
    }

There are several kinds of page elements, as defined by the union field
`element_kind` in the definition above. These kinds of page elements are
described in the following table:

| Element kind | Description |
|---|---|
| Group | A set of page elements that are treated as an individual unit. They can be moved, scaled, and rotated together. |
| Shape | A plain visual object, such as rectangles, ellipses, and text boxes. Shapes can contain text, so they are the most common page elements to build slides. |
| Image | A graphic imported into Slides. |
| Video | A video imported into Slides. |
| Line | A visual line, curve, or connector. |
| Table | A grid of content. |
| WordArt | A visual text element that behaves more like a shape. |
| SheetsChart | A chart imported into Slides from Google Sheets. |

## Page and page element properties

The Slides API lets you read and update the appearance of pages and page
elements in your presentation. Different page elements support
different properties that control how the page element is rendered.

Each page element kind has a corresponding properties element and a properties
update message, for example:

- There is a page element type [Shape](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/shapes#Page.Shape)
- Its property field is [shapeProperties](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/shapes#Page.ShapeProperties)
- The request to update these properties is [UpdateShapePropertiesRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#updateshapepropertiesrequest)

The same set of element/properties/update request exists for each page element
type:
[Image](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/images#Page.Image)/[imageProperties](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/images#Page.ImageProperties)/[UpdateImageProperties](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#updateimagepropertiesrequest),
and so on.

You can read the properties attribute wherever you encounter it on reading an
element; to change the values in it, use it with the matching request type as
the payload for the
[batchUpdate](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate)
method, letting you change these values in the presentation.

### Kinds of properties

There are some properties that are common between several kinds of objects in
the Slides API:

| Property | Description |
|---|---|
| Color | Colors in the Slides API can be either an RGB value or a reference to a theme color. Theme colors are referred to by name (for example "DARK1") and can be mapped to RGB values using a [page's color scheme](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#Page.ColorScheme). This color scheme is commonly updated when changing the theme of the presentation in the Slides editor. |
| Fill | The fill represents the rendering of empty space inside an object. The most commonly supported fill in Slides is a solid fill, where the interior of an object is filled with a single solid color. Fills can also be used for the backgrounds of Pages. |
| Outline | The outline represents the set of lines that surround the page element. The color of lines is controlled with a Fill. Callers can also adjust the width and dash style of outlines. |
| Shadow | The shadow represents a visual effect meant to mimic a physical shadow cast by the object. Currently, shadows in the Slides API are read only. |

### Updating properties

To update a property, use the appropriate
`Update...Properties` request in a
[batchUpdate](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate)
call---for example, `UpdateShapeProperties` for Shapes. These requests
accept a full properties message and can use
[field masks](https://developers.google.com/workspace/slides/how-tos/field-masks) to determine which fields in the
properties message should be updated.

> [!NOTE]
> A field mask of `*` is treated like a wildcard and is shorthand for specifying every field in a message. The wildcard syntax can produce unwanted results if the API is updated in the future, as read-only fields and newly added fields may cause errors. For production applications, always list the specific fields being updated in field masks and avoid using `*` wildcards.

## Property inheritance

A page or page element can inherit properties from its parent objects. An
object's properties, including those that it defines and those that it
inherits, determine its final visual appearance.

- **Page properties** --- A page inherits any properties that it doesn't define, but that are defined in the layout or master on which it is based.
- **Shape properties** --- A shape can be marked as a *placeholder*, letting you explicitly reference another placeholder shape (on the page's parent layout or master) from which to inherit properties.

These ideas are explained further in the following paragraphs.

### Inheritance of page properties

The structure of slides, layouts, and masters define an inheritance hierarchy
within the presentation: slides inherit from layouts, and layouts inherit from
masters. A slide's parent layout and master are specified in the slide's
[slideProperties](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#Page.SlideProperties)
field.

A page can inherit properties, such as
[background](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#Page.PageBackgroundFill)
and [color
scheme](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#Page.ColorScheme),
from a parent page. To inherit a property, the child page simply doesn't set a
value for that property in its
[PageProperties](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#Page.PageProperties)
message. By not "overriding" the value defined by the parent, the page accepts
the inherited value.

The following diagram shows a slide inheriting properties from a layout, which
inherits from a master:

![slide property inheritance](https://developers.google.com/static/workspace/slides/api/images/prop-inheritance.png)

The properties used to render a slide are a combination of those it defines and
those it inherits. In this example the resolved values used to render Slide 1
are as follows:

- PropertyA is "Red".
- PropertyB is "Orange".

> [!NOTE]
> A page that has no parent inherits default values from Google Slides for any properties that it doesn't define.

### Inheritance of shape properties

Shapes can inherit properties, such as fill, outline, or shadow, from other
shapes. A shape is a *placeholder* if its
[Shape.placeholder](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/shapes#Page.Placeholder)
field is set. The child placeholder's `Shape.placeholder.parentObjectId` field
identifies its parent placeholder. When you create a new slide based on a
layout, any placeholders in that layout appear as child shapes in the new slide.
Similarly, placeholders on master pages can act as parents of the layouts'
placeholders.

> [!NOTE]
> You can create placeholders using the Slides editor, but not using the Slides API.

With this inheritance hierarchy defined, the child page inherits a property by
not setting that value in its
[ShapeProperties](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#shapeproperties)
message. By not overriding the value defined by the parent, the child shape
accepts the inherited value.

The following diagram shows the inheritance of properties between three
placeholders that are contained in a slide, a layout, and a master:

![shape property inheritance](https://developers.google.com/static/workspace/slides/api/images/placeholder-inheritance.png)

The properties used to render a placeholder shape are a combination of those it
defines and those it inherits. In this example the resolved values for these
shapes are as follows:

- Placeholder1: propertyA is rendered as "Yellow", propertyB as "Green".
- Placeholder2: propertyA is rendered as "Yellow", propertyB as "Purple".
- Placeholder3: propertyA is rendered as "Yellow", propertyB as "Purple".

Shapes are the only type of page element that can have parents. Other types,
such as images, tables, and charts, cannot be placeholders and cannot have
parents.

> [!NOTE]
> When a shape has no parent, any values that it doesn't set are automatically populated with application defaults.

### "Hiding" properties using PropertyState

The
[PropertyState](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#propertystate)
enumeration controls whether a shape's property is actually used for rendering,
or if the value is only used for inheritance by child shapes. A property with
property state `NOT_RENDERED` will not be used when rendering the shape on its
page, however children that have a corresponding property state of `RENDERED`
can still inherit this property.

> [!NOTE]
> Updating a property implicitly sets its property state to \`RENDERED\`, unless you set the state to some other value in the same request.

The following diagram shows the inheritance of properties between three
placeholders that manipulate the PropertyState field:

![property state and inheritance](https://developers.google.com/static/workspace/slides/api/images/propertystate-inheritance.png)

The rendering of shape properties can be affected by the PropertyState field.
In this example the resolved values for these shapes are as follows:

- Placeholder1: propertyA is rendered as "Red".
- Placeholder2: propertyA is not rendered. If this was the outline property, Placeholder2 would have no outline.
- Placeholder3: propertyA is not rendered.

There's one more possible value of The
[PropertyState](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#propertystate)
enumeration: the `INHERIT` property state means that the property state itself
is inherited, and the parent's value should be used. Shapes with no parents
cannot have a property state of `INHERIT`.