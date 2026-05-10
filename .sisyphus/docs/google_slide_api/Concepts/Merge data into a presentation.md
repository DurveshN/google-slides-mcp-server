# Merge data into a presentation

One useful application of the Google Slides API is to merge information from one
or more data sources into a templated slide deck.

This page outlines how you can take data from an external source
and insert it into an existing template presentation. The concept is
similar to that of a *mail merge* using a word processor and spreadsheet.

There are several reasons why this approach is useful:

- It's easy for designers to fine-tune a presentation's design using
  the Google Slides editor. This is much easier than tuning parameters in
  your app to set the rendered slide design.

- Separating content from presentation is a well-known design
  principle with many benefits.

![Conceptual diagram of a merge.](https://developers.google.com/static/workspace/slides/api/images/slides-merge.svg)

## A basic recipe

[Video](https://www.youtube.com/watch?v=8LSUbKZq4ZY)

Here's an example of how you can use the Slides API to merge data into a
presentation:

1. Create your presentation as you want it to appear using
   placeholder content to help you with the design.

2. For each content element you'll be inserting, replace the placeholder
   content with a tag. Tags are text boxes or shapes with a unique string. Be sure to use strings that are unlikely to occur normally. For example,
   `{{account-holder-name}}` might be a good tag.

3. In your code, use the Google Drive API to make a copy of the
   presentation.

4. In your code, use the Slides API's
   [`batchUpdate`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/batchUpdate)
   method, with a set of
   [`replaceAllText`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#replacealltextrequest)
   requests, to perform all the text substitutions throughout the presentation.
   Use [`replaceAllShapesWithImage`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#replaceallshapeswithimagerequest)
   requests to perform image substitutions throughout the presentation.

> [!NOTE]
> You can perform multiple replacements in the same BatchUpdate request for efficiency. See [batch request best practices](https://developers.google.com/workspace/slides/api/guides/batch) for how to batch API calls together

Once you've created a deck with tags in it, be sure to make a copy
and use the Slides API to manipulate the copy. **Don't use the Slides API
to manipulate your primary "template" copy!**

The following sections include code snippets that illustrate some of this
process. You can also view the above video to see a complete example
(Python) combining several of the concepts from the individual sections below.

## Merge text

You can use a [`replaceAllText`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#replacealltextrequest)
request to replace all instances of a given text string in a
presentation with new text. For merges, this is simpler than
finding and replacing each instance of text individually. One reason this is the
most sophisticated approach is that page element IDs are difficult to predict,
especially as collaborators refine and maintain the template
presentation.

### Example

This example uses the Drive API to copy a template presentation, making
a new instance of the presentation. Then it uses the Google Sheets API to read data
from a Sheets spreadsheet, and finally uses the Slides API to update the
new presentation.

The example takes data from 3 cells in one row of a named range in the
spreadsheet. It then substitutes that data into the presentation wherever
the strings `{{customer-name}}`,
`{{case-description}}`, or
`{{total-portfolio}}` occur.

> [!NOTE]
> To keep it simple, the example doesn't include the initialization, authorization, and error handling code that you'd need.

### Apps Script

slides/api/Snippets.gs [View on GitHub](https://github.com/googleworkspace/apps-script-samples/blob/main/slides/api/Snippets.gs)

```javascript
/**
 * Use the Sheets API to load data, one record per row.
 * @param {string} templatePresentationId
 * @param {string} dataSpreadsheetId
 * @returns {*[]}
 */
function textMerging(templatePresentationId, dataSpreadsheetId) {
  const responses = [];
  const dataRangeNotation = "Customers!A2:M6";
  try {
    const values = SpreadsheetApp.openById(dataSpreadsheetId)
      .getRange(dataRangeNotation)
      .getValues();

    // For each record, create a new merged presentation.
    for (let i = 0; i < values.length; ++i) {
      const row = values[i];
      const customerName = row[2]; // name in column 3
      const caseDescription = row[5]; // case description in column 6
      const totalPortfolio = row[11]; // total portfolio in column 12

      // Duplicate the template presentation using the Drive API.
      const copyTitle = `${customerName} presentation`;
      let copyFile = {
        title: copyTitle,
        parents: [{ id: "root" }],
      };
      copyFile = Drive.Files.copy(copyFile, templatePresentationId);
      const presentationCopyId = copyFile.id;

      // Create the text merge (replaceAllText) requests for this presentation.
      const requests = [
        {
          replaceAllText: {
            containsText: {
              text: "{{customer-name}}",
              matchCase: true,
            },
            replaceText: customerName,
          },
        },
        {
          replaceAllText: {
            containsText: {
              text: "{{case-description}}",
              matchCase: true,
            },
            replaceText: caseDescription,
          },
        },
        {
          replaceAllText: {
            containsText: {
              text: "{{total-portfolio}}",
              matchCase: true,
            },
            replaceText: `${totalPortfolio}`,
          },
        },
      ];

      // Execute the requests for this presentation.
      const result = Slides.Presentations.batchUpdate(
        {
          requests: requests,
        },
        presentationCopyId,
      );
      // Count the total number of replacements made.
      let numReplacements = 0;
      for (const reply of result.replies) {
        numReplacements += reply.replaceAllText.occurrencesChanged;
      }
      console.log(
        "Created presentation for %s with ID: %s",
        customerName,
        presentationCopyId,
      );
      console.log("Replaced %s text instances", numReplacements);
    }
  } catch (err) {
    // TODO (Developer) - Handle exception
    console.log("Failed with error: %s", err.error);
  }
}
```

### Go

slides/snippets/presentations.go [View on GitHub](https://github.com/googleworkspace/go-samples/blob/main/slides/snippets/presentations.go)

```go
// Use the Sheets API to load data, one record per row.
dataRangeNotation := "Customers!A2:M6"
sheetsResponse, _ := sheetsService.Spreadsheets.Values.Get(dataSpreadsheetId, dataRangeNotation).Do()
values := sheetsResponse.Values

// For each record, create a new merged presentation.
for _, row := range values {
	customerName := row[2].(string)
	caseDescription := row[5].(string)
	totalPortfolio := row[11].(string)

	// Duplicate the template presentation using the Drive API.
	copyTitle := customerName + " presentation"
	file := drive.File{
		Title: copyTitle,
	}
	presentationFile, _ := driveService.Files.Copy(templatePresentationId, &file).Do()
	presentationId := presentationFile.Id

	// Create the text merge (replaceAllText) requests for this presentation.
	requests := []*slides.Request{{
		ReplaceAllText: &slides.ReplaceAllTextRequest{
			ContainsText: &slides.SubstringMatchCriteria{
				Text:      "{{customer-name}}",
				MatchCase: true,
			},
			ReplaceText: customerName,
		},
	}, {
		ReplaceAllText: &slides.ReplaceAllTextRequest{
			ContainsText: &slides.SubstringMatchCriteria{
				Text:      "{{case-description}}",
				MatchCase: true,
			},
			ReplaceText: caseDescription,
		},
	}, {
		ReplaceAllText: &slides.ReplaceAllTextRequest{
			ContainsText: &slides.SubstringMatchCriteria{
				Text:      "{{total-portfolio}}",
				MatchCase: true,
			},
			ReplaceText: totalPortfolio,
		},
	}}

	// Execute the requests for this presentation.
	body := &slides.BatchUpdatePresentationRequest{
		Requests: requests,
	}
	response, _ := slidesService.Presentations.BatchUpdate(presentationId, body).Do()
```

### Java

slides/snippets/src/main/java/TextMerging.java [View on GitHub](https://github.com/googleworkspace/java-samples/blob/main/slides/snippets/src/main/java/TextMerging.java)

```java
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.google.api.services.slides.v1.Slides;
import com.google.api.services.slides.v1.SlidesScopes;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationRequest;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationResponse;
import com.google.api.services.slides.v1.model.ReplaceAllTextRequest;
import com.google.api.services.slides.v1.model.Request;
import com.google.api.services.slides.v1.model.Response;
import com.google.api.services.slides.v1.model.SubstringMatchCriteria;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/* Class to demonstrate the use of Slides Text Merging API */
public class TextMerging {
  /**
   * Changes specified texts with data from spreadsheet.
   *
   * @param templatePresentationId - id of the presentation.
   * @param dataSpreadsheetId      - id of the spreadsheet containing data.
   * @return merged presentation id
   * @throws IOException - if credentials file not found.
   */
  public static List<BatchUpdatePresentationResponse> textMerging(
      String templatePresentationId, String dataSpreadsheetId) throws IOException {
        /* Load pre-authorized user credentials from the environment.
           TODO(developer) - See https://developers.google.com/identity for
            guides on implementing OAuth2 for your application. */
    GoogleCredentials credentials = GoogleCredentials.getApplicationDefault()
        .createScoped(Arrays.asList(SlidesScopes.PRESENTATIONS,
            SlidesScopes.DRIVE, SlidesScopes.SPREADSHEETS));
    HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(
        credentials);

    // Create the slides API client
    Slides service = new Slides.Builder(new NetHttpTransport(),
        GsonFactory.getDefaultInstance(),
        requestInitializer)
        .setApplicationName("Slides samples")
        .build();

    // Create the drive API client
    Drive driveService = new Drive.Builder(new NetHttpTransport(),
        GsonFactory.getDefaultInstance(),
        requestInitializer)
        .setApplicationName("Slides samples")
        .build();

    // Create the sheets API client
    Sheets sheetsService = new Sheets.Builder(new NetHttpTransport(),
        GsonFactory.getDefaultInstance(),
        requestInitializer)
        .setApplicationName("Slides samples")
        .build();

    List<BatchUpdatePresentationResponse> responses = new ArrayList<>(5);
    // Use the Sheets API to load data, one record per row.
    String dataRangeNotation = "Customers!A2:M6";
    ValueRange sheetsResponse = sheetsService.spreadsheets().values()
        .get(dataSpreadsheetId, dataRangeNotation).execute();
    List<List<Object>> values = sheetsResponse.getValues();

    try {
      // For each record, create a new merged presentation.
      for (List<Object> row : values) {
        String customerName = row.get(2).toString();     // name in column 3
        String caseDescription = row.get(5).toString();  // case description in column 6
        String totalPortfolio = row.get(11).toString();  // total portfolio in column 12

        // Duplicate the template presentation using the Drive API.
        String copyTitle = customerName + " presentation";
        File content = new File().setName(copyTitle);
        File presentationFile =
            driveService.files().copy(templatePresentationId, content).execute();
        String presentationId = presentationFile.getId();

        // Create the text merge (replaceAllText) requests for this presentation.
        List<Request> requests = new ArrayList<>();
        requests.add(new Request()
            .setReplaceAllText(new ReplaceAllTextRequest()
                .setContainsText(new SubstringMatchCriteria()
                    .setText("{{customer-name}}")
                    .setMatchCase(true))
                .setReplaceText(customerName)));
        requests.add(new Request()
            .setReplaceAllText(new ReplaceAllTextRequest()
                .setContainsText(new SubstringMatchCriteria()
                    .setText("{{case-description}}")
                    .setMatchCase(true))
                .setReplaceText(caseDescription)));
        requests.add(new Request()
            .setReplaceAllText(new ReplaceAllTextRequest()
                .setContainsText(new SubstringMatchCriteria()
                    .setText("{{total-portfolio}}")
                    .setMatchCase(true))
                .setReplaceText(totalPortfolio)));

        // Execute the requests for this presentation.
        BatchUpdatePresentationRequest body =
            new BatchUpdatePresentationRequest().setRequests(requests);
        BatchUpdatePresentationResponse response =
            service.presentations().batchUpdate(presentationId, body).execute();

        // Count total number of replacements made.
        int numReplacements = 0;
        for (Response resp : response.getReplies()) {
          numReplacements += resp.getReplaceAllText().getOccurrencesChanged();
        }
        // Prints the merged presentation id and count of replacements.
        System.out.println("Created merged presentation for " +
            customerName + " with ID: " + presentationId);
        System.out.println("Replaced " + numReplacements + " text instances.");
      }
    } catch (NullPointerException ne) {
      System.out.println("Text not found to replace with image.");
    } catch (GoogleJsonResponseException e) {
      // TODO(developer) - handle error appropriately
      GoogleJsonError error = e.getDetails();
      if (error.getCode() == 404) {
        System.out.printf("Presentation not found with id '%s'.\n", templatePresentationId);
      } else {
        throw e;
      }
    }
    return responses;
  }
}
```

### JavaScript

slides/snippets/slides_text_merging.js [View on GitHub](https://github.com/googleworkspace/browser-samples/blob/main/slides/snippets/slides_text_merging.js)

```javascript
function textMerging(templatePresentationId, dataSpreadsheetId, callback) {
  // Use the Sheets API to load data, one record per row.
  const responses = [];
  const dataRangeNotation = 'Customers!A2:M6';
  try {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: dataSpreadsheetId,
      range: dataRangeNotation,
    }).then((sheetsResponse) => {
      const values = sheetsResponse.result.values;
      // For each record, create a new merged presentation.
      for (let i = 0; i < values.length; ++i) {
        const row = values[i];
        const customerName = row[2]; // name in column 3
        const caseDescription = row[5]; // case description in column 6
        const totalPortfolio = row[11]; // total portfolio in column 12

        // Duplicate the template presentation using the Drive API.
        const copyTitle = customerName + ' presentation';
        const request = {
          name: copyTitle,
        };
        gapi.client.drive.files.copy({
          fileId: templatePresentationId,
          requests: request,
        }).then((driveResponse) => {
          const presentationCopyId = driveResponse.result.id;

          // Create the text merge (replaceAllText) requests for this presentation.
          const requests = [{
            replaceAllText: {
              containsText: {
                text: '{{customer-name}}',
                matchCase: true,
              },
              replaceText: customerName,
            },
          }, {
            replaceAllText: {
              containsText: {
                text: '{{case-description}}',
                matchCase: true,
              },
              replaceText: caseDescription,
            },
          }, {
            replaceAllText: {
              containsText: {
                text: '{{total-portfolio}}',
                matchCase: true,
              },
              replaceText: totalPortfolio,
            },
          }];

          // Execute the requests for this presentation.
          gapi.client.slides.presentations.batchUpdate({
            presentationId: presentationCopyId,
            requests: requests,
          }).then((batchUpdateResponse) => {
            const result = batchUpdateResponse.result;
            responses.push(result.replies);
            // Count the total number of replacements made.
            let numReplacements = 0;
            for (let i = 0; i < result.replies.length; ++i) {
              numReplacements += result.replies[i].replaceAllText.occurrencesChanged;
            }
            console.log(`Created presentation for ${customerName} with ID: ${presentationCopyId}`);
            console.log(`Replaced ${numReplacements} text instances`);
            if (responses.length === values.length) { // callback for the last value
              if (callback) callback(responses);
            }
          });
        });
      }
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
}
```

### Node.js

slides/snippets/slides_text_merging.js [View on GitHub](https://github.com/googleworkspace/node-samples/blob/main/slides/snippets/slides_text_merging.js)

```javascript
import {GoogleAuth} from 'google-auth-library';
import {google} from 'googleapis';

/**
 * Merges text from a spreadsheet into a template presentation.
 * @param {string} templatePresentationId The ID of the template presentation.
 * @param {string} dataSpreadsheetId The ID of the spreadsheet containing the data.
 */
async function textMerging(templatePresentationId, dataSpreadsheetId) {
  // Authenticate with Google and get an authorized client.
  const auth = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  // Create new clients for Slides, Sheets, and Drive APIs.
  const slidesService = google.slides({version: 'v1', auth});
  const sheetsService = google.sheets({version: 'v4', auth});
  const driveService = google.drive({version: 'v2', auth});

  // Use the Sheets API to load data from the spreadsheet.
  const dataRangeNotation = 'A2:M6';
  const sheetsResponse = await sheetsService.spreadsheets.values.get({
    spreadsheetId: dataSpreadsheetId,
    range: dataRangeNotation,
  });
  const values = sheetsResponse.data.values;

  // For each row of data, create a new presentation by copying the template
  // and replacing the placeholder text with the data.
  for (let i = 0; i < values.length; ++i) {
    const row = values[i];
    const customerName = row[2]; // Column 3
    const caseDescription = row[5]; // Column 6
    const totalPortfolio = row[11]; // Column 12

    // Duplicate the template presentation.
    const title = `${customerName} presentation`;
    const driveResponse = await driveService.files.copy({
      fileId: templatePresentationId,
      requestBody: {
        title,
      },
    });
    const presentationCopyId = driveResponse.data.id;

    // Create the text merge requests for this presentation.
    const requests = [
      {
        replaceAllText: {
          containsText: {
            text: '{{customer-name}}',
            matchCase: true,
          },
          replaceText: customerName,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{case-description}}',
            matchCase: true,
          },
          replaceText: caseDescription,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{total-portfolio}}',
            matchCase: true,
          },
          replaceText: totalPortfolio,
        },
      },
    ];

    // Execute the requests to replace the placeholder text.
    const batchUpdateResponse = await slidesService.presentations.batchUpdate({
      presentationId: presentationCopyId,
      requestBody: {
        requests,
      },
    });
    const result = batchUpdateResponse.data;

    // Count the total number of replacements made.
    let numReplacements = 0;
    for (let i = 0; i < result.replies.length; ++i) {
      numReplacements += result.replies[i].replaceAllText.occurrencesChanged;
    }
    console.log(
      `Created presentation for ${customerName} with ID: ${presentationCopyId}`,
    );
    console.log(`Replaced ${numReplacements} text instances.`);
  }
}
```

### PHP

slides/snippets/src/SlidesTextMerging.php [View on GitHub](https://github.com/googleworkspace/php-samples/blob/main/slides/snippets/src/SlidesTextMerging.php)

```php
<?php
use Google\Client;
use Google\Service\Drive;
use Google\Service\Slides;
use Google\Service\Slides\Request;

function textMerging($templatePresentationId, $dataSpreadsheetId)
{

    /* Load pre-authorized user credentials from the environment.
       TODO(developer) - See https://developers.google.com/identity for
        guides on implementing OAuth2 for your application. */
    $client = new Google\Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(Google\Service\Drive::DRIVE);
    $slidesService = new Google_Service_Slides($client);
    $driveService = new Google_Service_Drive($client);
    $sheetsService = new Google_Service_Sheets($client);
    try {
        $responses = array();
        // Use the Sheets API to load data, one record per row.
        $dataRangeNotation = 'Customers!A2:M6';
        $sheetsResponse =
            $sheetsService->spreadsheets_values->get($dataSpreadsheetId, $dataRangeNotation);
        $values = $sheetsResponse['values'];

        // For each record, create a new merged presentation.
        foreach ($values as $row) {
            $customerName = $row[2];     // name in column 3
            $caseDescription = $row[5];  // case description in column 6
            $totalPortfolio = $row[11];  // total portfolio in column 12

            // Duplicate the template presentation using the Drive API.
            $copy = new Google_Service_Drive_DriveFile(array(
                'name' => $customerName . ' presentation'
            ));
            $driveResponse = $driveService->files->copy($templatePresentationId, $copy);
            $presentationCopyId = $driveResponse->id;

            // Create the text merge (replaceAllText) requests for this presentation.
            $requests = array();
            $requests[] = new Google_Service_Slides_Request(array(
                'replaceAllText' => array(
                    'containsText' => array(
                        'text' => '{{customer-name}}',
                        'matchCase' => true
                    ),
                    'replaceText' => $customerName
                )
            ));
            $requests[] = new Google_Service_Slides_Request(array(
                'replaceAllText' => array(
                    'containsText' => array(
                        'text' => '{{case-description}}',
                        'matchCase' => true
                    ),
                    'replaceText' => $caseDescription
                )
            ));
            $requests[] = new Google_Service_Slides_Request(array(
                'replaceAllText' => array(
                    'containsText' => array(
                        'text' => '{{total-portfolio}}',
                        'matchCase' => true
                    ),
                    'replaceText' => $totalPortfolio
                )
            ));

            // Execute the requests for this presentation.
            $batchUpdateRequest = new Google_Service_Slides_BatchUpdatePresentationRequest(array(
                'requests' => $requests
            ));
            $response =
                $slidesService->presentations->batchUpdate($presentationCopyId, $batchUpdateRequest);
            $responses[] = $response;
            // Count the total number of replacements made.
            $numReplacements = 0;
            foreach ($response->getReplies() as $reply) {
                $numReplacements += $reply->getReplaceAllText()->getOccurrencesChanged();
            }
            printf("Created presentation for %s with ID: %s\n", $customerName, $presentationCopyId);
            printf("Replaced %d text instances.\n", $numReplacements);
        }
        return $responses;
    } catch (Exception $e) {
        echo 'Message: ' . $e->getMessage();
    }
}
```

### Python

slides/snippets/slides_text_merging.py [View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/slides/snippets/slides_text_merging.py)

```python
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def text_merging(template_presentation_id, data_spreadsheet_id):
  """
  Run Text merging the user has access to.
  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """
  creds, _ = google.auth.default()
  # pylint: disable=maybe-no-member

  try:
    service = build("slides", "v1", credentials=creds)
    sheets_service = build("sheets", "v4", credentials=creds)
    drive_service = build("drive", "v3", credentials=creds)
    # Use the Sheets API to load data, one record per row.
    data_range_notation = "Customers!A2:M6"
    sheets_response = (
        sheets_service.spreadsheets()
        .values()
        .get(spreadsheetId=data_spreadsheet_id, range=data_range_notation)
        .execute()
    )
    values = sheets_response.get("values")

    # For each record, create a new merged presentation.
    for row in values:
      customer_name = row[2]  # name in column 3
      case_description = row[5]  # case description in column 6
      total_portfolio = row[11]  # total portfolio in column 12

      # Duplicate the template presentation using the Drive API.
      copy_title = customer_name + " presentation"
      body = {"name": copy_title}
      drive_response = (
          drive_service.files()
          .copy(fileId=template_presentation_id, body=body)
          .execute()
      )
      presentation_copy_id = drive_response.get("id")

      # Create the text merge (replaceAllText) requests
      # for this presentation.
      requests = [
          {
              "replaceAllText": {
                  "containsText": {
                      "text": "{{customer-name}}",
                      "matchCase": True,
                  },
                  "replaceText": customer_name,
              }
          },
          {
              "replaceAllText": {
                  "containsText": {
                      "text": "{{case-description}}",
                      "matchCase": True,
                  },
                  "replaceText": case_description,
              }
          },
          {
              "replaceAllText": {
                  "containsText": {
                      "text": "{{total-portfolio}}",
                      "matchCase": True,
                  },
                  "replaceText": total_portfolio,
              }
          },
      ]

      # Execute the requests for this presentation.
      body = {"requests": requests}
      response = (
          service.presentations()
          .batchUpdate(presentationId=presentation_copy_id, body=body)
          .execute()
      )

      # Count the total number of replacements made.
      num_replacements = 0
      for reply in response.get("replies"):
        if reply.get("occurrencesChanged") is not None:
          num_replacements += reply.get("replaceAllText").get(
              "occurrencesChanged"
          )
      print(
          "Created presentation for "
          f"{customer_name} with ID: {presentation_copy_id}"
      )
      print(f"Replaced {num_replacements} text instances")

  except HttpError as error:
    print(f"An error occurred: {error}")
    return error


if __name__ == "__main__":
  # Put the template_presentation_id, data_spreadsheet_id
  # of slides

  text_merging(
      "10QnVUx1X2qHsL17WUidGpPh_SQhXYx40CgIxaKk8jU4",
      "17eqFZl_WK4WVixX8PjvjfLD77DraoFwMDXeiHB3dvuM",
  )
```

### Ruby

slides/snippets/lib/file_snippets.rb [View on GitHub](https://github.com/googleworkspace/ruby-samples/blob/main/slides/snippets/lib/file_snippets.rb)

```ruby
# Use the Sheets API to load data, one record per row.
data_range_notation = 'Customers!A2:M6'
sheets_response = sheets_service.get_spreadsheet_values(
  data_spreadsheet_id,
  data_range_notation
)
values = sheets_response.values

# For each record, create a new merged presentation.
values.each do |row|
  customer_name = row[2]       # name in column 3
  case_description = row[5]    # case description in column 6
  total_portfolio = row[11]    # total portfolio in column 12

  # Duplicate the template presentation using the Drive API.
  copy_title = customer_name + ' presentation'
  body = Google::Apis::SlidesV1::Presentation.new
  body.title = copy_title
  drive_response = drive_service.copy_file(template_presentation_id, body)
  presentation_copy_id = drive_response.id

  # Create the text merge (replace_all_text) requests for this presentation.
  requests = [] << {
    replace_all_text: {
      contains_text: {
        text:       '{{customer-name}}',
        match_case: true
      },
      replace_text:  customer_name
    }
  } << {
    replace_all_text: {
      contains_text: {
        text:       '{{case-description}}',
        match_case: true
      },
      replace_text:  case_description
    }
  } << {
    replace_all_text: {
      contains_text: {
        text:       '{{total-portfolio}}',
        match_case: true
      },
      replace_text:  total_portfolio
    }
  }

  # Execute the requests for this presentation.
  req = Google::Apis::SlidesV1::BatchUpdatePresentationRequest.new(requests: requests)
  response = slides_service.batch_update_presentation(
    presentation_copy_id,
    req
  )
```

## Merge images

You can also merge images into your presentation using a
[`replaceAllShapesWithImage`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#replaceallshapeswithimagerequest)
request. This request replaces all instances of shapes containing the
provided text string with the provided image. The request automatically
positions and scales the image to fit within the tag shape's bounds while
preserving the image's aspect ratio.

### Example

This example uses the Google Drive API to copy a template presentation, making
a new instance of the presentation. Then it uses the Slides API to find
any shape with the text `{{company-logo}}`
and replace it with a company logo image. The request also replaces any
shape with the text `{{customer-graphic}}`
with a different image.

> [!NOTE]
> To keep it simple, the example doesn't include the initialization, authorization, and error handling code that you'd need.

### Apps Script

slides/api/Snippets.gs [View on GitHub](https://github.com/googleworkspace/apps-script-samples/blob/main/slides/api/Snippets.gs)

```javascript
/**
 * Duplicate the template presentation using the Drive API.
 * @param {string} templatePresentationId
 * @param {string} imageUrl
 * @param {string} customerName
 * @returns {*}
 */
function imageMerging(templatePresentationId, imageUrl, customerName) {
  const logoUrl = imageUrl;
  const customerGraphicUrl = imageUrl;

  const copyTitle = `${customerName} presentation`;
  let copyFile = {
    title: copyTitle,
    parents: [{ id: "root" }],
  };

  try {
    copyFile = Drive.Files.copy(copyFile, templatePresentationId);
    const presentationCopyId = copyFile.id;

    // Create the image merge (replaceAllShapesWithImage) requests.
    const requests = [
      {
        replaceAllShapesWithImage: {
          imageUrl: logoUrl,
          imageReplaceMethod: "CENTER_INSIDE",
          containsText: {
            text: "{{company-logo}}",
            matchCase: true,
          },
        },
      },
      {
        replaceAllShapesWithImage: {
          imageUrl: customerGraphicUrl,
          imageReplaceMethod: "CENTER_INSIDE",
          containsText: {
            text: "{{customer-graphic}}",
            matchCase: true,
          },
        },
      },
    ];

    // Execute the requests for this presentation.
    const batchUpdateResponse = Slides.Presentations.batchUpdate(
      {
        requests: requests,
      },
      presentationCopyId,
    );
    let numReplacements = 0;
    for (const reply of batchUpdateResponse.replies) {
      numReplacements += reply.replaceAllShapesWithImage.occurrencesChanged;
    }
    console.log("Created merged presentation with ID: %s", presentationCopyId);
    console.log("Replaced %s shapes with images.", numReplacements);

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
// Duplicate the template presentation using the Drive API.
copyTitle := customerName + " presentation"
file := drive.File{
	Title: copyTitle,
}
presentationFile, _ := driveService.Files.Copy(templatePresentationId, &file).Do()
presentationId := presentationFile.Id

// Create the image merge (replaceAllShapesWithImage) requests.
requests := []*slides.Request{{
	ReplaceAllShapesWithImage: &slides.ReplaceAllShapesWithImageRequest{
		ImageUrl:      logoURL,
		ReplaceMethod: "CENTER_INSIDE",
		ContainsText: &slides.SubstringMatchCriteria{
			Text:      "{{company-logo}}",
			MatchCase: true,
		},
	},
}, {
	ReplaceAllShapesWithImage: &slides.ReplaceAllShapesWithImageRequest{
		ImageUrl:      customerGraphicURL,
		ReplaceMethod: "CENTER_INSIDE",
		ContainsText: &slides.SubstringMatchCriteria{
			Text:      "{{customer-graphic}}",
			MatchCase: true,
		},
	},
}}

// Execute the requests for this presentation.
body := &slides.BatchUpdatePresentationRequest{Requests: requests}
response, _ := slidesService.Presentations.BatchUpdate(presentationId, body).Do()

// Count total number of replacements made.
var numReplacements int64 = 0
for _, resp := range response.Replies {
	numReplacements += resp.ReplaceAllShapesWithImage.OccurrencesChanged
}
fmt.Printf("Created merged presentation with ID %s\n", presentationId)
fmt.Printf("Replaced %d shapes instances with images.\n", numReplacements)
```

### Java

slides/snippets/src/main/java/ImageMerging.java [View on GitHub](https://github.com/googleworkspace/java-samples/blob/main/slides/snippets/src/main/java/ImageMerging.java)

```java
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.slides.v1.Slides;
import com.google.api.services.slides.v1.SlidesScopes;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationRequest;
import com.google.api.services.slides.v1.model.BatchUpdatePresentationResponse;
import com.google.api.services.slides.v1.model.Request;
import com.google.api.services.slides.v1.model.Response;
import com.google.api.services.slides.v1.model.ReplaceAllShapesWithImageRequest;
import com.google.api.services.slides.v1.model.SubstringMatchCriteria;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/* Class to demonstrate the use of Slides Image Merging API */
public class ImageMerging {
  /**
   * Changes specified texts into images.
   *
   * @param templatePresentationId - id of the presentation.
   * @param imageUrl               - Url of the image.
   * @param customerName           - Name of the customer.
   * @return merged presentation id
   * @throws IOException - if credentials file not found.
   */
  public static BatchUpdatePresentationResponse imageMerging(String templatePresentationId,
                                                             String imageUrl,
                                                             String customerName)
      throws IOException {
        /* Load pre-authorized user credentials from the environment.
           TODO(developer) - See https://developers.google.com/identity for
            guides on implementing OAuth2 for your application. */
    GoogleCredentials credentials = GoogleCredentials.getApplicationDefault()
        .createScoped(Arrays.asList(SlidesScopes.PRESENTATIONS,
            SlidesScopes.DRIVE));
    HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(
        credentials);

    // Create the slides API client
    Slides service = new Slides.Builder(new NetHttpTransport(),
        GsonFactory.getDefaultInstance(),
        requestInitializer)
        .setApplicationName("Slides samples")
        .build();

    // Create the drive API client
    Drive driveService = new Drive.Builder(new NetHttpTransport(),
        GsonFactory.getDefaultInstance(),
        requestInitializer)
        .setApplicationName("Slides samples")
        .build();

    // Duplicate the template presentation using the Drive API.
    String copyTitle = customerName + " presentation";
    File content = new File().setName(copyTitle);
    File presentationFile =
        driveService.files().copy(templatePresentationId, content).execute();
    String presentationId = presentationFile.getId();

    // Create the image merge (replaceAllShapesWithImage) requests.
    List<Request> requests = new ArrayList<>();
    requests.add(new Request()
        .setReplaceAllShapesWithImage(new ReplaceAllShapesWithImageRequest()
            .setImageUrl(imageUrl)
            .setImageReplaceMethod("CENTER_INSIDE")
            .setContainsText(new SubstringMatchCriteria()
                .setText("{{company-logo}}")
                .setMatchCase(true))));

    // Execute the requests.
    BatchUpdatePresentationRequest body =
        new BatchUpdatePresentationRequest().setRequests(requests);
    BatchUpdatePresentationResponse response =
        service.presentations().batchUpdate(presentationId, body).execute();

    int numReplacements = 0;
    try {
      // Count total number of replacements made.
      for (Response resp : response.getReplies()) {
        numReplacements += resp.getReplaceAllShapesWithImage().getOccurrencesChanged();
      }

      // Prints the merged presentation id and count of replacements.
      System.out.println("Created merged presentation with ID: " + presentationId);
      System.out.println("Replaced " + numReplacements + " shapes instances with images.");
    } catch (NullPointerException ne) {
      System.out.println("Text not found to replace with image.");
    }
    return response;
  }
}
```

### JavaScript

slides/snippets/slides_image_merging.js [View on GitHub](https://github.com/googleworkspace/browser-samples/blob/main/slides/snippets/slides_image_merging.js)

```javascript
function imageMerging(
    templatePresentationId,
    imageUrl,
    customerName,
    callback,
) {
  const logoUrl = imageUrl;
  const customerGraphicUrl = imageUrl;

  // Duplicate the template presentation using the Drive API.
  const copyTitle = customerName + ' presentation';
  try {
    gapi.client.drive.files
        .copy({
          fileId: templatePresentationId,
          resource: {
            name: copyTitle,
          },
        })
        .then((driveResponse) => {
          const presentationCopyId = driveResponse.result.id;

          // Create the image merge (replaceAllShapesWithImage) requests.
          const requests = [
            {
              replaceAllShapesWithImage: {
                imageUrl: logoUrl,
                replaceMethod: 'CENTER_INSIDE',
                containsText: {
                  text: '{{company-logo}}',
                  matchCase: true,
                },
              },
            },
            {
              replaceAllShapesWithImage: {
                imageUrl: customerGraphicUrl,
                replaceMethod: 'CENTER_INSIDE',
                containsText: {
                  text: '{{customer-graphic}}',
                  matchCase: true,
                },
              },
            },
          ];
          // Execute the requests for this presentation.
          gapi.client.slides.presentations
              .batchUpdate({
                presentationId: presentationCopyId,
                requests: requests,
              })
              .then((batchUpdateResponse) => {
                let numReplacements = 0;
                for (
                  let i = 0;
                  i < batchUpdateResponse.result.replies.length;
                  ++i
                ) {
                  numReplacements +=
                batchUpdateResponse.result.replies[i].replaceAllShapesWithImage
                    .occurrencesChanged;
                }
                console.log(
                    `Created merged presentation with ID: ${presentationCopyId}`,
                );
                console.log(`Replaced ${numReplacements} shapes with images.`);
                if (callback) callback(batchUpdateResponse.result);
              });
        });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
}
```

### Node.js

slides/snippets/slides_image_merging.js [View on GitHub](https://github.com/googleworkspace/node-samples/blob/main/slides/snippets/slides_image_merging.js)

```javascript
import {GoogleAuth} from 'google-auth-library';
import {google} from 'googleapis';

/**
 * Replaces shapes in a presentation with images.
 * @param {string} templatePresentationId The ID of the template presentation.
 * @param {string} imageUrl The URL of the image to use.
 * @param {string} customerName The name of the customer for the new presentation title.
 * @return {Promise<object>} The response from the batch update.
 */
async function imageMerging(templatePresentationId, imageUrl, customerName) {
  // Authenticate with Google and get an authorized client.
  const auth = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/drive',
    ],
  });

  // Create new clients for Slides and Drive APIs.
  const slidesService = google.slides({version: 'v1', auth});
  const driveService = google.drive({version: 'v2', auth});

  const logoUrl = imageUrl;
  const customerGraphicUrl = imageUrl;

  // Duplicate the template presentation.
  const copyTitle = `${customerName} presentation`;
  const driveResponse = await driveService.files.copy({
    fileId: templatePresentationId,
    requestBody: {
      name: copyTitle,
    },
  });
  const presentationCopyId = driveResponse.data.id;

  // Create the image merge requests.
  const requests = [
    {
      replaceAllShapesWithImage: {
        imageUrl: logoUrl,
        replaceMethod: 'CENTER_INSIDE',
        containsText: {
          text: '{{company-logo}}',
          matchCase: true,
        },
      },
    },
    {
      replaceAllShapesWithImage: {
        imageUrl: customerGraphicUrl,
        replaceMethod: 'CENTER_INSIDE',
        containsText: {
          text: '{{customer-graphic}}',
          matchCase: true,
        },
      },
    },
  ];

  // Execute the requests to replace the shapes with images.
  const batchUpdateResponse = await slidesService.presentations.batchUpdate({
    presentationId: presentationCopyId,
    requestBody: {
      requests,
    },
  });

  // Count the total number of replacements made.
  let numReplacements = 0;
  for (let i = 0; i < batchUpdateResponse.data.replies.length; ++i) {
    numReplacements +=
      batchUpdateResponse.data.replies[i].replaceAllShapesWithImage
        .occurrencesChanged;
  }
  console.log(`Created merged presentation with ID: ${presentationCopyId}`);
  console.log(`Replaced ${numReplacements} shapes with images.`);
  return batchUpdateResponse.data;
}
```

### PHP

slides/snippets/src/SlidesImageMerging.php [View on GitHub](https://github.com/googleworkspace/php-samples/blob/main/slides/snippets/src/SlidesImageMerging.php)

```php
<?php
use Google\Client;
use Google\Service\Drive;
use Google\Service\Slides;
use Google\Service\DriveFile;
use Google\Service\Slides\Request;


function imageMerging($templatePresentationId, $imageUrl, $customerName)
{
    /* Load pre-authorized user credentials from the environment.
       TODO(developer) - See https://developers.google.com/identity for
        guides on implementing OAuth2 for your application. */
    $client = new Google\Client();
    $client->useApplicationDefaultCredentials();
    $client->addScope(Google\Service\Drive::DRIVE);
    $slidesService = new Google_Service_Slides($client);
    $driveService = new Google_Service_Drive($client);
    // Duplicate the template presentation using the Drive API.
    $copy = new Google_Service_Drive_DriveFile([
        'name' => $customerName . ' presentation'
    ]);

    $driveResponse = $driveService->files->copy($templatePresentationId, $copy);
    $presentationCopyId = $driveResponse->id;

    // Create the image merge (replaceAllShapesWithImage) requests.

    $requests[] = new Google_Service_Slides_Request([
        'replaceAllShapesWithImage' => [
            'imageUrl' => $imageUrl,
            'replaceMethod' => 'CENTER_INSIDE',
            'containsText' => [
                'text' => '{{company-logo}}',
                'matchCase' => true
            ]
        ]
    ]);
    $requests[] = new Google_Service_Slides_Request([
        'replaceAllShapesWithImage' => [
            'imageUrl' => $imageUrl,
            'replaceMethod' => 'CENTER_INSIDE',
            'containsText' => [
                'text' => '{{customer-graphic}}',
                'matchCase' => true
            ]
        ]
    ]);

    // Execute the requests.
    $batchUpdateRequest = new Google_Service_Slides_BatchUpdatePresentationRequest([
        'requests' => $requests
    ]);
    $response =
        $slidesService->presentations->batchUpdate($presentationCopyId, $batchUpdateRequest);

    // Count the total number of replacements made.
    $numReplacements = 0;
    foreach ($response->getReplies() as $reply) {
        $numReplacements += $reply->getReplaceAllShapesWithImage()->getOccurrencesChanged();
    }
    printf("Created presentation for %s with ID: %s\n", $customerName, $presentationCopyId);
    printf("Replaced %d shapes with images.\n", $numReplacements);
    return $response;
}
```

### Python

slides/snippets/slides_image_merging.py [View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/slides/snippets/slides_image_merging.py)

```python
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def image_merging(template_presentation_id, image_url, customer_name):
  """image_merging require template_presentation_id,
  image_url and customer_name
  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """
  creds, _ = google.auth.default()
  # pylint: disable=maybe-no-member
  try:
    slides_service = build("slides", "v1", credentials=creds)
    drive_service = build("drive", "v3", credentials=creds)
    logo_url = image_url

    customer_graphic_url = image_url

    # Duplicate the template presentation using the Drive API.
    copy_title = customer_name + " presentation"
    drive_response = (
        drive_service.files()
        .copy(fileId=template_presentation_id, body={"name": copy_title})
        .execute()
    )
    presentation_copy_id = drive_response.get("id")

    # Create the image merge (replaceAllShapesWithImage) requests.
    requests = []
    requests.append(
        {
            "replaceAllShapesWithImage": {
                "imageUrl": logo_url,
                "replaceMethod": "CENTER_INSIDE",
                "containsText": {
                    "text": "{{company-logo}}",
                    "matchCase": True,
                },
            }
        }
    )
    requests.append(
        {
            "replaceAllShapesWithImage": {
                "imageUrl": customer_graphic_url,
                "replaceMethod": "CENTER_INSIDE",
                "containsText": {
                    "text": "{{customer-graphic}}",
                    "matchCase": True,
                },
            }
        }
    )

    # Execute the requests.
    body = {"requests": requests}
    response = (
        slides_service.presentations()
        .batchUpdate(presentationId=presentation_copy_id, body=body)
        .execute()
    )

    # Count the number of replacements made.
    num_replacements = 0

    for reply in response.get("replies"):
      # add below line

      if reply.get("occurrencesChanged") is not None:
        # end tag
        num_replacements += reply.get("replaceAllShapesWithImage").get(
            "occurrencesChanged"
        )

    print(f"Created merged presentation with ID:{presentation_copy_id}")
    print(f"Replaced {num_replacements} shapes with images")
  except HttpError as error:
    print(f"An error occurred: {error}")
    print("Images is not merged")
    return error

  return response


if __name__ == "__main__":
  # Put the template_presentation_id, image_url and customer_name

  image_merging(
      "10QnVUx1X2qHsL17WUidGpPh_SQhXYx40CgIxaKk8jU4",
      "https://www.google.com/images/branding/"
      "googlelogo/2x/googlelogo_color_272x92dp.png",
      "Fake Customer",
  )
```

### Ruby

slides/snippets/lib/file_snippets.rb [View on GitHub](https://github.com/googleworkspace/ruby-samples/blob/main/slides/snippets/lib/file_snippets.rb)

```ruby
# Duplicate the template presentation using the Drive API.
copy_title = customer_name + ' presentation'
body = Google::Apis::SlidesV1::Presentation.new
body.title = copy_title
drive_response = drive_service.copy_file(template_presentation_id, body)
presentation_copy_id = drive_response.id

# Create the image merge (replace_all_shapes_with_image) requests.
requests = [] << {
  replace_all_shapes_with_image: {
    image_url:      logo_url,
    replace_method: 'CENTER_INSIDE',
    contains_text:  {
      text:       '{{company-logo}}',
      match_case: true
    }
  }
} << {
  replace_all_shapes_with_image: {
    image_url:      customer_graphic_url,
    replace_method: 'CENTER_INSIDE',
    contains_text:  {
      text:       '{{customer-graphic}}',
      match_case: true
    }
  }
}

# Execute the requests.
req = Google::Apis::SlidesV1::BatchUpdatePresentationRequest.new(requests: requests)
response = slides_service.batch_update_presentation(
  presentation_copy_id,
  req
)

# Count the number of replacements made.
num_replacements = 0
response.replies.each do |reply|
  num_replacements += reply.replace_all_shapes_with_image.occurrences_changed
end
puts "Created presentation for #{customer_name} with ID: #{presentation_copy_id}"
puts "Replaced #{num_replacements} shapes with images"
```

## Replace specific text box or image instances

The [`replaceAllText`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#replacealltextrequest)
and [`replaceAllShapesWithImage`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#replaceallshapeswithimagerequest)
requests are useful for replacing tags throughout a presentation, but
sometimes you only need to replace elements according to another criteria, such
as being located on a specific slide.

In these cases, you must retrieve the IDs of the tag shapes you
want to replace. For text replacements, you delete the existing
text in those shapes and then insert the new text (see the sample
[Edit text in a specified shape](https://developers.google.com/workspace/slides/samples/writing#edit_text_in_a_specified_shape)).

Image replacements are more complex. To merge in an image, you need to:

1. Get the tag shape's ID.
2. Copy the size and transform information from the tag.
3. Add your image to the page, using the size and transform information.
4. Delete the tag shape.

Preserving the image's aspect ratio while scaling it to the desired size might
require some care, as described in the following section. Also see this sample:
[Replace a shape tag with an image](https://developers.google.com/workspace/slides/samples/writing#replace_a_shape_tag_with_an_image).

### Preserve aspect ratio

When you create images using the Slides API, aspect fits are based only on the
image size, not on the size and transform data. The size data you provide
in the [`createImage`](https://developers.google.com/workspace/slides/reference/rest/v1/presentations/request#createimagerequest)
request is considered to be the desired size of the image. The API fits the
image's aspect ratio to this desired size, then applies the provided transform.

When replacing a tag with an image, you preserve the image's aspect
ratio by setting the image's size and scaling as follows:

- **width** : set to the product of the tag's `width` and `scaleX`
- **height** : set to the product of the tag's `height` and `scaleY`
- **scale_x** : set to `1`
- **scale_y** : set to `1`

This causes the Slides API to aspect fit the image according to the
tag's visual size, rather than its non-scaled size (see
[Replace a shape tag with an image](https://developers.google.com/workspace/slides/samples/writing#replace_a_shape_tag_with_an_image)).
Setting the scaling parameters to `1` prevents the image from being scaled
twice.

This arrangement ensures the image's aspect ratio is preserved, and prevents
the image from exceeding the size of the tag shape. The image has
the same center point as the tag shape.

## Manage templates

For template presentations the application defines and owns, create
the template using a dedicated account representing the application.
[Service accounts](https://developers.google.com/identity/protocols/application-default-credentials)
are a good choice and avoid complications with Google Workspace policies that
restrict sharing.

When you create instances of presentations from templates, always use
end-user credentials. This gives users full control over the
resulting presentation and prevents scaling issues related to per-user
limits in Google Drive.

To create a template using a service account, perform the following steps with
the application credentials:

1. Create a presentation using [presentations.create](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/create) in the Slides API.
2. Update the permissions to allow the presentation recipients to read it using [permissions.create](https://developers.google.com/workspace/drive/api/v3/reference/permissions/create) in the Drive API.
3. Update the permissions to allow template authors to write to it using [permissions.create](https://developers.google.com/workspace/drive/api/v3/reference/permissions/create) in the Drive API.
4. Edit the template as required.

To create an instance of the presentation, perform the following steps
with the user credentials:

1. Create a copy of the template using [files.copy](https://developers.google.com/workspace/drive/v3/reference/files/copy) in the Drive API.
2. Replace values using [presentation.batchUpdate](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate) in the Slides API.