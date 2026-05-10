# Add shapes and text to a slide

This guide explains how to use the Google Slides API to add shapes to slides
and insert text into shapes.

Each slide in a presentation can contain a number of *page elements*, each of
which is one of the following elements:

- [`Shape`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/shapes#shape)
- [`Image`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/images#image)
- [`Video`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/videos#video)
- [`Line`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/lines#line)
- [`Table`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/tables#table)
- [`WordArt`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#wordart)
- [`SheetsChart`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/charts#sheetschart)
- [`Group`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#group)

## Shapes

A [`Shape`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/shapes#shape) is a
page element such as a rectangle, arc, arrow, text box, or other defined type of
shape. When you create a shape, you specify:

- What type of shape it is, using one of the [predefined shape
  types](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages/shapes#type).

- [`PageElementProperties`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#PageElementProperties)
  such as size, transform, and the containing "parent" slide ID.

- An optional unique object ID.

The `transform` page property defines how the shape is rendered on the page,
including its location and scaling. For more information about transforms, see
[Size and position page elements](https://developers.google.com/workspace/slides/how-tos/transform).

## Text and shapes

Text can appear on a slide in one of two ways:

- Within a shape
- Within a cell in a table

You insert text into a shape or table cell using an
[`InsertTextRequest`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#inserttextrequest).

Any text
[`Autofit`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/shapes#autofit)
settings on the shape are automatically deactivated by requests that can impact
how text fits in the shape.

## Example

The following example adds a square text box to an existing slide and inserts
some text into it:

### Apps Script

slides/api/Snippets.gs [View on GitHub](https://github.com/googleworkspace/apps-script-samples/blob/main/slides/api/Snippets.gs)

```javascript
/**
 * Create a new square textbox, using the supplied element ID.
 * @param {string} presentationId
 * @param {string} pageId
 * @returns {*}
 */
function createTextboxWithText(presentationId, pageId) {
  const elementId = "MyTextBox_01";
  const pt350 = {
    magnitude: 350,
    unit: "PT",
  };
  const requests = [
    {
      createShape: {
        objectId: elementId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: pageId,
          size: {
            height: pt350,
            width: pt350,
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 350,
            translateY: 100,
            unit: "PT",
          },
        },
      },
    },
    // Insert text into the box, using the supplied element ID.
    {
      insertText: {
        objectId: elementId,
        insertionIndex: 0,
        text: "New Box Text Inserted!",
      },
    },
  ];

  // Execute the request.
  try {
    const createTextboxWithTextResponse = Slides.Presentations.batchUpdate(
      {
        requests: requests,
      },
      presentationId,
    );
    const createShapeResponse =
      createTextboxWithTextResponse.replies[0].createShape;
    console.log("Created textbox with ID: %s", createShapeResponse.objectId);

    return createTextboxWithTextResponse;
  } catch (err) {
    // TODO (Developer) - Handle exception
    console.log("Failed with error: %s", err.error);
  }
}
```

### Go

slides/snippets/presentations.go [View on GitHub](https://github.com/googleworkspace/go-samples/blob/main/slides/snippets/presentations.go)

```go
// Create a new square text box, using a supplied object ID.
textBoxId := "MyTextBox_01"
pt350 := slides.Dimension{
	Magnitude: 350,
	Unit:      "PT",
}
requests := []*slides.Request{{
	// Create a new square text box, using a supplied object ID.
	CreateShape: &slides.CreateShapeRequest{
		ObjectId:  textBoxId,
		ShapeType: "TEXT_BOX",
		ElementProperties: &slides.PageElementProperties{
			PageObjectId: slideId,
			Size: &slides.Size{
				Height: &pt350,
				Width:  &pt350,
			},
			Transform: &slides.AffineTransform{
				ScaleX:     1.0,
				ScaleY:     1.0,
				TranslateX: 350.0,
				TranslateY: 100.0,
				Unit:       "PT",
			},
		},
	},
}, {
	// Insert text into the box, using the object ID given to it.
	InsertText: &slides.InsertTextRequest{
		ObjectId:       textBoxId,
		InsertionIndex: 0,
		Text:           "New Box Text Inserted",
	},
}}

// Execute the requests.
body := &slides.BatchUpdatePresentationRequest{
	Requests: requests,
}
response, err := slidesService.Presentations.BatchUpdate(presentationId, body).Do()
if err != nil {
	log.Printf("Unable to create text box. %v", err)
}
fmt.Printf("Created text box with ID: %s", response.Replies[0].CreateShape.ObjectId)
```

### Java

slides/snippets/src/main/java/CreateTextboxWithText.java [View on GitHub](https://github.com/googleworkspace/java-samples/blob/main/slides/snippets/src/main/java/CreateTextboxWithText.java)

```java
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.slides.v1.Slides;
import com.google.api.services.slides.v1.SlidesScopes;
import com.google.api.services.slides.v1.model.AffineTransform;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationRequest;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationResponse;
import com.google.api.services.slides.v1.model.CreateShapeRequest;
import com.google.api.services.slides.v1.model.CreateShapeResponse;
import com.google.api.services.slides.v1.model.Dimension;
import com.google.api.services.slides.v1.model.InsertTextRequest;
import com.google.api.services.slides.v1.model.PageElementProperties;
import com.google.api.services.slides.v1.model.Request;
import com.google.api.services.slides.v1.model.Size;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/* Class to demonstrate the use of Slides Create Textbox API */
public class CreateTextboxWithText {
  /**
   * Create a new square textbox, using the specified id.
   *
   * @param presentationId - id of the presentation.
   * @param slideId        - id of the slide.
   * @param textBoxId      - id for the textbox.
   * @return textbox id
   * @throws IOException - if credentials file not found.
   */
  public static BatchUpdatePresentationResponse createTextBoxWithText(
      String presentationId, String slideId, String textBoxId) throws IOException {
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

    // Create a new square text box, using a supplied object ID.
    List<Request> requests = new ArrayList<>();
    Dimension pt350 = new Dimension().setMagnitude(350.0).setUnit("PT");
    requests.add(new Request()
        .setCreateShape(new CreateShapeRequest()
            .setObjectId(textBoxId)
            .setShapeType("TEXT_BOX")
            .setElementProperties(new PageElementProperties()
                .setPageObjectId(slideId)
                .setSize(new Size()
                    .setHeight(pt350)
                    .setWidth(pt350))
                .setTransform(new AffineTransform()
                    .setScaleX(1.0)
                    .setScaleY(1.0)
                    .setTranslateX(350.0)
                    .setTranslateY(100.0)
                    .setUnit("PT")))));

    // Insert text into the box, using the object ID given to it.
    requests.add(new Request()
        .setInsertText(new InsertTextRequest()
            .setObjectId(textBoxId)
            .setInsertionIndex(0)
            .setText("New Box Text Inserted")));
    BatchUpdatePresentationResponse response = null;

    try {
      // Execute the requests.
      BatchUpdatePresentationRequest body =
          new BatchUpdatePresentationRequest().setRequests(requests);
      response = service.presentations().batchUpdate(presentationId, body).execute();
      CreateShapeResponse createShapeResponse = response.getReplies().get(0).getCreateShape();
      System.out.println("Created textbox with ID: " + createShapeResponse.getObjectId());
    } catch (GoogleJsonResponseException e) {
      // TODO(developer) - handle error appropriately
      GoogleJsonError error = e.getDetails();
      if (error.getCode() == 404) {
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

slides/snippets/slides_create_textbox_with_text.js [View on GitHub](https://github.com/googleworkspace/browser-samples/blob/main/slides/snippets/slides_create_textbox_with_text.js)

```javascript
function createTextboxWithText(presentationId, pageId, callback) {
  // Create a new square textbox, using the supplied element ID.
  const elementId = 'MyTextBox_01';
  const pt350 = {
    magnitude: 350,
    unit: 'PT',
  };
  const requests = [{
    createShape: {
      objectId: elementId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: pageId,
        size: {
          height: pt350,
          width: pt350,
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 350,
          translateY: 100,
          unit: 'PT',
        },
      },
    },
  },

  // Insert text into the box, using the supplied element ID.
  {
    insertText: {
      objectId: elementId,
      insertionIndex: 0,
      text: 'New Box Text Inserted!',
    },
  }];
  // Execute the request.
  try {
    gapi.client.slides.presentations.batchUpdate({
      presentationId: presentationId,
      requests: requests,
    }).then((createTextboxWithTextResponse) => {
      const createShapeResponse = createTextboxWithTextResponse.result.replies[0].createShape;
      console.log(`Created textbox with ID: ${createShapeResponse.objectId}`);
      if (callback) callback(createTextboxWithTextResponse.result);
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
}
```

### Node.js

slides/snippets/slides_create_textbox_with_text.js [View on GitHub](https://github.com/googleworkspace/node-samples/blob/main/slides/snippets/slides_create_textbox_with_text.js)

```javascript
import {GoogleAuth} from 'google-auth-library';
import {google} from 'googleapis';

/**
 * Creates a textbox with text on a slide.
 * @param {string} presentationId The ID of the presentation.
 * @param {string} pageId The ID of the page to add the textbox to.
 * @return {Promise<object>} The response from the batch update.
 */
async function createTextboxWithText(presentationId, pageId) {
  // Authenticate with Google and get an authorized client.
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/presentations',
  });

  // Create a new Slides API client.
  const service = google.slides({version: 'v1', auth});

  // The ID to use for the new textbox.
  const elementId = 'MyTextBox_01';

  // The size of the new textbox, in points.
  const pt350 = {
    magnitude: 350,
    unit: 'PT',
  };

  // The requests to create a textbox and add text to it.
  const requests = [
    {
      createShape: {
        objectId: elementId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: pageId,
          size: {
            height: pt350,
            width: pt350,
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 350,
            translateY: 100,
            unit: 'PT',
          },
        },
      },
    },
    // Insert text into the new textbox.
    {
      insertText: {
        objectId: elementId,
        insertionIndex: 0,
        text: 'New Box Text Inserted!',
      },
    },
  ];

  // Execute the batch update request.
  const createTextboxWithTextResponse = await service.presentations.batchUpdate(
    {
      presentationId,
      requestBody: {requests},
    },
  );
  const createShapeResponse =
    createTextboxWithTextResponse.data.replies[0].createShape;
  console.log(`Created textbox with ID: ${createShapeResponse.objectId}`);
  return createTextboxWithTextResponse.data;
}
```

### PHP

slides/snippets/src/SlidesCreateTextboxWithText.php [View on GitHub](https://github.com/googleworkspace/php-samples/blob/main/slides/snippets/src/SlidesCreateTextboxWithText.php)

```php
<?php
use Google\Client;
use Google\Service\Slides\BatchUpdatePresentationRequest;
use Google\Service\Slides;
use Google\Service\DriveFile;
use Google\Service\Slides\Request;

function createTextboxWithText($presentationId, $pageId)
{

    /* Load pre-authorized user credentials from the environment.
       TODO(developer) - See https://developers.google.com/identity for
        guides on implementing OAuth2 for your application. */
    $client = new Google\Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(Google\Service\Drive::DRIVE);
    $slidesService = new Google_Service_Slides($client);
    try {

        // Create a new square textbox, using the supplied element ID.
        $elementId = "MyTextBoxxxx_01";
        $pt350 = array('magnitude' => 350, 'unit' => 'PT');
        $requests = array();
        $requests[] = new Google_Service_Slides_Request(array(
            'createShape' => array(
                'objectId' => $elementId,
                'shapeType' => 'TEXT_BOX',
                'elementProperties' => array(
                    'pageObjectId' => $pageId,
                    'size' => array(
                        'height' => $pt350,
                        'width' => $pt350
                    ),
                    'transform' => array(
                        'scaleX' => 1,
                        'scaleY' => 1,
                        'translateX' => 350,
                        'translateY' => 100,
                        'unit' => 'PT'
                    )
                )
            )
        ));

        // Insert text into the box, using the supplied element ID.
        $requests[] = new Google_Service_Slides_Request(array(
            'insertText' => array(
                'objectId' => $elementId,
                'insertionIndex' => 0,
                'text' => 'New Box Text Inserted!'
            )
        ));

        // Execute the requests.
        $batchUpdateRequest = new Google_Service_Slides_BatchUpdatePresentationRequest(array(
            'requests' => $requests
        ));
        $response = $slidesService->presentations->batchUpdate($presentationId, $batchUpdateRequest);
        $createShapeResponse = $response->getReplies()[0]->getCreateShape();
        printf("Created textbox with ID: %s\n", $createShapeResponse->getObjectId());
        return $response;
    } catch (Exception $e) {
        echo 'Message: ' . $e->getMessage();
    }
}
```

### Python

slides/snippets/slides_create_textbox_with_text.py [View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/slides/snippets/slides_create_textbox_with_text.py)

```python
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def create_textbox_with_text(presentation_id, page_id):
  """
  Creates the textbox with text, the user has access to.
  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """
  creds, _ = google.auth.default()
  # pylint: disable=maybe-no-member
  try:
    service = build("slides", "v1", credentials=creds)
    # Create a new square textbox, using the supplied element ID.
    element_id = "MyTextBox_10"
    pt350 = {"magnitude": 350, "unit": "PT"}
    requests = [
        {
            "createShape": {
                "objectId": element_id,
                "shapeType": "TEXT_BOX",
                "elementProperties": {
                    "pageObjectId": page_id,
                    "size": {"height": pt350, "width": pt350},
                    "transform": {
                        "scaleX": 1,
                        "scaleY": 1,
                        "translateX": 350,
                        "translateY": 100,
                        "unit": "PT",
                    },
                },
            }
        },
        # Insert text into the box, using the supplied element ID.
        {
            "insertText": {
                "objectId": element_id,
                "insertionIndex": 0,
                "text": "New Box Text Inserted!",
            }
        },
    ]

    # Execute the request.
    body = {"requests": requests}
    response = (
        service.presentations()
        .batchUpdate(presentationId=presentation_id, body=body)
        .execute()
    )
    create_shape_response = response.get("replies")[0].get("createShape")
    print(f"Created textbox with ID:{(create_shape_response.get('objectId'))}")
  except HttpError as error:
    print(f"An error occurred: {error}")

    return error

  return response


if __name__ == "__main__":
  # Put the presentation_id, Page_id of slides whose list needs
  # to be submitted.
  create_textbox_with_text(
      "12SQU9Ik-ShXecJoMtT-LlNwEPiFR7AadnxV2KiBXCnE", "Myfirstpage"
  )
```

### Ruby

slides/snippets/lib/file_snippets.rb [View on GitHub](https://github.com/googleworkspace/ruby-samples/blob/main/slides/snippets/lib/file_snippets.rb)

```ruby
# Create a new square textbox, using the supplied element ID.
element_id = 'MyTextBox_01'
pt350 = {
  magnitude: '350',
  unit:      'PT'
}
requests = [
  {
    create_shape: {
      object_id_prop:     element_id,
      shape_type:         'TEXT_BOX',
      element_properties: {
        page_object_id: page_id,
        size:           {
          height: pt350,
          width:  pt350
        },
        transform:      {
          scale_x:     '1',
          scale_y:     '1',
          translate_x: '350',
          translate_y: '100',
          unit:        'PT'
        }
      }
    }
  },
  # Insert text into the box, using the supplied element ID.
  {
    insert_text: {
      object_id_prop:  element_id,
      insertion_index: 0,
      text:            'New Box Text Inserted!'
    }
  }
]

# Execute the request.
req = Google::Apis::SlidesV1::BatchUpdatePresentationRequest.new(requests: requests)
response = slides_service.batch_update_presentation(
  presentation_id,
  req
)
create_shape_response = response.replies[0].create_shape
puts "Created textbox with ID: #{create_shape_response.object_id}"
```

For more information about controlling the size and position of shapes, see
[Size and position page elements](https://developers.google.com/workspace/slides/how-tos/transform).