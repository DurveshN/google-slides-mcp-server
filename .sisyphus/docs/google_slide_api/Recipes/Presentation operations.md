# Presentation operations

The Google Slides API lets you create presentation files and manage existing ones.
The examples on this page show some common page presentation operations using
the
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
method.

These examples are presented as HTTP requests to be language neutral. To learn
how to implement a batch update in different languages using the Google API
client libraries, see the following guides:

- [Create and manage presentations](https://developers.google.com/workspace/slides/api/guides/presentations#create_a_blank_presentation)
- [Search for files and folders](https://developers.google.com/workspace/drive/api/guides/search-files#specific)
- [Merge data into a presentation](https://developers.google.com/workspace/slides/api/guides/merge#example)

## Create a presentation

The following
[`presentations.create`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/create)
code sample shows how to creates a blank presentation file entitled "My New
Presentation".

It's also possible to create blank presentation files using the Google Drive API
[`files.create`](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/create) method by
specifying `application/vnd.google-apps.presentation` as the
[MIME type](https://developers.google.com/workspace/drive/api/guides/mime-types).

The following is the request protocol to create a presentation:

```
POST https://slides.googleapis.com/v1/presentations
```

```
{
  "title": "My New Presentation"
}
```

## List existing presentation files

The Slides API doesn't provide a method for retrieving a list of
presentations but the
[Drive API](https://developers.google.com/workspace/drive/api/guides/about-sdk) does. The
[`files.list`](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/list) method
(presented below) uses [field masks](https://developers.google.com/workspace/slides/api/guides/field-masks)
to return a list of presentation files from your Drive, with the
file ID, filename, and a link for opening the file. The request also specifies
`application/vnd.google-apps.presentation` as the
[MIME type](https://developers.google.com/workspace/drive/api/guides/mime-types).

The following is the request protocol to list existing presentation files:

```
GET https://www.googleapis.com/drive/v3/files?q="mimeType=application/vnd.google-apps.presentation"&fields=files(id,name,webViewLink)
```

The [response](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/list#response-body)
to this request has the following structure:

```
{
 "files": [
    {
     "id": "abcdefghijklmnopqrstuvwxyz0123456789",
     "name": "Project Vision",
     "webViewLink": "https://docs.google.com/a/google.com/presentation/d/abcdefghijklmnopqrstuvwxyz0123456789/edit?usp=drivesdk"
    },
    {
     "id": "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
     "name": "Untitled Presentation",
     "webViewLink": "https://docs.google.com/a/google.com/presentation/d/ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/edit?usp=drivesdk"
    },
    ...
  ]
}
```

## Replace text throughout a presentation

The following
[`presentations.batchUpdate`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate)
code sample shows how to use the
[`ReplaceAllTextRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#ReplaceAllTextRequest)
method to replace text throughout the presentation specified by the
<var translate="no">PRESENTATION_ID</var>. You can discover the value for the
[presentation ID](https://developers.google.com/workspace/slides/api/guides/overview#the_structure_of_a_presentation)
from the presentation URL.

Every instance of the string "Gizmo Corp." is replaced with the text "Gadget
Inc." This includes text in text boxes and other shapes, on slides, and within
masters. In this instance, the text replacement is case-sensitive by setting
[`matchCase`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#SubstringMatchCriteria)
to `true`.

The following is the request protocol to replace text throughout a presentation:

```
POST https://slides.googleapis.com/v1/presentations/PRESENTATION_ID:batchUpdate
```

```
{
  "requests": [
    {
      "replaceAllText": {
          "containsText": {
            "text": "Gizmo Corp.",
            "matchCase": true
          },
          "replaceText": "Gadget Inc."
      }
    }
  ]
}
```