# Create and manage presentations

This page describes how to perform certain high-level tasks involving
presentations, such as:

- Create a presentation
- Copy an existing presentation

The following paragraphs describe these tasks in detail.

## Create a blank presentation

To create a presentation, use the
[create](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/create) method on the
[presentations](https://developers.google.com/workspace/slides/reference/rest/v1/presentations) collection,
as shown in the following example.

This example creates a blank presentation with a specified title.

### Apps Script

slides/api/Snippets.gs [View on GitHub](https://github.com/googleworkspace/apps-script-samples/blob/main/slides/api/Snippets.gs)

```javascript
/**
 * Creates a presentation
 * @returns {*} the created presentation
 */
function createPresentation() {
  try {
    const presentation = Slides.Presentations.create({
      title: title,
    });
    console.log(
      "Created presentation with ID: %s",
      presentation.presentationId,
    );

    return presentation;
  } catch (err) {
    // TODO (Developer) - Handle exception
    console.log("Failed with error: %s", err.error);
  }
}
```

### Go

slides/snippets/presentations.go [View on GitHub](https://github.com/googleworkspace/go-samples/blob/main/slides/snippets/presentations.go)

```go
// Create a presentation and request a PresentationId.
p := &slides.Presentation{
	Title: "Title",
}
presentation, err := slidesService.Presentations.Create(p).Fields(
	"presentationId",
).Do()
if err != nil {
	log.Fatalf("Unable to create presentation. %v", err)
}
fmt.Printf("Created presentation with ID: %s", presentation.PresentationId)
```

### Java

slides/snippets/src/main/java/CreatePresentation.java [View on GitHub](https://github.com/googleworkspace/java-samples/blob/main/slides/snippets/src/main/java/CreatePresentation.java)

```java
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.slides.v1.Slides;
import com.google.api.services.slides.v1.SlidesScopes;
import com.google.api.services.slides.v1.model.Presentation;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;

import java.io.IOException;
import java.util.Collections;

/* Class to demonstrate the use of Slides Create Presentation API */
public class CreatePresentation {
  /**
   * Creates a new presentation.
   *
   * @param title - the name of the presentation to be created
   * @return presentation id
   * @throws IOException - if credentials file not found.
   */
  public static String createPresentation(String title) throws IOException {
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

    // Creates a blank presentation with a specified title.
    Presentation presentation = new Presentation()
        .setTitle(title);
    presentation = service.presentations().create(presentation)
        .setFields("presentationId")
        .execute();
    // Prints the newly created presentation id.
    System.out.println("Created presentation with ID: " + presentation.getPresentationId());
    return presentation.getPresentationId();
  }
}
```

### JavaScript

slides/snippets/slides_create_presentation.js [View on GitHub](https://github.com/googleworkspace/browser-samples/blob/main/slides/snippets/slides_create_presentation.js)

```javascript
function createPresentation(title, callback) {
  try {
    gapi.client.slides.presentations.create({
      title: title,
    }).then((response) => {
      console.log(`Created presentation with ID: ${response.result.presentationId}`);
      if (callback) callback(response);
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
}
```

### Node.js

slides/snippets/slides_create_presentation.js [View on GitHub](https://github.com/googleworkspace/node-samples/blob/main/slides/snippets/slides_create_presentation.js)

```javascript
import {GoogleAuth} from 'google-auth-library';
import {google} from 'googleapis';

/**
 * Creates a new Google Slides presentation.
 * @param {string} title The title for the new presentation.
 * @return {Promise<object>} The created presentation.
 */
async function createPresentation(title) {
  // Authenticate with Google and get an authorized client.
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/presentations',
  });

  // Create a new Slides API client.
  const service = google.slides({version: 'v1', auth});

  // Create a new presentation with the specified title.
  const presentation = await service.presentations.create({
    title,
  });

  // Log the ID of the new presentation.
  console.log(
    `Created presentation with ID: ${presentation.data.presentationId}`,
  );
  return presentation;
}
```

### PHP

slides/snippets/src/SlidesCreatePresentation.php [View on GitHub](https://github.com/googleworkspace/php-samples/blob/main/slides/snippets/src/SlidesCreatePresentation.php)

```php
<?php
use Google\Client;
use Google\Service\Drive;
use Google\Service\Slides;
use Google\Service\Slides\Request;

function createPresentation($title)
{
    /* Load pre-authorized user credentials from the environment.
       TODO(developer) - See https://developers.google.com/identity for
        guides on implementing OAuth2 for your application. */
    $client = new Google\Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(Google\Service\Drive::DRIVE);
    $service = new Google_Service_Slides($client);
    try {
        $presentation = new Google_Service_Slides_Presentation($title);
        //creating a presentation
        $presentation = $service->presentations->create($presentation);
        printf("Created presentation with ID: %s\n", $presentation->presentationId);
        return $presentation;
    } catch (Exception $e) {
        echo 'Message: ' . $e->getMessage();
    }
}
```

### Python

slides/snippets/slides_create_presentation.py [View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/slides/snippets/slides_create_presentation.py)

```python
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def create_presentation(title):
  """
  Creates the Presentation the user has access to.
  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """
  creds, _ = google.auth.default()
  # pylint: disable=maybe-no-member
  try:
    service = build("slides", "v1", credentials=creds)

    body = {"title": title}
    presentation = service.presentations().create(body=body).execute()
    print(
        f"Created presentation with ID:{(presentation.get('presentationId'))}"
    )
    return presentation

  except HttpError as error:
    print(f"An error occurred: {error}")
    print("presentation not created")
    return error


if __name__ == "__main__":
  # Put the title of the presentation

  create_presentation("finalp")
```

### Ruby

slides/snippets/lib/file_snippets.rb [View on GitHub](https://github.com/googleworkspace/ruby-samples/blob/main/slides/snippets/lib/file_snippets.rb)

```ruby
body = Google::Apis::SlidesV1::Presentation.new
body.title = title
presentation = slides_service.create_presentation(body)
puts "Created presentation with ID: #{presentation.presentation_id}"
```

### Work with Google Drive folders

There's no option to create a presentation directly within a specified
Drive folder using the Google Slides API. By default, the created
presentation is saved to the user's root folder on Drive.

However, there are 2 alternatives to saving a file to a Drive
folder:

- After the presentation is created, move it to a specific folder using the [files.update](https://developers.google.com/drive/api/v3/reference/files/update) method of the Drive API. For more information on moving files, refer to [Move files between folders](https://developers.google.com/drive/api/guides/folder#move_files_between_folders).
- Add a blank presentation to a folder using the [files.create](https://developers.google.com/drive/v3/reference/files/create) method of the Drive API, specifying `application/vnd.google-apps.presentation` as the `mimeType`. For more information on creating files, refer to [Create a file in a folder](https://developers.google.com/drive/api/guides/folder#create_a_file_in_a_folder).

For either alternative, you'll need to add the appropriate [Drive API scopes](https://developers.google.com/drive/api/v3/reference/files/create#auth) to authorize the call.

To move or create a file within a shared drive folder, refer to [Implement shared drive support](https://developers.google.com/drive/api/guides/enable-shareddrives).

## Copy an existing presentation

To copy a presentation, use Drive API's
[files().copy](https://developers.google.com/workspace/drive/v3/reference/files/copy) method.

The following example copies an existing presentation, using a provided
string for both the presentation title and the name of the new Drive file.

### Apps Script

slides/api/Snippets.gs [View on GitHub](https://github.com/googleworkspace/apps-script-samples/blob/main/slides/api/Snippets.gs)

```javascript
/**
 * create a presentation and copy it
 * @param {string} presentationId - ID of presentation to copy
 * @returns {*} the copy's presentation id
 */
function copyPresentation(presentationId) {
  const copyTitle = "Copy Title";

  let copyFile = {
    title: copyTitle,
    parents: [{ id: "root" }],
  };
  try {
    copyFile = Drive.Files.copy(copyFile, presentationId);
    // (optional) copyFile.id can be returned directly
    const presentationCopyId = copyFile.id;

    return presentationCopyId;
  } catch (err) {
    // TODO (Developer) - Handle exception
    console.log("Failed with error: %s", err.error);
  }
}
```

### Go

slides/snippets/presentations.go [View on GitHub](https://github.com/googleworkspace/go-samples/blob/main/slides/snippets/presentations.go)

```go
// Copy a presentation.
file := drive.File{
	Title: title,
}
presentationCopyFile, err := driveService.Files.Copy(id, &file).Do()
if err != nil {
	log.Fatalf("Unable to copy presentation. %v", err)
}
presentationCopyId := presentationCopyFile.Id
```

### Java

slides/snippets/src/main/java/CopyPresentation.java [View on GitHub](https://github.com/googleworkspace/java-samples/blob/main/slides/snippets/src/main/java/CopyPresentation.java)

```java
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.slides.v1.SlidesScopes;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;

import java.io.IOException;
import java.util.Collections;

/* Class to demonstrate the use of Slides Copy Presentation API */
public class CopyPresentation {
  /**
   * Copy an existing presentation.
   *
   * @param presentationId - id of the presentation.
   * @param copyTitle      - New title of the presentation.
   * @return presentation id
   * @throws IOException - if credentials file not found.
   */
  public static String copyPresentation(String presentationId, String copyTitle)
      throws IOException {
        /* Load pre-authorized user credentials from the environment.
           TODO(developer) - See https://developers.google.com/identity for
            guides on implementing OAuth2 for your application. */
    GoogleCredentials credentials = GoogleCredentials.getApplicationDefault()
        .createScoped(Collections.singleton(SlidesScopes.DRIVE));
    HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(
        credentials);

    // Create the drive API client
    Drive driveService = new Drive.Builder(new NetHttpTransport(),
        GsonFactory.getDefaultInstance(),
        requestInitializer)
        .setApplicationName("Slides samples")
        .build();

    String presentationCopyId = null;
    try {
      // Copies an existing presentation using specified presentation title.
      File copyMetadata = new File().setName(copyTitle);
      File presentationCopyFile =
          driveService.files().copy(presentationId, copyMetadata).execute();
      presentationCopyId = presentationCopyFile.getId();
      // Prints the new copied presentation id.
      System.out.println("New copied presentation id " + presentationCopyId);
    } catch (GoogleJsonResponseException e) {
      // TODO(developer) - handle error appropriately
      GoogleJsonError error = e.getDetails();
      if (error.getCode() == 404) {
        System.out.printf("Presentation not found with id '%s'.\n", presentationId);
      } else {
        throw e;
      }
    }
    return presentationCopyId;
  }
}
```

### JavaScript

slides/snippets/slides_copy_presentation.js [View on GitHub](https://github.com/googleworkspace/browser-samples/blob/main/slides/snippets/slides_copy_presentation.js)

```javascript
function copyPresentation(presentationId, copyTitle, callback) {
  const request = {
    name: copyTitle,
  };
  try {
    gapi.client.drive.files.copy({
      fileId: presentationId,
      resource: request,
    }).then((driveResponse) => {
      const presentationCopyId = driveResponse.result.id;
      if (callback) callback(presentationCopyId);
      console.log('create copy_presentation with id', presentationCopyId);
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
}
```

### Node.js

slides/snippets/slides_copy_presentation.js [View on GitHub](https://github.com/googleworkspace/node-samples/blob/main/slides/snippets/slides_copy_presentation.js)

```javascript
import {GoogleAuth} from 'google-auth-library';
import {google} from 'googleapis';

/**
 * Copies a presentation.
 * @param {string} presentationId The ID of the presentation to copy.
 * @param {string} copyTitle The title for the copied presentation.
 * @return {Promise<object>} The response from the copy request.
 */
async function copyPresentation(presentationId, copyTitle) {
  // Authenticate with Google and get an authorized client.
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/drive',
  });

  // Create a new Drive API client.
  const service = google.drive({version: 'v2', auth});

  // The request to copy the presentation.
  const request = {
    name: copyTitle,
  };

  // Copy the presentation.
  const driveResponse = await service.files.copy({
    fileId: presentationId,
    requestBody: request,
  });

  // Log the ID of the copied presentation.
  const presentationCopyId = driveResponse.data.id;
  console.log(`Created copied presentation with ID: ${presentationCopyId}`);
  return driveResponse;
}
```

### PHP

slides/snippets/src/SlidesCopyPresentation.php [View on GitHub](https://github.com/googleworkspace/php-samples/blob/main/slides/snippets/src/SlidesCopyPresentation.php)

```php
<?php

use Google\Service\Drive;
use Google\Client;
use Google\Service\Drive\DriveFile;



function copyPresentation($presentationId, $copyTitle)
{
    /* Load pre-authorized user credentials from the environment.
   TODO(developer) - See https://developers.google.com/identity for
    guides on implementing OAuth2 for your application. */
    $client = new Google\Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(Google\Service\Drive::DRIVE);
    $driveService = new Google_Service_Drive($client);
    try {

        $copy = new Google_Service_Drive_DriveFile(array(
            'name' => $copyTitle
        ));
        $driveResponse = $driveService->files->copy($presentationId, $copy);
        $presentationCopyId = $driveResponse->id;
        printf("copyCreated at:%s\n ", $presentationCopyId);
        return $presentationCopyId;
    } catch (Exception $e) {
        echo 'Message: ' . $e->getMessage();
    }
}
```

### Python

slides/snippets/slides_copy_presentation.py [View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/slides/snippets/slides_copy_presentation.py)

```python
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def copy_presentation(presentation_id, copy_title):
  """
  Creates the copy Presentation the user has access to.
  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """

  creds, _ = google.auth.default()
  # pylint: disable=maybe-no-member
  try:
    drive_service = build("drive", "v3", credentials=creds)
    body = {"name": copy_title}
    drive_response = (
        drive_service.files().copy(fileId=presentation_id, body=body).execute()
    )
    presentation_copy_id = drive_response.get("id")

  except HttpError as error:
    print(f"An error occurred: {error}")
    print("Presentations  not copied")
    return error

  return presentation_copy_id
```

### Ruby

slides/snippets/lib/file_snippets.rb [View on GitHub](https://github.com/googleworkspace/ruby-samples/blob/main/slides/snippets/lib/file_snippets.rb)

```ruby
body = Google::Apis::SlidesV1::Presentation.new
body.title = copy_title
drive_response = drive_service.copy_file(presentation_id, body)
puts drive_response
presentation_copy_id = drive_response.id
```

Note that you need to use an appropriate
[Drive API scope](https://developers.google.com/workspace/drive/v3/reference/files/copy#auth) to
authorize the call.