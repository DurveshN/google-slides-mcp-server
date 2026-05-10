# Editing and Styling Text

This page tells you how to edit and style text in your presentation using
the Slides API.

## About text

[Video](https://www.youtube.com/watch?v=_O2aUCJyCoQ)

Text in your presentation is always contained within a shape or a table cell.
The API lets you modify this text in a number of ways:

- You can insert, delete, or replace text in your presentation.
- You can add paragraph formatting to create bulleted lists.
- You can change character formatting such as bold, italics, color, font size, or hyperlinks.

See the concepts page [Text Structure and Styling](https://developers.google.com/workspace/slides/concepts/text) for
a general overview of how text styling works in the Slides API. Also check out the above video to see a complete example (Python) combining several of the formatting concepts from the sections below.

## Inserting, deleting, or replacing text

There are two ways you can replace text in a presentation using the Slides API:
by performing a global search-and-replace, or by explicitly deleting and adding
text. Both ways use the [batchUpdate](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate)
method, but with different request types.

### Global search and replace

Use [ReplaceAllTextRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#replacealltextrequest)
to do a global search-and-replace throughout your presentation.

The [Text Merging](https://developers.google.com/workspace/slides/how-tos/merge#text_merging) section of the Merging
Data guide provides an example of how you can use this request type.

### Replacing text within a shape

The Slides API lets you modify the text content of a shape. You can remove
individual ranges of text, and you can insert text at a specific location.

Use [InsertTextRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#inserttextrequest)
and [DeleteTextRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#deletetextrequest)
to perform these operations.

Replacing a specific region of text consists of a deletion and then an
insertion, which you can perform using the following steps:

1. Identify the page element that contains the text.
2. Identify the start and end position of the text to be replaced.
3. Call `batchUpdate` with the following two requests:
   1. [DeleteTextRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#deletetextrequest), specifying the range of text to delete.
   2. [InsertTextRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#inserttextrequest), specifying the same start position as well as the text string to be inserted.

To ensure atomicity when you replace text this way, make sure to include both
requests in the same batchUpdate call. This is shown in the following example,
which replaces all the text in a shape with new text:

### Apps Script

slides/api/Snippets.gs [View on GitHub](https://github.com/googleworkspace/apps-script-samples/blob/main/slides/api/Snippets.gs)

```javascript
/**
 * Remove existing text in the shape, then insert new text.
 * @param {string} presentationId
 * @param {string?} shapeId
 * @param {string} replacementText
 * @returns {*}
 */
function simpleTextReplace(presentationId, shapeId, replacementText) {
  const requests = [
    {
      deleteText: {
        objectId: shapeId,
        textRange: {
          type: "ALL",
        },
      },
    },
    {
      insertText: {
        objectId: shapeId,
        insertionIndex: 0,
        text: replacementText,
      },
    },
  ];

  // Execute the requests.
  try {
    const batchUpdateResponse = Slides.Presentations.batchUpdate(
      {
        requests: requests,
      },
      presentationId,
    );
    console.log("Replaced text in shape with ID: %s", shapeId);

    return batchUpdateResponse;
  } catch (err) {
    // TODO (Developer) - Handle exception
    console.log("Failed with error: %s", err.error);
  }
}
```

### Go

slides/snippets/presentations.go [View on GitHub](https://github.com/googleworkspace/go-samples/blob/main/slides/snippets/presentations.go)

```go
// Remove existing text in the shape, then insert the new text.
requests := []*slides.Request{{
	DeleteText: &slides.DeleteTextRequest{
		ObjectId: shapeId,
		TextRange: &slides.Range{
			Type: "All",
		},
	},
}, {
	InsertText: &slides.InsertTextRequest{
		ObjectId:       shapeId,
		InsertionIndex: 0,
		Text:           replacementText,
	},
}}

// Execute the requests.
body := &slides.BatchUpdatePresentationRequest{Requests: requests}
response, _ := slidesService.Presentations.BatchUpdate(presentationId, body).Do()
fmt.Printf("Replaced text in shape with ID: %s", shapeId)
```

### Java

slides/snippets/src/main/java/SimpleTextReplace.java [View on GitHub](https://github.com/googleworkspace/java-samples/blob/main/slides/snippets/src/main/java/SimpleTextReplace.java)

```java
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.slides.v1.Slides;
import com.google.api.services.slides.v1.SlidesScopes;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationRequest;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationResponse;
import com.google.api.services.slides.v1.model.DeleteTextRequest;
import com.google.api.services.slides.v1.model.InsertTextRequest;
import com.google.api.services.slides.v1.model.Range;
import com.google.api.services.slides.v1.model.Request;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/* Class to demonstrate the use of Slides Replace Text API */
public class SimpleTextReplace {
  /**
   * Remove existing text in the shape, then insert new text.
   *
   * @param presentationId  - id of the presentation.
   * @param shapeId         - id of the shape.
   * @param replacementText - New replacement text.
   * @return response
   * @throws IOException - if credentials file not found.
   */
  public static BatchUpdatePresentationResponse simpleTextReplace(
      String presentationId, String shapeId, String replacementText) throws IOException {
        /* Load pre-authorized user credentials from the environment.
           TODO(developer) - See https://developers.google.com/identity for
            guides on implementing OAuth2 for your application. */
    GoogleCredentials credentials = GoogleCredentials.getApplicationDefault()
        .createScoped(Collections.singleton(SlidesScopes.PRESENTATIONS));
    HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(
        credentials);

    // Create the slides API client
    Slides service = new Slides.Builder(new NetHttpTransport(),
        GsonFactory.getDefaultInstance(),
        requestInitializer)
        .setApplicationName("Slides samples")
        .build();

    // Remove existing text in the shape, then insert the new text.
    List<Request> requests = new ArrayList<>();
    requests.add(new Request()
        .setDeleteText(new DeleteTextRequest()
            .setObjectId(shapeId)
            .setTextRange(new Range()
                .setType("ALL"))));
    requests.add(new Request()
        .setInsertText(new InsertTextRequest()
            .setObjectId(shapeId)
            .setInsertionIndex(0)
            .setText(replacementText)));

    BatchUpdatePresentationResponse response = null;
    try {
      // Execute the requests.
      BatchUpdatePresentationRequest body =
          new BatchUpdatePresentationRequest().setRequests(requests);
      response = service.presentations().batchUpdate(presentationId, body).execute();
      System.out.println("Replaced text in shape with ID: " + shapeId);
    } catch (GoogleJsonResponseException e) {
      // TODO(developer) - handle error appropriately
      GoogleJsonError error = e.getDetails();
      if (error.getCode() == 400) {
        System.out.printf("Shape not found with id '%s'.\n", shapeId);
      } else if (error.getCode() == 404) {
        System.out.printf("Presentation not found with id '%s'.\n", presentationId);
      } else {
        throw e;
      }
    }
    return response;
  }
}
```

### JavaScript

slides/snippets/slides_simple_text_replace.js [View on GitHub](https://github.com/googleworkspace/browser-samples/blob/main/slides/snippets/slides_simple_text_replace.js)

```javascript
function simpleTextReplace(presentationId, shapeId, replacementText, callback) {
  // Remove existing text in the shape, then insert new text.
  const requests = [{
    deleteText: {
      objectId: shapeId,
      textRange: {
        type: 'ALL',
      },
    },
  }, {
    insertText: {
      objectId: shapeId,
      insertionIndex: 0,
      text: replacementText,
    },
  }];
  // Execute the requests.
  try {
    gapi.client.slides.presentations.batchUpdate({
      presentationId: presentationId,
      requests: requests,
    }).then((batchUpdateResponse) => {
      console.log(`Replaced text in shape with ID: ${shapeId}`);
      if (callback) callback(batchUpdateResponse.result);
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
}
```

### Node.js

slides/snippets/slides_simple_text_replace.js [View on GitHub](https://github.com/googleworkspace/node-samples/blob/main/slides/snippets/slides_simple_text_replace.js)

```javascript
import {GoogleAuth} from 'google-auth-library';
import {google} from 'googleapis';

/**
 * Replaces all text in a shape with new text.
 * @param {string} presentationId The ID of the presentation.
 * @param {string} shapeId The ID of the shape to update.
 * @param {string} replacementText The text to replace with.
 * @return {Promise<object>} The response from the batch update.
 */
async function simpleTextReplace(presentationId, shapeId, replacementText) {
  // Authenticate with Google and get an authorized client.
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/presentations',
  });

  // Create a new Slides API client.
  const service = google.slides({version: 'v1', auth});

  // The requests to delete the existing text and insert the new text.
  const requests = [
    {
      deleteText: {
        objectId: shapeId,
        textRange: {
          type: 'ALL',
        },
      },
    },
    {
      insertText: {
        objectId: shapeId,
        insertionIndex: 0,
        text: replacementText,
      },
    },
  ];

  // Execute the batch update request.
  const batchUpdateResponse = await service.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests,
    },
  });
  console.log(`Replaced text in shape with ID: ${shapeId}`);
  return batchUpdateResponse.data;
}
```

### PHP

slides/snippets/src/SlidesSimpleTextReplace.php [View on GitHub](https://github.com/googleworkspace/php-samples/blob/main/slides/snippets/src/SlidesSimpleTextReplace.php)

```php
<?php
use Google\Client;
use Google\Service\Drive;
use Google\Service\Slides;
use Google\Service\Slides\Request;

function simpleTextReplace($presentationId, $shapeId, $replacementText)
{
    /* Load pre-authorized user credentials from the environment.
       TODO(developer) - See https://developers.google.com/identity for
        guides on implementing OAuth2 for your application. */
    $client = new Google\Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(Google\Service\Drive::DRIVE);
    $slidesService = new Google_Service_Slides($client);
    // Remove existing text in the shape, then insert new text.
    $requests = array();
    $requests[] = new Google_Service_Slides_Request(array(
        'deleteText' => array(
            'objectId' => $shapeId,
            'textRange' => array(
                'type' => 'ALL'
            )
        )
    ));
    $requests[] = new Google_Service_Slides_Request(array(
        'insertText' => array(
            'objectId' => $shapeId,
            'insertionIndex' => 0,
            'text' => $replacementText
        )
    ));

    // Execute the requests.
    $batchUpdateRequest = new Google_Service_Slides_BatchUpdatePresentationRequest(array(
        'requests' => $requests
    ));
    $response = $slidesService->presentations->batchUpdate($presentationId, $batchUpdateRequest);
    printf("Replaced text in shape with ID: %s", $shapeId);
    return $response;
}
```

### Python

slides/snippets/slides_simple_text_replace.py [View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/slides/snippets/slides_simple_text_replace.py)

```python
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def simple_text_replace(presentation_id, shape_id, replacement_text):
  """
  Run simple_text_replace the user has access to.
  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """
  creds, _ = google.auth.default()
  # pylint: disable=maybe-no-member
  try:
    slides_service = build("slides", "v1", credentials=creds)
    # Remove existing text in the shape, then insert new text.
    requests = []
    requests.append(
        {"deleteText": {"objectId": shape_id, "textRange": {"type": "ALL"}}}
    )
    requests.append(
        {
            "insertText": {
                "objectId": shape_id,
                "insertionIndex": 0,
                "text": replacement_text,
            }
        }
    )

    # Execute the requests.
    body = {"requests": requests}
    response = (
        slides_service.presentations()
        .batchUpdate(presentationId=presentation_id, body=body)
        .execute()
    )
    print(f"Replaced text in shape with ID: {shape_id}")
    return response
  except HttpError as error:
    print(f"An error occurred: {error}")
    print("Text is not merged")
    return error


if __name__ == "__main__":
  # Put the presentation_id, shape_id and replacement_text
  simple_text_replace(
      "10QnVUx1X2qHsL17WUidGpPh_SQhXYx40CgIxaKk8jU4",
      "MyTextBox_6",
      "GWSpace_now",
  )
```

### Ruby

slides/snippets/lib/file_snippets.rb [View on GitHub](https://github.com/googleworkspace/ruby-samples/blob/main/slides/snippets/lib/file_snippets.rb)

```ruby
# Remove existing text in the shape, then insert new text.
requests = [] << {
  delete_text: {
    object_id_prop: shape_id,
    text_range:     {
      type: 'ALL'
    }
  }
} << {
  insert_text: {
    object_id_prop:  shape_id,
    insertion_index: 0,
    text:            replacement_text
  }
}

# Execute the requests.
req = Google::Apis::SlidesV1::BatchUpdatePresentationRequest.new(requests: requests)
response = slides_service.batch_update_presentation(
  presentation_id,
  req
)
puts "Replaced text in shape with ID: #{shape_id}"
```

## Changing character formatting

Character formatting determines the rendering of text characters in your
presentation, including typeface, color, and hyperlinking.

The concepts page [Text Structure and Styling](https://developers.google.com/workspace/slides/concepts/text) describes
how the Slides API represents text styling information.

To change the character formatting of text, use `batchUpdate` with the
[UpdateTextStyleRequest](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#updatetextstylerequest).
You need to provide the ID of the shape or table cell that contains the text,
as well as a [Range](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#range)
that includes the following information:

- The specifier `FIXED_RANGE`, together with the start and end indexes that define the text range you want to style.
- The specifier `FROM_START_INDEX`, together with a start index that defines the beginning of the text range you want to style.
- The specifier `ALL`, with no indexes, to style all the text in the target shape.

The following example performs several text styling operations on the text
that's contained in a shape:

- Sets the font of characters 0-4 to bold italics.
- Sets the color of characters 5-9 to `blue` 14-pt Times New Roman font.
- Hyperlinks characters 10-14 to `www.example.com`.

A straightforward way to do this is by building a list of requests and then
using one [batchUpdate](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate)
call:

### Apps Script

slides/api/Snippets.gs [View on GitHub](https://github.com/googleworkspace/apps-script-samples/blob/main/slides/api/Snippets.gs)

```javascript
/**
 * Update the text style so that the first 5 characters are bolded
 * and italicized, the next 5 are displayed in blue 14 pt Times
 * New Roman font, and the next 5 are hyperlinked.
 * @param {string} presentationId
 * @param {string} shapeId
 * @returns {*}
 */
function textStyleUpdate(presentationId, shapeId) {
  const requests = [
    {
      updateTextStyle: {
        objectId: shapeId,
        textRange: {
          type: "FIXED_RANGE",
          startIndex: 0,
          endIndex: 5,
        },
        style: {
          bold: true,
          italic: true,
        },
        fields: "bold,italic",
      },
    },
    {
      updateTextStyle: {
        objectId: shapeId,
        textRange: {
          type: "FIXED_RANGE",
          startIndex: 5,
          endIndex: 10,
        },
        style: {
          fontFamily: "Times New Roman",
          fontSize: {
            magnitude: 14,
            unit: "PT",
          },
          foregroundColor: {
            opaqueColor: {
              rgbColor: {
                blue: 1.0,
                green: 0.0,
                red: 0.0,
              },
            },
          },
        },
        fields: "foregroundColor,fontFamily,fontSize",
      },
    },
    {
      updateTextStyle: {
        objectId: shapeId,
        textRange: {
          type: "FIXED_RANGE",
          startIndex: 10,
          endIndex: 15,
        },
        style: {
          link: {
            url: "www.example.com",
          },
        },
        fields: "link",
      },
    },
  ];

  // Execute the requests.
  try {
    const batchUpdateResponse = Slides.Presentations.batchUpdate(
      {
        requests: requests,
      },
      presentationId,
    );
    console.log("Updated the text style for shape with ID: %s", shapeId);

    return batchUpdateResponse;
  } catch (err) {
    // TODO (Developer) - Handle exception
    console.log("Failed with error: %s", err.error);
  }
}
```

### Go

slides/snippets/presentations.go [View on GitHub](https://github.com/googleworkspace/go-samples/blob/main/slides/snippets/presentations.go)

```go
// Update the text style so that the first 5 characters are bolded
// and italicized, and the next 5 are displayed in blue 14 pt Times
// New Roman font, and the next five are hyperlinked.
requests := []*slides.Request{{
	UpdateTextStyle: &slides.UpdateTextStyleRequest{
		ObjectId: shapeId,
		TextRange: &slides.Range{
			Type:            "FIXED_RANGE",
			StartIndex:      ptrInt64(0),
			EndIndex:        ptrInt64(5),
			ForceSendFields: []string{"StartIndex"},
		},
		Style: &slides.TextStyle{
			Bold:   true,
			Italic: true,
		},
		Fields: "bold,italic",
	},
}, {
	UpdateTextStyle: &slides.UpdateTextStyleRequest{
		ObjectId: shapeId,
		TextRange: &slides.Range{
			Type:       "FIXED_RANGE",
			StartIndex: ptrInt64(5),
			EndIndex:   ptrInt64(10),
		},
		Style: &slides.TextStyle{
			FontFamily: "Times New Roman",
			FontSize: &slides.Dimension{
				Magnitude: 14.0,
				Unit:      "PT",
			},
			ForegroundColor: &slides.OptionalColor{
				OpaqueColor: &slides.OpaqueColor{
					RgbColor: &slides.RgbColor{
						Blue:  1.0,
						Green: 0.0,
						Red:   0.0,
					},
				},
			},
		},
		Fields: "foregroundColor,fontFamily,fontSize",
	},
}, {
	UpdateTextStyle: &slides.UpdateTextStyleRequest{
		ObjectId: shapeId,
		TextRange: &slides.Range{
			Type:       "FIXED_RANGE",
			StartIndex: ptrInt64(10),
			EndIndex:   ptrInt64(15),
		},
		Style: &slides.TextStyle{
			Link: &slides.Link{
				Url: "www.example.com",
			},
		},
		Fields: "link",
	},
}}

// Execute the requests.
body := &slides.BatchUpdatePresentationRequest{Requests: requests}
response, _ := slidesService.Presentations.BatchUpdate(presentationId, body).Do()
fmt.Printf("Updated text style for shape with ID: %s", shapeId)
```

### Java

slides/snippets/src/main/java/TextStyleUpdate.java [View on GitHub](https://github.com/googleworkspace/java-samples/blob/main/slides/snippets/src/main/java/TextStyleUpdate.java)

```java
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.slides.v1.Slides;
import com.google.api.services.slides.v1.SlidesScopes;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationRequest;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationResponse;
import com.google.api.services.slides.v1.model.Dimension;
import com.google.api.services.slides.v1.model.Link;
import com.google.api.services.slides.v1.model.OpaqueColor;
import com.google.api.services.slides.v1.model.OptionalColor;
import com.google.api.services.slides.v1.model.Range;
import com.google.api.services.slides.v1.model.Request;
import com.google.api.services.slides.v1.model.RgbColor;
import com.google.api.services.slides.v1.model.TextStyle;
import com.google.api.services.slides.v1.model.UpdateTextStyleRequest;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/* Class to demonstrate the use of Slide Text Structure and Styling API */
public class TextStyleUpdate {
  /**
   * Styles text in the shape.
   *
   * @param presentationId - id of the presentation.
   * @param shapeId        - id of the shape.
   * @return shape id
   * @throws IOException - if credentials file not found.
   */
  public static BatchUpdatePresentationResponse textStyleUpdate(String presentationId,
                                                                String shapeId)
      throws IOException {
        /* Load pre-authorized user credentials from the environment.
           TODO(developer) - See https://developers.google.com/identity for
            guides on implementing OAuth2 for your application. */
    GoogleCredentials credentials = GoogleCredentials.getApplicationDefault()
        .createScoped(Collections.singleton(SlidesScopes.PRESENTATIONS));
    HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(
        credentials);

    // Create the slides API client
    Slides service = new Slides.Builder(new NetHttpTransport(),
        GsonFactory.getDefaultInstance(),
        requestInitializer)
        .setApplicationName("Slides samples")
        .build();

    // Update the text style so that the first 5 characters are bolded
    // and italicized, and the next 5 are displayed in blue 14 pt Times
    // New Roman font, and the next five are hyperlinked.
    List<Request> requests = new ArrayList<>();
    requests.add(new Request()
        .setUpdateTextStyle(new UpdateTextStyleRequest()
            .setObjectId(shapeId)
            .setTextRange(new Range()
                .setType("FIXED_RANGE")
                .setStartIndex(0)
                .setEndIndex(5))
            .setStyle(new TextStyle()
                .setBold(true)
                .setItalic(true))
            .setFields("bold,italic")));
    requests.add(new Request()
        .setUpdateTextStyle(new UpdateTextStyleRequest()
            .setObjectId(shapeId)
            .setTextRange(new Range()
                .setType("FIXED_RANGE")
                .setStartIndex(5)
                .setEndIndex(10))
            .setStyle(new TextStyle()
                .setFontFamily("Times New Roman")
                .setFontSize(new Dimension()
                    .setMagnitude(14.0)
                    .setUnit("PT"))
                .setForegroundColor(new OptionalColor()
                    .setOpaqueColor(new OpaqueColor()
                        .setRgbColor(new RgbColor()
                            .setBlue(1.0F)
                            .setGreen(0.0F)
                            .setRed(0.0F)))))
            .setFields("foregroundColor,fontFamily,fontSize")));
    requests.add(new Request()
        .setUpdateTextStyle(new UpdateTextStyleRequest()
            .setObjectId(shapeId)
            .setTextRange(new Range()
                .setType("FIXED_RANGE")
                .setStartIndex(10)
                .setEndIndex(15))
            .setStyle(new TextStyle()
                .setLink(new Link()
                    .setUrl("www.example.com")))
            .setFields("link")));

    BatchUpdatePresentationResponse response = null;
    try {
      // Execute the requests.
      BatchUpdatePresentationRequest body =
          new BatchUpdatePresentationRequest().setRequests(requests);
      response = service.presentations().batchUpdate(presentationId, body).execute();
      System.out.println("Updated text style for shape with ID: " + shapeId);
    } catch (GoogleJsonResponseException e) {
      // TODO(developer) - handle error appropriately
      GoogleJsonError error = e.getDetails();
      if (error.getCode() == 400) {
        System.out.printf("Shape not found with id '%s'.\n", shapeId);
      } else if (error.getCode() == 404) {
        System.out.printf("Presentation not found with id '%s'.\n", presentationId);
      } else {
        throw e;
      }
    }
    return response;
  }
}
```

### JavaScript

slides/snippets/slides_text_style_update.js [View on GitHub](https://github.com/googleworkspace/browser-samples/blob/main/slides/snippets/slides_text_style_update.js)

```javascript
function textStyleUpdate(presentationId, shapeId, callback) {
  // Update the text style so that the first 5 characters are bolded
  // and italicized, the next 5 are displayed in blue 14 pt Times
  // New Roman font, and the next 5 are hyperlinked.
  const requests = [{
    updateTextStyle: {
      objectId: shapeId,
      textRange: {
        type: 'FIXED_RANGE',
        startIndex: 0,
        endIndex: 5,
      },
      style: {
        bold: true,
        italic: true,
      },
      fields: 'bold,italic',
    },
  }, {
    updateTextStyle: {
      objectId: shapeId,
      textRange: {
        type: 'FIXED_RANGE',
        startIndex: 5,
        endIndex: 10,
      },
      style: {
        fontFamily: 'Times New Roman',
        fontSize: {
          magnitude: 14,
          unit: 'PT',
        },
        foregroundColor: {
          opaqueColor: {
            rgbColor: {
              blue: 1.0,
              green: 0.0,
              red: 0.0,
            },
          },
        },
      },
      fields: 'foregroundColor,fontFamily,fontSize',
    },
  }, {
    updateTextStyle: {
      objectId: shapeId,
      textRange: {
        type: 'FIXED_RANGE',
        startIndex: 10,
        endIndex: 15,
      },
      style: {
        link: {
          url: 'www.example.com',
        },
      },
      fields: 'link',
    },
  }];
  // Execute the requests.
  try {
    gapi.client.slides.presentations.batchUpdate({
      presentationId: presentationId,
      requests: requests,
    }).then((batchUpdateResponse) => {
      console.log(`Updated the text style for shape with ID: ${shapeId}`);
      if (callback) callback(batchUpdateResponse.result);
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
}
```

### Node.js

slides/snippets/slides_text_style_update.js [View on GitHub](https://github.com/googleworkspace/node-samples/blob/main/slides/snippets/slides_text_style_update.js)

```javascript
import {GoogleAuth} from 'google-auth-library';
import {google} from 'googleapis';

/**
 * Updates the text style of a shape in a presentation.
 * @param {string} presentationId The ID of the presentation.
 * @param {string} shapeId The ID of the shape to update.
 * @return {Promise<object>} The response from the batch update.
 */
async function textStyleUpdate(presentationId, shapeId) {
  // Authenticate with Google and get an authorized client.
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/presentations',
  });

  // Create a new Slides API client.
  const service = google.slides({version: 'v1', auth});

  // The requests to update the text style.
  const requests = [
    // Bold and italicize the first 5 characters.
    {
      updateTextStyle: {
        objectId: shapeId,
        textRange: {
          type: 'FIXED_RANGE',
          startIndex: 0,
          endIndex: 5,
        },
        style: {
          bold: true,
          italic: true,
        },
        fields: 'bold,italic',
      },
    },
    // Set the next 5 characters to 14pt Times New Roman, and blue.
    {
      updateTextStyle: {
        objectId: shapeId,
        textRange: {
          type: 'FIXED_RANGE',
          startIndex: 5,
          endIndex: 10,
        },
        style: {
          fontFamily: 'Times New Roman',
          fontSize: {
            magnitude: 14,
            unit: 'PT',
          },
          foregroundColor: {
            opaqueColor: {
              rgbColor: {
                blue: 1.0,
                green: 0.0,
                red: 0.0,
              },
            },
          },
        },
        fields: 'foregroundColor,fontFamily,fontSize',
      },
    },
    // Hyperlink the next 5 characters.
    {
      updateTextStyle: {
        objectId: shapeId,
        textRange: {
          type: 'FIXED_RANGE',
          startIndex: 10,
          endIndex: 15,
        },
        style: {
          link: {
            url: 'www.example.com',
          },
        },
        fields: 'link',
      },
    },
  ];

  // Execute the batch update request.
  const batchUpdateResponse = await service.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests,
    },
  });
  console.log(`Updated the text style for shape with ID: ${shapeId}`);
  return batchUpdateResponse.data;
}
```

### PHP

slides/snippets/src/SlidesTextStyleUpdate.php [View on GitHub](https://github.com/googleworkspace/php-samples/blob/main/slides/snippets/src/SlidesTextStyleUpdate.php)

```php
<?php

use Google\Client;
use Google\Service\Drive;
use Google\Service\Slides;
use Google\Service\Slides\Request;
use Google\Service\Slides\BatchUpdatePresentationRequest;


function textStyleUpdate($presentationId, $shapeId)
{
    /* Load pre-authorized user credentials from the environment.
       TODO(developer) - See https://developers.google.com/identity for
        guides on implementing OAuth2 for your application. */
    $client = new Google\Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(Google\Service\Drive::DRIVE);
    $slidesService = new Google_Service_Slides($client);
    $requests = array();
    $requests[] = new Google_Service_Slides_Request(array(
        'updateTextStyle' => array(
            'objectId' => $shapeId,
            'textRange' => array(
                'type' => 'FIXED_RANGE',
                'startIndex' => 0,
                'endIndex' => 5
            ),
            'style' => array(
                'bold' => true,
                'italic' => true
            ),
            'fields' => 'bold,italic'
        )
    ));
    $requests[] = new Google_Service_Slides_Request(array(
        'updateTextStyle' => array(
            'objectId' => $shapeId,
            'textRange' => array(
                'type' => 'FIXED_RANGE',
                'startIndex' => 5,
                'endIndex' => 10
            ),
            'style' => array(
                'fontFamily' => 'Times New Roman',
                'fontSize' => array(
                    'magnitude' => 14,
                    'unit' => 'PT'
                ),
                'foregroundColor' => array(
                    'opaqueColor' => array(
                        'rgbColor' => array(
                            'blue' => 1.0,
                            'green' => 0.0,
                            'red' => 0.0
                        )
                    )
                )
            ),
            'fields' => 'foregroundColor,fontFamily,fontSize'
        )
    ));
    $requests[] = new Google_Service_Slides_Request(array(
        'updateTextStyle' => array(
            'objectId' => $shapeId,
            'textRange' => array(
                'type' => 'FIXED_RANGE',
                'startIndex' => 10,
                'endIndex' => 15
            ),
            'style' => array(
                'link' => array(
                    'url' => 'www.example.com'
                )
            ),
            'fields' => 'link'
        )
    ));

    // Execute the requests.
    $batchUpdateRequest = new Google_Service_Slides_BatchUpdatePresentationRequest(array(
        'requests' => $requests
    ));
    $response = $slidesService->presentations->batchUpdate($presentationId, $batchUpdateRequest);
    printf("Updated the text style for shape with ID: %s", $shapeId);
    return $response;
}
```

### Python

slides/snippets/slides_text_style_update.py [View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/slides/snippets/slides_text_style_update.py)

```python
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def text_style_update(presentation_id, shape_id):
  """
  create_sheets_chart the user has access to.
  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """
  creds, _ = google.auth.default()
  # pylint: disable=maybe-no-member
  try:
    service = build("slides", "v1", credentials=creds)
    # Update the text style so that the first 5 characters are bolded
    # and italicized, the next 5 are displayed in blue 14 pt Times
    # New Roman font, and the next 5 are hyperlinked.
    requests = [
        {
            "updateTextStyle": {
                "objectId": shape_id,
                "textRange": {
                    "type": "FIXED_RANGE",
                    "startIndex": 0,
                    "endIndex": 5,
                },
                "style": {"bold": True, "italic": True},
                "fields": "bold,italic",
            }
        },
        {
            "updateTextStyle": {
                "objectId": shape_id,
                "textRange": {
                    "type": "FIXED_RANGE",
                    "startIndex": 5,
                    "endIndex": 10,
                },
                "style": {
                    "fontFamily": "Times New Roman",
                    "fontSize": {"magnitude": 14, "unit": "PT"},
                    "foregroundColor": {
                        "opaqueColor": {
                            "rgbColor": {
                                "blue": 1.0,
                                "green": 0.0,
                                "red": 0.0,
                            }
                        }
                    },
                },
                "fields": "foregroundColor,fontFamily,fontSize",
            }
        },
        {
            "updateTextStyle": {
                "objectId": shape_id,
                "textRange": {
                    "type": "FIXED_RANGE",
                    "startIndex": 10,
                    "endIndex": 15,
                },
                "style": {"link": {"url": "www.example.com"}},
                "fields": "link",
            }
        },
    ]

    # Execute the requests.
    body = {"requests": requests}
    response = (
        service.presentations()
        .batchUpdate(presentationId=presentation_id, body=body)
        .execute()
    )
    print(f"Updated the text style for shape with ID:{shape_id}")

    return response
  except HttpError as error:
    print(f"An error occurred: {error}")
    return error


if __name__ == "__main__":
  # Put the presentation_id, shape_id of slides
  # to be submitted.
  text_style_update(
      "10QnVUx1X2qHsL17WUidGpPh_SQhXYx40CgIxaKk8jU4", "MyTextBox_9"
  )
```

### Ruby

slides/snippets/lib/file_snippets.rb [View on GitHub](https://github.com/googleworkspace/ruby-samples/blob/main/slides/snippets/lib/file_snippets.rb)

```ruby
# Update the text style so that the first 5 characters are bolded
# and italicized, the next 5 are displayed in blue 14 pt Times
# New Roman font, and the next 5 are hyperlinked.
requests = [] << {
  update_text_style: {
    object_id_prop: shape_id,
    text_range:     {
      type:        'FIXED_RANGE',
      start_index: 0,
      end_index:   5
    },
    style:          {
      bold:   true,
      italic: true
    },
    fields:         'bold,italic'
  }
} << {
  update_text_style: {
    object_id_prop: shape_id,
    text_range:     {
      type:        'FIXED_RANGE',
      start_index: 5,
      end_index:   10
    },
    style:          {
      font_family:      'Times New Roman',
      font_size:        {
        magnitude: 14,
        unit:      'PT'
      },
      foreground_color: {
        opaque_color: {
          rgb_color: {
            blue:  1.0,
            green: 0.0,
            red:   0.0
          }
        }
      }
    },
    fields:         'foreground_color,font_family,font_size'
  }
} << {
  update_text_style: {
    object_id_prop: shape_id,
    text_range:     {
      type:        'FIXED_RANGE',
      start_index: 10,
      end_index:   15
    },
    style:          {
      link: {
        url: 'www.example.com'
      }
    },
    fields:         'link'
  }
}

# Execute the requests.
req = Google::Apis::SlidesV1::BatchUpdatePresentationRequest.new(requests: requests)
response = slides_service.batch_update_presentation(presentation_id, req)
puts "Updated the text style for shape with ID: #{shape_id}"
```

## Changing paragraph formatting

Paragraph formatting determines how blocks of text are rendered in your
presentation, including alignment, indentation, and list ornamentation.

The concepts page [Text Structure and Styling](https://developers.google.com/workspace/slides/concepts/text) describes
how the \[\[slides_api_short\]\] represents paragraph styling information.

The Slides API supports updating paragraph styles, converting plain paragraphs
to bulleted lists, and removing bullets from paragraphs.

### Converting paragraphs to a list

A common paragraph formatting operation is converting paragraphs into a
bulleted list. The following example converts all the paragraphs of a shape
to a bulleted list, and specifies an explicit bullet glyph to use.

### Apps Script

slides/api/Snippets.gs [View on GitHub](https://github.com/googleworkspace/apps-script-samples/blob/main/slides/api/Snippets.gs)

```javascript
/**
 * Add arrow-diamond-disc bullets to all text in the shape.
 */
function createBulletedText(presentationId, shapeId) {
  const requests = [
    {
      createParagraphBullets: {
        objectId: shapeId,
        textRange: {
          type: "ALL",
        },
        bulletPreset: "BULLET_ARROW_DIAMOND_DISC",
      },
    },
  ];

  // Execute the requests.
  try {
    const batchUpdateResponse = Slides.Presentations.batchUpdate(
      {
        requests: requests,
      },
      presentationId,
    );
    console.log("Added bullets to text in shape with ID: %s", shapeId);

    return batchUpdateResponse;
  } catch (err) {
    // TODO (Developer) - Handle exception
    console.log("Failed with error: %s", err.error);
  }
}
```

### Go

slides/snippets/presentations.go [View on GitHub](https://github.com/googleworkspace/go-samples/blob/main/slides/snippets/presentations.go)

```go
// Add arrow-diamond-disc bullets to all text in the shape.
requests := []*slides.Request{{
	CreateParagraphBullets: &slides.CreateParagraphBulletsRequest{
		ObjectId: shapeId,
		TextRange: &slides.Range{
			Type: "ALL",
		},
		BulletPreset: "BULLET_ARROW_DIAMOND_DISC",
	},
}}

// Execute the requests.
body := &slides.BatchUpdatePresentationRequest{Requests: requests}
response, _ := slidesService.Presentations.BatchUpdate(presentationId, body).Do()
fmt.Printf("Added a linked Sheets chart with ID %s", shapeId)
```

### Java

slides/snippets/src/main/java/CreateBulletedText.java [View on GitHub](https://github.com/googleworkspace/java-samples/blob/main/slides/snippets/src/main/java/CreateBulletedText.java)

```java
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.slides.v1.Slides;
import com.google.api.services.slides.v1.SlidesScopes;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationRequest;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationResponse;
import com.google.api.services.slides.v1.model.CreateParagraphBulletsRequest;
import com.google.api.services.slides.v1.model.Range;
import com.google.api.services.slides.v1.model.Request;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/* Class to demonstrate the use of Slide Create Bulleted Text API */
public class CreateBulletedText {
  /**
   * Add arrow-diamond-disc bullets to all text in the shape.
   *
   * @param presentationId - id of the presentation.
   * @param shapeId        - id of the shape.
   * @return response
   * @throws IOException - if credentials file not found.
   */
  public static BatchUpdatePresentationResponse createBulletedText(String presentationId,
                                                                   String shapeId)
      throws IOException {
        /* Load pre-authorized user credentials from the environment.
           TODO(developer) - See https://developers.google.com/identity for
            guides on implementing OAuth2 for your application. */
    GoogleCredentials credentials = GoogleCredentials.getApplicationDefault()
        .createScoped(Collections.singleton(SlidesScopes.PRESENTATIONS));
    HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(
        credentials);

    // Create the slides API client
    Slides service = new Slides.Builder(new NetHttpTransport(),
        GsonFactory.getDefaultInstance(),
        requestInitializer)
        .setApplicationName("Slides samples")
        .build();

    // Add arrow-diamond-disc bullets to all text in the shape.
    List<Request> requests = new ArrayList<>();
    requests.add(new Request()
        .setCreateParagraphBullets(new CreateParagraphBulletsRequest()
            .setObjectId(shapeId)
            .setTextRange(new Range()
                .setType("ALL"))
            .setBulletPreset("BULLET_ARROW_DIAMOND_DISC")));

    BatchUpdatePresentationResponse response = null;
    try {
      // Execute the request.
      BatchUpdatePresentationRequest body =
          new BatchUpdatePresentationRequest().setRequests(requests);
      response = service.presentations().batchUpdate(presentationId, body).execute();
      System.out.println("Added bullets to text in shape with ID: " + shapeId);
    } catch (GoogleJsonResponseException e) {
      // TODO(developer) - handle error appropriately
      GoogleJsonError error = e.getDetails();
      if (error.getCode() == 400) {
        System.out.printf("Shape not found with id '%s'.\n", shapeId);
      } else if (error.getCode() == 404) {
        System.out.printf("Presentation not found with id '%s'.\n", presentationId);
      } else {
        throw e;
      }
    }
    return response;
  }
}
```

### JavaScript

slides/snippets/slides_create_bulleted_text.js [View on GitHub](https://github.com/googleworkspace/browser-samples/blob/main/slides/snippets/slides_create_bulleted_text.js)

```javascript
function createBulletedText(presentationId, shapeId, callback) {
  // Add arrow-diamond-disc bullets to all text in the shape.
  const requests = [{
    createParagraphBullets: {
      objectId: shapeId,
      textRange: {
        type: 'ALL',
      },
      bulletPreset: 'BULLET_ARROW_DIAMOND_DISC',
    },
  }];
  // Execute the requests.
  try {
    gapi.client.slides.presentations.batchUpdate({
      presentationId: presentationId,
      requests: requests,
    }).then((batchUpdateResponse) => {
      console.log(`Added bullets to text in shape with ID: ${shapeId}`);
      if (callback) callback(batchUpdateResponse.result);
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
}
```

### Node.js

slides/snippets/slides_create_bulleted_text.js [View on GitHub](https://github.com/googleworkspace/node-samples/blob/main/slides/snippets/slides_create_bulleted_text.js)

```javascript
import {GoogleAuth} from 'google-auth-library';
import {google} from 'googleapis';

/**
 * Adds bullet points to text in a shape.
 * @param {string} presentationId The ID of the presentation.
 * @param {string} shapeId The ID of the shape to add bullets to.
 * @return {Promise<object>} The response from the batch update.
 */
async function createBulletedText(presentationId, shapeId) {
  // Authenticate with Google and get an authorized client.
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/presentations',
  });

  // Create a new Slides API client.
  const service = google.slides({version: 'v1', auth});

  // The request to add bullet points to the text.
  const requests = [
    {
      createParagraphBullets: {
        objectId: shapeId,
        textRange: {
          type: 'ALL',
        },
        bulletPreset: 'BULLET_ARROW_DIAMOND_DISC',
      },
    },
  ];

  // Execute the batch update request.
  const batchUpdateResponse = await service.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests,
    },
  });
  console.log(`Added bullets to text in shape with ID: ${shapeId}`);
  return batchUpdateResponse.data;
}
```

### PHP

slides/snippets/src/SlidesCreateBulletedText.php [View on GitHub](https://github.com/googleworkspace/php-samples/blob/main/slides/snippets/src/SlidesCreateBulletedText.php)

```php
<?php
use Google\Client;
use Google\Service\Drive;
use Google\Service\Slides;
use Google\Service\Slides\Request;


function createBulletedText($presentationId, $shapeId)
{
    /* Load pre-authorized user credentials from the environment.
       TODO(developer) - See https://developers.google.com/identity for
        guides on implementing OAuth2 for your application. */
    $client = new Google\Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(Google\Service\Drive::DRIVE);
    $slidesService = new Google_Service_Slides($client);
    // Add arrow-diamond-disc bullets to all text in the shape.
    $requests = array();
    $requests[] = new Google_Service_Slides_Request(array(
        'createParagraphBullets' => array(
            'objectId' => $shapeId,
            'textRange' => array(
                'type' => 'ALL'
            ),
            'bulletPreset' => 'BULLET_ARROW_DIAMOND_DISC'
        )
    ));

    // Execute the request.
    $batchUpdateRequest = new Google_Service_Slides_BatchUpdatePresentationRequest(array(
        'requests' => $requests
    ));
    $response = $slidesService->presentations->batchUpdate($presentationId, $batchUpdateRequest);
    printf("Added bullets to text in shape with ID: %s", $shapeId);
    return $response;
}
```

### Python

slides/snippets/slides_create_bulleted_text.py [View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/slides/snippets/slides_create_bulleted_text.py)

```python
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def create_bulleted_text(presentation_id, shape_id):
  """
  Run create_bulleted_text the user has access to.
  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """
  creds, _ = google.auth.default()
  # pylint: disable=maybe-no-member
  try:
    slides_service = build("slides", "v1", credentials=creds)
    # Add arrow-diamond-disc bullets to all text in the shape.
    requests = [
        {
            "createParagraphBullets": {
                "objectId": shape_id,
                "textRange": {"type": "ALL"},
                "bulletPreset": "BULLET_ARROW_DIAMOND_DISC",
            }
        }
    ]

    # Execute the requests.
    body = {"requests": requests}
    response = (
        slides_service.presentations()
        .batchUpdate(presentationId=presentation_id, body=body)
        .execute()
    )
    print(f"Added bullets to text in shape with ID: {shape_id}")

    return response
  except HttpError as error:
    print(f"An error occurred: {error}")
    return error


if __name__ == "__main__":
  # Put the presentation_id and shape_id
  # to be submitted.
  create_bulleted_text(
      "1VD1xmi1-9DonI4zmCKENTzlVxIL5SdGGTmbHmnBjQ1E", "MyTextBox_9"
  )
```

### Ruby

slides/snippets/lib/file_snippets.rb [View on GitHub](https://github.com/googleworkspace/ruby-samples/blob/main/slides/snippets/lib/file_snippets.rb)

```ruby
# Add arrow-diamond-disc bullets to all text in the shape.
requests = [] << {
  create_paragraph_bullets: {
    object_id_prop: shape_id,
    text_range:     {
      type: 'ALL'
    },
    bulletPreset:   'BULLET_ARROW_DIAMOND_DISC'
  }
}

# Execute the requests.
req = Google::Apis::SlidesV1::BatchUpdatePresentationRequest.new(requests: requests)
response = slides_service.batch_update_presentation(presentation_id, req)
puts "Added bullets to text in shape with ID: #{shape_id}"
```