# Text Structure and Styling

In the Slides API, text can be contained in shapes or in table cells.
Before you can manipulate and style text, you need to understand its structure
and how styling works.

This page describes how text is represented in the Slides API.

## Sequences of text elements

The text contained in a shape or a table cell is made up of a sequence of
[TextElement](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#textelement)
structures. This sequence represents the structure of text, in the order it
appears from start to end.

For example, consider the contents of this slide---all contained in one
text box:

![screenshot of a simple slide](https://developers.google.com/static/workspace/slides/api/images/text-seq-slide.png)

The slide above has one text box, whose `text` field contains a sequence
of text elements as shown in the following diagram:

![diagram showing a sequence of text elements](https://developers.google.com/static/workspace/slides/api/images/text-elements.png)

More concretely, this sequence of text is represented in the Slides API as
follows:

    "textElements": [ {
        "endIndex": 224,
        "paragraphMarker": { "style": {} }
      }, {
        "endIndex": 130,
        "textRun": { "content": "Li lingues differe in li grammatica e li vocabules. Omnicos directe al desirabilite de un nov ", "style": {} }
      }, {
        "endIndex": 143,
        "startIndex": 130,
        "textRun": { "content": "lingua franca", "style": { "italic": True } }
      }, {
        "endIndex": 224,
        "startIndex": 143,
        "textRun": { "content": ": solmen va esser necessi far:\n", "style": {} }
      }, {
        "endIndex": 243,
        "startIndex": 224,
        "paragraphMarker": {
          "style": { "indentStart": { "magnitude": 36, "unit": "PT" }, "direction": "LEFT_TO_RIGHT", "indentFirstLine": { "magnitude": 18, "unit": "PT" }, "spacingMode": "COLLAPSE_LISTS" },
          "bullet": { "listId": "foo123", "glyph": "\u25cf" }
        }
      }, {
        "endIndex": 243,
        "startIndex": 224,
        "textRun": { "content": "uniform grammatica\n", "style": {} }
      }, {
        "endIndex": 257,
        "startIndex": 243,
        "paragraphMarker": {
            "style": { "indentStart": { "magnitude": 36, "unit": "PT" }, "direction": "LEFT_TO_RIGHT", "indentFirstLine": { "magnitude": 18, "unit": "PT" }, "spacingMode": "COLLAPSE_LISTS" },
            "bullet": { "listId": "foo123", "glyph": "\u25cf" }
        }
    }, {
        "endIndex": 257,
        "startIndex": 243,
        "textRun": { "content": "Pronunciation\n", "style": {} }
    }, {
        "endIndex": 277,
        "startIndex": 257,
        "paragraphMarker": {
            "style": { "indentStart": { "magnitude": 36, "unit": "PT" }, "indentFirstLine": { "magnitude": 18, "unit": "PT" }, "spacingMode": "COLLAPSE_LISTS" },
            "bullet": { "listId": "foo123", "glyph": "\u25cf" }
        }
    }, {
        "endIndex": 277,
        "startIndex": 257,
        "textRun": { "content": "plu sommun paroles.\n", "style": {} }
    }, {
        "endIndex": 500,
        "startIndex": 277,
        "paragraphMarker": { "style": {} }
    }, {
        "endIndex": 500,
        "startIndex": 277,
        "textRun": { "content": "Ka swu thefognay, tay waddeant varpa u inzo.\n", "style": {} }
    }]

### TextElement contents

Each text element contains a zero-based **start index** and **end index**,
which describe the element's location within the full text of the page
element, together with one of the following types of text object:

| Text kind | Description |
|---|---|
| ParagraphMarker | This text element represents the start of a new paragraph. The start and end index of the text element represents the full span of the paragraph, including the newline character that ends the paragraph. A paragraph never overlaps another paragraph. Paragraphs always end in a newline character, so there's always a newline at the end of the text contents of a shape or table cell. Paragraphs can belong to bulleted or numbered lists. If so, the `ParagraphMarker.bullet` field contents include a list ID. This ID references a list element that exists inside `TextContent` alongside the `TextElement` sequence. Paragraphs within the same logical list will refer to the same list ID. |
| TextRun | This text element represents a contiguous string of text that all has the same text style. Text runs never cross paragraph boundaries: even if the text ending one paragraph has the same styling as the text starting the next paragraph, the contents are split after the newline character to form separate text runs. If you need to process the full text string inside a page element, iterate through all of the text elements, concatenating the strings found in all of the text runs. |
| AutoText | Autotext refers to places in the text that change dynamically depending on the context. In Slides, this is used to represent the current slide number inside text. |

The Slides API may include more text element kinds in the future. Code that processes text should handle new text element kinds gracefully, typically by ignoring unknown kinds.

## Modifying text contents

When you need to modify text using the Slides API, you don't have to explicitly
create all the appropriate text elements. Instead, you can operate on text like
you would in the Slides editor: by inserting text, deleting ranges, and
updating styles on ranges. These operations implicitly create `ParagraphMarker`
and `TextRun` elements as needed to reflect your changes.

### Inserting text

You can insert text at an index using the
[InsertTextRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#inserttextrequest)
request in a call to
[batchUpdate](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate). This
method's `insertionIndex` field specifies where to insert the text; you can
compute this index using the start and end index fields inside text elements.

Text insertion has some side effects that mirror the behavior of the Slides
editor:

- Inserting a newline character implicitly creates a new paragraph, creating a `ParagraphMarker` text element that starts at the newline's index and ends at the following newline. The paragraph style---including bullet and list details --- is copied from the current paragraph to the new paragraph.
- The style of inserted characters is determined automatically, generally keeping the same text style that existed at the insertion index. As a result, the text is generally inserted into the existing `TextRun` at that index. You can update this style later using an [UpdateTextStyle](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#updatetextstylerequest) request.

### Deleting text

You can delete a range of text using the
[DeleteTextRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#deletetextrequest)
message in a call to
[batchUpdate](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate).
Deleting text involves some subtleties:

- A deletion that crosses a paragraph boundary merges the two paragraphs, deleting the separating `ParagraphMarker` text element.
- The new merged paragraph will use a combined paragraph style, matching behavior in the Slides editor.
- A deletion whose range encompasses a text run removes all the content from a text run, and it also deletes the text run itself.
- A deletion whose range encompasses an `AutoText` element deletes the `AutoText` element.

## Updating text style

The rendered appearance of text in a slide is determined by text style
properties:

- **Paragraph styles** like indention, alignment, and bullet glyphs, are defined by properties on paragraph markers.
- **Character styles** like bold, italic, and underline, are defined by properties on individual text runs.

### Updating character style

You can update character styles using the [UpdateTextStyleRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#updatetextstylerequest)
message in a call to
[batchUpdate](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate).

Like other text operations, the character style is applied to a range
of text and implicitly creates new `TextRun` objects as needed.

Setting some character styles implicitly updates other related styles to match
the behavior in the Slides editor. For example, adding a link automatically
changes the text foreground color and underline properties. See
the [TextStyle](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/text#Page.TextStyle)
reference documentation for more details.

### Updating paragraph style

You can update paragraph styles using the
[UpdateParagraphStyleRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#updateparagraphstylerequest)
message in a call to
[batchUpdate](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate).

The Slides API supports a
[CreateParagraphBulletsRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#createparagraphbulletsrequest)
that mirrors the functionality of the bullet presets in the Slides editor for
creation of bulleted and numbered lists. Similarly,
[DeleteParagraphBulletsRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#deleteparagraphbulletsrequest)
removes any existing bullets on paragraphs.

## Inherited styles

Some shapes, known as *placeholders* , can inherit text styles from other, parent
shapes: see [placeholders](https://developers.google.com/workspace/slides/concepts/page-elements#inheritance_of_shape_properties)
to learn more about shape inheritance in general.

This section focuses on how style inheritance works to create the final,
rendered text styles displayed in a slide.

### Style representation in placeholders

The section on
[placeholders](https://developers.google.com/workspace/slides/concepts/page-elements#inheritance_of_shape_properties)
describes how inheritance works between parent and child shapes. Inheritance of
text styles is handled by additional features within the inheritance model:

- Properties of [ParagraphMaker](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/text#Page.ParagraphMarker) text elements define paragraph formatting.
- Properties of [TextRun](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/text#Page.TextRun) text elements define character formatting.
- The content of parent placeholders contains eight such ParagraphMarker/TextRun pairs (to support eight levels of list nesting).
- A child placeholder inherits its default text properties from these text elements in its parent's text content.

The following diagram shows one way to visualize these relationships:

![diagram of child shape inheriting text properties](https://developers.google.com/static/workspace/slides/api/images/text-style-inheritance.png)

The first ParagraphMarker/TextRun in the parent shape determines most of the
inherited text styling; the styling in the remaining seven pairs only affects
paragraphs at progressively more-deeply nested bullet levels:

| Parent text element pair | Child formatting that it controls |
|---|---|
| First `ParagraphMarker` First `TextRun` | Text style of level 0 (outermost) list paragraphs and all non-list paragraphs. |
| Second `ParagraphMarker` Second `TextRun` | Text style of remaining (nested) list levels 1-7 |
| Third `ParagraphMarker` Third `TextRun` | Text style of remaining (nested) list levels 1-7 |
| Fourth `ParagraphMarker` Fourth `TextRun` | Text style of remaining (nested) list levels 1-7 |
| Fifth `ParagraphMarker` Fifth `TextRun` | Text style of remaining (nested) list levels 1-7 |
| Sixth `ParagraphMarker` Sixth `TextRun` | Text style of remaining (nested) list levels 1-7 |
| Seventh `ParagraphMarker` Seventh `TextRun` | Text style of remaining (nested) list levels 1-7 |
| Eighth `ParagraphMarker` Eighth `TextRun` | Text style of remaining (nested) list levels 1-7 |

To access these pairs of text elements, use their explicit index within the
`textElements` field as shown in the snippet below, which shows setting the
default (inheritable) styling for level 0 and non-list paragraphs:

    "text": {
      "textElements": [  {
         "startIndex": 0,
         "endIndex": 1,
         "paragraphMarker": {
           "style": {  "alignment": "START",  ...  },
           "bullet": {  "nestingLevel": 0,  ...  }
         }
       },{
         "startIndex": 0,
         "endIndex": 1,
         "textRun": {
           "content": "\n",
           "style": {  "foregroundColor": {  "opaqueColor": {  "themeColor": "DARK1"  }  },  }
         }
       },{
         ...
       } ]
     }

Note that the `content` field of a parent shape's `TextRun` always consists of
a single newline character.

### Inherited styles can be overridden

A child shape can specify styling properties on the
[ParagraphMarker](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#paragraphmarker)
and [TextRun](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#textrun)
elements in its content. These locally specified properties will override any
inherited properties within their local scope. Elements that do not specify any
style will use the corresponding style inherited from the parent.

Removing an explicit style property from a child shape, so that it is no longer
set, will cause it to inherit from the parent.

### Example

Given the inheritance shown in the diagram above, suppose the shape
`ParentPlaceholder` has the following text content:

    "text": {
      "textElements": [
        { "startIndex": 0,  "endIndex": 1,
          "paragraphMarker": {
            "style": {"alignment": "START", ...},
            "bullet": {"nestingLevel": 0, ...}
          }
        },
        { "startIndex": 0,  "endIndex": 1,
          "textRun": {
            "content": "\n",
            "style": {"foregroundColor": {"opaqueColor": {"themeColor": "DARK1"} }, }
            ...
          }
        },
        { "startIndex": 1,  "endIndex": 2,
          "paragraphMarker": {
            "style": {"alignment": "END", ...},
            "bullet": {"nestingLevel": 1, ...}
          }
        },
        { "startIndex": 1,  "endIndex": 2,
          "textRun": {
            "content": "\n",
            "style": {"foregroundColor": {"opaqueColor": {"themeColor": "LIGHT1"} }, ...}
          }
        },
       ...
      ]
    }

And suppose the shape `ChildPlaceholder` has the following text content:

    "text": {
      "textElements": [
        { "startIndex": 0,  "endIndex": 1,
          "paragraphMarker": {
            "style": {},
          }
        },
        { "startIndex": 0,  "endIndex": 1,
          "textRun": {
            "content": "This is my first paragraph\n",
            "style": {},
          }
          ...
        },
        {  "startIndex": 1,  "endIndex": 2,
          "paragraphMarker": {
            "style": {},
            "bullet": {
              "nestingLevel": 1,
              "listId": "someListId",
              "glyph": "●"
            }
          }
        },
        { "startIndex": 1,  "endIndex": 2,
          "textRun": {
            "content": "This paragraph is in a list\n",
            "style": {},
            ...
          }
        }
      ]
    }

This results in the outcomes described in the following paragraphs.

#### Style inheritance for a plain paragraph

The child shape's first paragraph, which includes the
text "This is my first paragraph", is a plain paragraph (not in a list).
No elements in its text content specify any style properties,
so it inherits all its character and paragraph styles from
its parent. This causes the following rendering:

- Text: "This is my first paragraph" is the text rendered. Text itself is never inherited.
- Alignment: The text is rendered with `START` alignment, inherited from the parent's first `ParagraphMarker`.
- Foreground color: The text is rendered with `DARK1` foreground color, inherited from the parent's first `TextRun`.

#### Style inheritance for a list paragraph

The next paragraph, which includes the text "This paragraph is in a list", is in
a bulleted list at nesting level 1, since its corresponding `ParagraphMarker`
has its `bullet` field set to this level. As a result, it inherits text and
paragraph style from nesting level 1 in the parent. This results in the
following rendering:

- Text: "This paragraph is in a list" is the text rendered. Text itself is never inherited.
- Alignment: The text is rendered with "END" alignment, inherited from the parent's second `ParagraphMarker`.
- Foreground color: The text is rendered with `LIGHT1` text foreground color, inherited from the parent's second `TextRun`.

### Interactions between updating and inheriting text and paragraph styles

Text styles that aren't set in a child shape will inherit values from its
parent. Text styles that are set in the child will "override" the parent values
in some local scope.

You can use an [UpdateTextStyleRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#updatetextstylerequest)
to unset a child shape's text style, so that it no longer has a local override
and thus inherits its syltes from the parent shape. Additionally, updating the
child's text style to match the value inherited from a parent
**implicitly unsets the style** so that it uses the inherited value.

> [!NOTE]
> Setting a child shape's style to exactly match that of its parent (causing it to inherit the style) has an identical outcome to unsetting the child shape's style.

This does not affect the visual
appearance of text immediately after an update, but it may matter if you later
update a paragraph or text style in a parent placeholder. This inheritance
behavior matches the behavior of the Slides editor, so you can experiment with
the outcomes of style changes before working against the API.

### Example

Consider the definitions in the [previous example](https://developers.google.com/workspace/slides/api/concepts/text#PlainAndListExample) for
`ChildPlaceholder` and `ParentPlaceholder`.

Now suppose you submit this [UpdateTextStyleRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#updatetextstylerequest):

    { "updateTextStyle": {
        "objectId": "ChildPlaceholder",
        "style": {"foregroundColor": {"opaqueColor": {"themeColor": "DARK1"} }, },
        "textRange": { "type": "ALL" },
        "fields": "foregroundColor"
      }
    }

This request attempts to set a `DARK1` foregroundColor to all of
ChildPlaceholder's text, using a [field mask](https://developers.google.com/workspace/slides/how-tos/field-masks)
to specify that only the foreground color of the element should change. This
request has the following outcomes:

- First paragraph: The new `foregroundColor` matches the inherited `foregroundColor`, so this style is unchanged and still inherits.
- Second paragraph: The new `foregroundColor` doesn't match the inherited `foregroundColor`, so the second paragraph's foreground color is updated to `DARK1`.

ChildPlaceholder's text content is now:

    "text": {
      "textElements": [
        { "startIndex": 0,  "endIndex": 1,
          "paragraphMarker": {
            "style": {},
          }
        },
        { "startIndex": 0,  "endIndex": 1,
          "textRun": {
            "content": "This is my first paragraph\n",
            "style": {},
          }
          ...
        },
        { "startIndex": 1,  "endIndex": 2,
          "paragraphMarker": {
            "style": {},
            "bullet": {"nestingLevel": 1, "listId": "someListId", "glyph": "●" }
          }
        },
        { "startIndex": 1,  "endIndex": 2,
          "textRun": {
            "content": "This paragraph is in a list\n",
            "style": {"foregroundColor": {"opaqueColor": {"themeColor": "DARK1"} }, },
            ...
          }
        }
      ]
    }

## Bullet glyph text style

Like normal text, bullet glyphs have a text style that controls how the glyph
is rendered. These text styles cannot be modified using the Slides API
directly. However, if you use an
[UpdateTextStyleRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#updatetextstylerequest)
to update a complete paragraph that includes a bullet, the Slides API updates
the bullet glyph's text style to match.

Bullet glyph text styles follow a slightly different inheritance hierarchy than
normal text styles.

1. A bullet at a certain nesting level first inherits from the `TextStyle` set in the `NestingLevel.bullet_style` field inside the bullet's `List` object.
2. It next inherits from the corresponding `NestingLevel.bullet_style` in its parent placeholder's `List`.
3. Finally it seeks to inherit from remaining parent placeholder objects.

Bullets in placeholders on Layouts and Masters have an empty \`TextStyle\` in the \`ParagraphMarker.bullet\` field, and any text style updates on those paragraphs will only be reflected in the \`List\` messages.