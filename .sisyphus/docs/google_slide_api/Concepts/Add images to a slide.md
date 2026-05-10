# Add images to a slide

This page describes how to add images to an existing Google Slides
presentation. When adding an image, you provide the Google Slides API with a
publicly accessible URL to the image.

## About images

Images in the Slides API are a type of page element. As with any page
element, you specify the visual size and position of the image using the `size`
and `transform` properties of the
[`PageElement`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations.pages#Page.PageElement).
For more details on how to correctly size and position your image, see [Size \&
position shapes](https://developers.google.com/workspace/slides/how-tos/transform).

To add an image, use the
[`CreateImageRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#createimagerequest)
method. Images must be less than 50 MB in size, cannot exceed 25 megapixels, and
must be in one of PNG, JPEG, or GIF formats.

## Example

This example uses the Slides API to add an image to a presentation.

### Apps Script

slides/api/Snippets.gs [View on GitHub](https://github.com/googleworkspace/apps-script-samples/blob/main/slides/api/Snippets.gs)

```javascript
/**
 * Create a new image, using the supplied object ID, with content downloaded from imageUrl.
 * @param {string} presentationId
 * @param {string} pageId
 * @returns {*}
 */
function createImage(presentationId, pageId) {
  const requests = [];
  const imageId = "MyImage_01";
  const imageUrl =
    "https://www.google.com/images/branding/googlelogo/2x/" +
    "googlelogo_color_272x92dp.png";
  const emu4M = {
    magnitude: 4000000,
    unit: "EMU",
  };
  requests.push({
    createImage: {
      objectId: imageId,
      url: imageUrl,
      elementProperties: {
        pageObjectId: pageId,
        size: {
          height: emu4M,
          width: emu4M,
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 100000,
          translateY: 100000,
          unit: "EMU",
        },
      },
    },
  });

  // Execute the request.
  try {
    const response = Slides.Presentations.batchUpdate(
      {
        requests: requests,
      },
      presentationId,
    );

    const createImageResponse = response.replies;
    console.log(
      "Created image with ID: %s",
      createImageResponse[0].createImage.objectId,
    );

    return createImageResponse;
  } catch (err) {
    // TODO (Developer) - Handle exception
    console.log("Failed with error: %s", err.error);
  }
}
```

### Go

slides/snippets/presentations.go [View on GitHub](https://github.com/googleworkspace/go-samples/blob/main/slides/snippets/presentations.go)

```go
// Create a new image, using the supplied object ID, with content downloaded from imageURL.
imageId := "MyImageId_01"
emu4M := slides.Dimension{Magnitude: 4000000, Unit: "EMU"}
requests := []*slides.Request{{
	CreateImage: &slides.CreateImageRequest{
		ObjectId: imageId,
		Url:      imageURL,
		ElementProperties: &slides.PageElementProperties{
			PageObjectId: slideId,
			Size: &slides.Size{
				Height: &emu4M,
				Width:  &emu4M,
			},
			Transform: &slides.AffineTransform{
				ScaleX:     1.0,
				ScaleY:     1.0,
				TranslateX: 100000.0,
				TranslateY: 100000.0,
				Unit:       "EMU",
			},
		},
	},
}}

// Execute the request.
body := &slides.BatchUpdatePresentationRequest{
	Requests: requests,
}
response, err := slidesService.Presentations.BatchUpdate(presentationId, body).Do()
if err != nil {
	log.Fatalf("Unable to create image. %v", err)
} else {
	fmt.Printf("Created image with ID: %s", response.Replies[0].CreateImage.ObjectId)
}
```

### Java

slides/snippets/src/main/java/CreateImage.java [View on GitHub](https://github.com/googleworkspace/java-samples/blob/main/slides/snippets/src/main/java/CreateImage.java)

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
import com.google.api.services.slides.v1.model.CreateImageRequest;
import com.google.api.services.slides.v1.model.CreateImageResponse;
import com.google.api.services.slides.v1.model.Dimension;
import com.google.api.services.slides.v1.model.PageElementProperties;
import com.google.api.services.slides.v1.model.Request;
import com.google.api.services.slides.v1.model.Size;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/* Class to demonstrate the use of Slides Create Image API */
public class CreateImage {
  /**
   * Create a new image, using the supplied object ID, with content
   * downloaded from imageUrl.
   *
   * @param presentationId - id of the presentation.
   * @param slideId        - id of the shape.
   * @param imageUrl       - Url of the image.
   * @return image id
   * @throws IOException - if credentials file not found.
   */
  public static BatchUpdatePresentationResponse createImage(String presentationId,
                                                            String slideId,
                                                            String imageUrl)
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

    // Create a new image, using the supplied object ID, with content downloaded from imageUrl.
    List<Request> requests = new ArrayList<>();
    String imageId = "MyImageId_01";
    Dimension emu4M = new Dimension().setMagnitude(4000000.0).setUnit("EMU");
    requests.add(new Request()
        .setCreateImage(new CreateImageRequest()
            .setObjectId(imageId)
            .setUrl(imageUrl)
            .setElementProperties(new PageElementProperties()
                .setPageObjectId(slideId)
                .setSize(new Size()
                    .setHeight(emu4M)
                    .setWidth(emu4M))
                .setTransform(new AffineTransform()
                    .setScaleX(1.0)
                    .setScaleY(1.0)
                    .setTranslateX(100000.0)
                    .setTranslateY(100000.0)
                    .setUnit("EMU")))));

    BatchUpdatePresentationResponse response = null;
    try {
      // Execute the request.
      BatchUpdatePresentationRequest body =
          new BatchUpdatePresentationRequest().setRequests(requests);
      response = service.presentations().batchUpdate(presentationId, body).execute();
      CreateImageResponse createImageResponse = response.getReplies().get(0).getCreateImage();
      // Prints the created image id.
      System.out.println("Created image with ID: " + createImageResponse.getObjectId());
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

slides/snippets/slides_create_image.js [View on GitHub](https://github.com/googleworkspace/browser-samples/blob/main/slides/snippets/slides_create_image.js)

```javascript
function createImage(presentationId, pageId, IMAGE_URL, callback) {
  const imageUrl = IMAGE_URL;
  // Create a new image, using the supplied object ID, with content downloaded from imageUrl.
  const requests = [];
  const imageId = 'MyImage_02';
  const emu4M = {
    magnitude: 4000000,
    unit: 'EMU',
  };
  requests.push({
    createImage: {
      objectId: imageId,
      url: imageUrl,
      elementProperties: {
        pageObjectId: pageId,
        size: {
          height: emu4M,
          width: emu4M,
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 100000,
          translateY: 100000,
          unit: 'EMU',
        },
      },
    },
  });
  // Execute the request.
  try {
    gapi.client.slides.presentations.batchUpdate({
      presentationId: presentationId,
      requests: requests,
    }).then((response) => {
      const createImageResponse = response.result.replies;
      console.log(`Created image with ID: ${createImageResponse[0].createImage.objectId}`);
      if (callback) callback(createImageResponse);
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
}
```

### Node.js

slides/snippets/slides_create_image.js [View on GitHub](https://github.com/googleworkspace/node-samples/blob/main/slides/snippets/slides_create_image.js)

```javascript
import {GoogleAuth} from 'google-auth-library';
import {google} from 'googleapis';

/**
 * Adds an image to a slide in a presentation.
 * @param {string} presentationId The ID of the presentation.
 * @param {string} pageId The ID of the page to add the image to.
 * @return {Promise<object>} The response from the batch update.
 */
async function createImage(presentationId, pageId) {
  // Authenticate with Google and get an authorized client.
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/presentations',
  });

  // Create a new Slides API client.
  const service = google.slides({version: 'v1', auth});

  // The URL of the image to add.
  const imageUrl =
    'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';

  // The ID to use for the new image.
  const imageId = 'MyImage_01';

  // The size of the new image in English Metric Units (EMUs).
  const emu4M = {
    magnitude: 4000000,
    unit: 'EMU',
  };

  // The request to create a new image.
  const requests = [
    {
      createImage: {
        objectId: imageId,
        url: imageUrl,
        elementProperties: {
          pageObjectId: pageId,
          size: {
            height: emu4M,
            width: emu4M,
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 100000,
            translateY: 100000,
            unit: 'EMU',
          },
        },
      },
    },
  ];

  // Execute the batch update request to create the image.
  const response = await service.presentations.batchUpdate({
    presentationId,
    requestBody: {requests},
  });
  const createImageResponse = response.data.replies;
  console.log(
    `Created image with ID: ${createImageResponse[0].createImage.objectId}`,
  );
  return createImageResponse;
}
```

### PHP

slides/snippets/src/SlidesCreateImage.php [View on GitHub](https://github.com/googleworkspace/php-samples/blob/main/slides/snippets/src/SlidesCreateImage.php)

```php
<?php
use Google\Client;
use Google\Service\Drive;
use Google\Service\Slides;
use Google\Service\Slides\Request;


function createImage($presentationId, $pageId)
{
    /* Load pre-authorized user credentials from the environment.
    TODO(developer) - See https://developers.google.com/identity for
        guides on implementing OAuth2 for your application. */
    $client = new Google\Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(Google\Service\Drive::DRIVE);
    $slidesService = new Google_Service_Slides($client);

    try {

        $imageUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
        // Create a new image, using the supplied object ID, with content downloaded from imageUrl.
        $imageId = 'MyImage_01asdfsadfasdf';
        $emu4M = array('magnitude' => 4000000, 'unit' => 'EMU');
        $requests[] = new Google_Service_Slides_Request(array(
            'createImage' => array(
                'objectId' => $imageId,
                'url' => $imageUrl,
                'elementProperties' => array(
                    'pageObjectId' => $pageId,
                    'size' => array(
                        'height' => $emu4M,
                        'width' => $emu4M
                    ),
                    'transform' => array(
                        'scaleX' => 1,
                        'scaleY' => 1,
                        'translateX' => 100000,
                        'translateY' => 100000,
                        'unit' => 'EMU'
                    )
                )
            )
        ));

        // Execute the request.
        $batchUpdateRequest = new Google_Service_Slides_BatchUpdatePresentationRequest(array(
            'requests' => $requests
        ));
        $response = $slidesService->presentations->batchUpdate($presentationId, $batchUpdateRequest);
        $createImageResponse = $response->getReplies()[0]->getCreateImage();
        printf("Created image with ID: %s\n", $createImageResponse->getObjectId());

        return $response;
    } catch (Exception $e) {
        echo 'Message: ' . $e->getMessage();
    }
}
```

### Python

slides/snippets/slides_create_image.py [View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/slides/snippets/slides_create_image.py)

```python
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def create_image(presentation_id, page_id):
  """
  Creates images the user has access to.
  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """

  creds, _ = google.auth.default()
  # pylint: disable=maybe-no-member
  try:
    service = build("slides", "v1", credentials=creds)
    # pylint: disable = invalid-name
    IMAGE_URL = (
        "https://www.google.com/images/branding/"
        "googlelogo/2x/googlelogo_color_272x92dp.png"
    )
    # pylint: disable=invalid-name
    requests = []
    image_id = "MyImage_11"
    emu4M = {"magnitude": 4000000, "unit": "EMU"}
    requests.append(
        {
            "createImage": {
                "objectId": image_id,
                "url": IMAGE_URL,
                "elementProperties": {
                    "pageObjectId": page_id,
                    "size": {"height": emu4M, "width": emu4M},
                    "transform": {
                        "scaleX": 1,
                        "scaleY": 1,
                        "translateX": 100000,
                        "translateY": 100000,
                        "unit": "EMU",
                    },
                },
            }
        }
    )

    # Execute the request.
    body = {"requests": requests}
    response = (
        service.presentations()
        .batchUpdate(presentationId=presentation_id, body=body)
        .execute()
    )
    create_image_response = response.get("replies")[0].get("createImage")
    print(f"Created image with ID: {(create_image_response.get('objectId'))}")

    return response
  except HttpError as error:
    print(f"An error occurred: {error}")
    print("Images not created")
    return error


if __name__ == "__main__":
  # Put the presentation_id, Page_id of slides whose list needs
  # to be submitted.
  create_image("12SQU9Ik-ShXecJoMtT-LlNwEPiFR7AadnxV2KiBXCnE", "My2ndpage")
```

### Ruby

slides/snippets/lib/file_snippets.rb [View on GitHub](https://github.com/googleworkspace/ruby-samples/blob/main/slides/snippets/lib/file_snippets.rb)

```ruby
# Create a new image, using the supplied object ID, with content downloaded from image_url.
requests = []
image_id = 'MyImage_01'
emu4M = {
  magnitude: '4000000',
  unit:      'EMU'
}
requests << {
  create_image: {
    object_id_prop:     image_id,
    url:                IMAGE_URL,
    element_properties: {
      page_object_id: page_id,
      size:           {
        height: emu4M,
        width:  emu4M
      },
      transform:      {
        scale_x:     '1',
        scale_y:     '1',
        translate_x: '100000',
        translate_y: '100000',
        unit:        'EMU'
      }
    }
  }
}

# Execute the request.
req = Google::Apis::SlidesV1::BatchUpdatePresentationRequest.new(requests: requests)
response = slides_service.batch_update_presentation(
  presentation_id,
  req
)
create_image_response = response.replies[0].create_image
puts "Created image with ID: #{create_image_response.object_id}"
```

> [!NOTE]
> If you want to add private or local images to a slide, you first must make them available on a publicly accessible URL. One option is to upload your images to [Google
> Cloud Storage](https://cloud.google.com/storage/) and use [signed URLs](https://cloud.google.com/storage/docs/access-control/signing-urls-with-helpers#storage-signed-url-get-object-nodejs) with a 15 minute TTL. Uploaded images are automatically deleted after 15 minutes.