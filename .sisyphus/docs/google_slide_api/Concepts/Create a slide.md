# Create a Slide

This page describes how to add slides to an existing Google Slides
presentation.

## Slides

Each individual page of a Slides presentation is a *slide*.

To add a slide to the presentation, you need the presentation ID. You can find
the presentation's ID by opening the presentation in Slides and
looking at its URL:

```
https://docs.google.com/presentation/d/presentationID/edit
```

To add a slide, use the
[`batchUpdate()`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate) method
with the presentation ID and include a
[`CreateSlideRequest`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#createsliderequest)
in the request body. The ID of the new slide is returned in the response body.

## Example

The following example shows how to add a slide to a presentation. All the fields
for
[`CreateSlideRequest`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#createsliderequest)
are optional. This example creates the slide as the second slide, with
`TITLE_AND_TWO_COLUMNS` layout, and an explicit object ID.

> [!WARNING]
> Be careful when explicitly setting object IDs. These must be unique across all objects in the presentation. Use a UUID rather than a plain string as shown in the example, or omit the parameter and let the Slides API generate the ID.

### Apps Script

slides/api/Snippets.gs [View on GitHub](https://github.com/googleworkspace/apps-script-samples/blob/main/slides/api/Snippets.gs)

```javascript
/**
 * Creates a slide
 * @param {string} presentationId
 * @param {string} pageId
 * @returns {*}
 */
function createSlide(presentationId, pageId) {
  // See Presentation.insertSlide(...) to learn how to add a slide using SlidesApp.
  // http://developers.google.com/apps-script/reference/slides/presentation#appendslidelayout
  const requests = [
    {
      createSlide: {
        objectId: pageId,
        insertionIndex: "1",
        slideLayoutReference: {
          predefinedLayout: "TITLE_AND_TWO_COLUMNS",
        },
      },
    },
  ];

  // If you wish to populate the slide with elements, add element create requests here,
  // using the pageId.

  // Execute the request.
  try {
    const createSlideResponse = Slides.Presentations.batchUpdate(
      {
        requests: requests,
      },
      presentationId,
    );
    console.log(
      "Created slide with ID: %s",
      createSlideResponse.replies[0].createSlide.objectId,
    );
    return createSlideResponse;
  } catch (err) {
    // TODO (Developer) - Handle exception
    console.log("Failed with error: %s", err.error);
  }
}
```

### Go

slides/snippets/presentations.go [View on GitHub](https://github.com/googleworkspace/go-samples/blob/main/slides/snippets/presentations.go)

```go
// Add a slide at index 1 using the predefined "TITLE_AND_TWO_COLUMNS" layout
// and the ID "MyNewSlide_001".
slideId := "MyNewSlide_001"
requests := []*slides.Request{{
	CreateSlide: &slides.CreateSlideRequest{
		ObjectId:       slideId,
		InsertionIndex: 1,
		SlideLayoutReference: &slides.LayoutReference{
			PredefinedLayout: "TITLE_AND_TWO_COLUMNS",
		},
	},
}}

// If you wish to populate the slide with elements, add create requests here,
// using the slide ID specified above.

// Execute the request.
body := &slides.BatchUpdatePresentationRequest{
	Requests: requests,
}
response, err := slidesService.Presentations.BatchUpdate(presentationId, body).Do()
if err != nil {
	log.Fatalf("Unable to create slide. %v", err)
}
fmt.Printf("Created slide with ID: %s", response.Replies[0].CreateSlide.ObjectId)
```

### Java

slides/snippets/src/main/java/CreateSlide.java [View on GitHub](https://github.com/googleworkspace/java-samples/blob/main/slides/snippets/src/main/java/CreateSlide.java)

```java
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.slides.v1.Slides;
import com.google.api.services.slides.v1.SlidesScopes;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationRequest;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationResponse;
import com.google.api.services.slides.v1.model.CreateSlideRequest;
import com.google.api.services.slides.v1.model.CreateSlideResponse;
import com.google.api.services.slides.v1.model.LayoutReference;
import com.google.api.services.slides.v1.model.Request;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/* Class to demonstrate the use of Create Slides API */
public class CreateSlide {
  /**
   * Creates a new slide.
   *
   * @param presentationId - id of the presentation.
   * @return slide id
   * @throws IOException - if credentials file not found.
   */
  public static BatchUpdatePresentationResponse createSlide(String presentationId)
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

    // Add a slide at index 1 using the predefined "TITLE_AND_TWO_COLUMNS" layout
    List<Request> requests = new ArrayList<>();
    String slideId = "MyNewSlide_001";
    BatchUpdatePresentationResponse response = null;
    try {
      requests.add(new Request()
          .setCreateSlide(new CreateSlideRequest()
              .setObjectId(slideId)
              .setInsertionIndex(1)
              .setSlideLayoutReference(new LayoutReference()
                  .setPredefinedLayout("TITLE_AND_TWO_COLUMNS"))));

      // If you wish to populate the slide with elements, add create requests here,
      // using the slide ID specified above.

      // Execute the request.
      BatchUpdatePresentationRequest body =
          new BatchUpdatePresentationRequest().setRequests(requests);
      response = service.presentations().batchUpdate(presentationId, body).execute();
      CreateSlideResponse createSlideResponse = response.getReplies().get(0).getCreateSlide();
      // Prints the slide id.
      System.out.println("Created slide with ID: " + createSlideResponse.getObjectId());
    } catch (GoogleJsonResponseException e) {
      // TODO(developer) - handle error appropriately
      GoogleJsonError error = e.getDetails();
      if (error.getCode() == 400) {
        System.out.printf(" Id '%s' should be unique among all pages and page elements.\n",
            presentationId);
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

slides/snippets/slides_create_slide.js [View on GitHub](https://github.com/googleworkspace/browser-samples/blob/main/slides/snippets/slides_create_slide.js)

```javascript
function createSlide(presentationId, pageId, callback) {
  const requests = [
    {
      createSlide: {
        objectId: pageId,
        insertionIndex: '1',
        slideLayoutReference: {
          predefinedLayout: 'TITLE_AND_TWO_COLUMNS',
        },
      },
    },
  ];
  // If you wish to populate the slide with elements, add element create requests here,
  // using the pageId.
  // Execute the request.
  try {
    gapi.client.slides.presentations
        .batchUpdate({
          presentationId: presentationId,
          requests: requests,
        })
        .then((createSlideResponse) => {
          const objectId =
          createSlideResponse.result.replies[0].createSlide.objectId;
          console.log(`Created slide with ID: ${objectId}`);
          if (callback) callback(createSlideResponse);
        });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
}
```

### Node.js

slides/snippets/slides_create_slide.js [View on GitHub](https://github.com/googleworkspace/node-samples/blob/main/slides/snippets/slides_create_slide.js)

```javascript
import {GoogleAuth} from 'google-auth-library';
import {google} from 'googleapis';

/**
 * Creates a new slide in a presentation.
 * @param {string} presentationId The ID of the presentation.
 * @param {string} pageId The object ID for the new slide.
 * @return {Promise<object>} The response from the batch update.
 */
async function createSlide(presentationId, pageId) {
  // Authenticate with Google and get an authorized client.
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/presentations',
  });

  // Create a new Slides API client.
  const service = google.slides({version: 'v1', auth});

  // The request to create a new slide.
  const requests = [
    {
      createSlide: {
        objectId: pageId,
        insertionIndex: '1',
        slideLayoutReference: {
          predefinedLayout: 'TITLE_AND_TWO_COLUMNS',
        },
      },
    },
  ];

  // Execute the batch update request to create the slide.
  const result = await service.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests,
    },
  });
  console.log(
    `Created slide with ID: ${result.data.replies[0].createSlide.objectId}`,
  );
  return result;
}
```

### PHP

slides/snippets/src/SlidesCreateSlide.php [View on GitHub](https://github.com/googleworkspace/php-samples/blob/main/slides/snippets/src/SlidesCreateSlide.php)

```php
<?php
use Google\Client;
use Google\Service\Drive;
use Google\Service\Slides\Request;
use Google\Service\Slides\BatchUpdatePresentationRequest;

function createSlide($presentationId, $pageId)
{
    /* Load pre-authorized user credentials from the environment.
   TODO(developer) - See https://developers.google.com/identity for
    guides on implementing OAuth2 for your application. */
    $client = new Google\Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(Google\Service\Drive::DRIVE);
    $slidesService = new Google_Service_Slides($client);
    try {
        $requests = array();
        $requests[] = new Google_Service_Slides_Request(array(
            'createSlide' => array(
                'objectId' => $pageId,
                'insertionIndex' => 1,
                'slideLayoutReference' => array(
                    'predefinedLayout' => 'TITLE_AND_TWO_COLUMNS'
                )
            )
        ));
        $batchUpdateRequest = new Google_Service_Slides_BatchUpdatePresentationRequest(array(
            'requests' => $requests
        ));

        //execute the request 
        $response = $slidesService->presentations->batchUpdate($presentationId, $batchUpdateRequest);
        $createSlideResponse = $response->getReplies()[0]->getCreateSlide();
        printf("Created slide with ID: %s\n", $createSlideResponse->getObjectId());
        return $response;
    } catch (Exception $e) {
        echo 'Message: ' . $e->getMessage();
    }
}
```

### Python

slides/snippets/slides_create_slide.py [View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/slides/snippets/slides_create_slide.py)

```python
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def create_slide(presentation_id, page_id):
  """
  Creates the Presentation the user has access to.
  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.\n
  """
  creds, _ = google.auth.default()
  # pylint: disable=maybe-no-member
  try:
    service = build("slides", "v1", credentials=creds)
    # Add a slide at index 1 using the predefined
    # 'TITLE_AND_TWO_COLUMNS' layout and the ID page_id.
    requests = [
        {
            "createSlide": {
                "objectId": page_id,
                "insertionIndex": "1",
                "slideLayoutReference": {
                    "predefinedLayout": "TITLE_AND_TWO_COLUMNS"
                },
            }
        }
    ]

    # If you wish to populate the slide with elements,
    # add element create requests here, using the page_id.

    # Execute the request.
    body = {"requests": requests}
    response = (
        service.presentations()
        .batchUpdate(presentationId=presentation_id, body=body)
        .execute()
    )
    create_slide_response = response.get("replies")[0].get("createSlide")
    print(f"Created slide with ID:{(create_slide_response.get('objectId'))}")
  except HttpError as error:
    print(f"An error occurred: {error}")
    print("Slides not created")
    return error

  return response


if __name__ == "__main__":
  # Put the presentation_id, Page_id of slides whose list needs
  # to be submitted.
  create_slide("12SQU9Ik-ShXecJoMtT-LlNwEPiFR7AadnxV2KiBXCnE", "My4ndpage")
```

### Ruby

slides/snippets/lib/file_snippets.rb [View on GitHub](https://github.com/googleworkspace/ruby-samples/blob/main/slides/snippets/lib/file_snippets.rb)

```ruby
body = Google::Apis::SlidesV1::Presentation.new
requests = [{
  create_slide: {
    object_id_prop:         page_id,
    insertion_index:        '1',
    slide_layout_reference: {
      predefined_layout: 'TITLE_AND_TWO_COLUMNS'
    }
  }
}]

# If you wish to populate the slide with elements, add element create requests here,
# using the page_id.

# Execute the request.
req = Google::Apis::SlidesV1::BatchUpdatePresentationRequest.new(requests: requests)
response = slides_service.batch_update_presentation(presentation_id, req)
create_slide_response = response.replies[0].create_slide
puts "Created slide with ID: #{create_slide_response.object_id}"
```

After you create the slide, you can add text and shapes to it.

## Fill in placeholders

Layouts normally have placeholder shapes that are copied to the slide when it's
created. `CreateSlideRequest` lets you specify the object IDs used for these
copied placeholders through the `placeholderIdMappings` field. This lets you
modify the copied placeholders in the same `batchUpdate` request, which improves
performance and saves quota. For more information, see the
[`CreateSlideRequest` sample](https://developers.google.com/workspace/slides/api/samples/slides#create_a_new_slide_and_modify_placeholders).