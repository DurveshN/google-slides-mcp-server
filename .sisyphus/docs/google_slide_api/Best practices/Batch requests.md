# Batch requests

This document shows how to batch API calls together to reduce the number of
connections your client has to make. Batching can improve an application's
efficiency by decreasing network round trips and increasing throughput.

## Overview


Each connection your client makes results in a certain amount of overhead.
The Google Slides API supports batching to let your client place multiple
request objects, each one specifying a single type of request to perform,
into a single batch request. A batch request can boost performance by
combining multiple subrequests into a single call to the server, retrieving
a single response back.


We encourage users to always batch multiple requests together. Here are some
examples of situations where you can use batching:

- You've just started using the API and you have lots of data to upload.
- You need to update metadata or properties, such as formatting, on multiple objects.
- You need to delete many objects.

## Limits, authorization, \& dependency considerations

Here's a list of other items to consider when employing batch updating:

- Each batch request, including all subrequests, is counted as one API request toward your [usage limit](https://developers.google.com/workspace/slides/api/limits).
- A batch request is authenticated once. This single authentication applies to all batch update objects in the request.
- The server processes the subrequests in the same order they appear in the batch request. Latter subrequests can depend on actions taken during earlier subrequests. For example, in the same batch request, users can insert text into an existing document and then style it.

## Batch details


A batch request consists of one `https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate` method call
with multiple subrequests to, for example, add and then format a presentation.


Each request is validated before being applied. All subrequests in the batch
update are applied atomically. That is, if any request is not valid then the
entire update is unsuccessful and none of the (potentially dependent)
changes are applied.


Some requests provide responses with information about the applied requests.
For example, all batch update requests to add objects return responses so
you can access the metadata of the newly added object, such as the ID or
title.


With this approach, you can build an entire Google document using one API
batch update request with multiple subrequests.

### Format of a batch request


A [request](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request) is a single JSON request containing multiple,
nested subrequests with one required property: `requests`. The
requests are constructed in an array of individual requests. Each request uses
JSON to represent the request object and to contain its properties.

### Format of a batch response


The [response](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/response) format for a batch request is similar to the
request format. The server's response contains a complete reply of the single
response object.


The main JSON object's property is named `replies`. The responses
are returned in an array, with each response to one of the requests occupying
the same index order as the corresponding request. Some requests don't have
responses and the response at that array index is empty.

## Example

The following code sample shows the use of batching with the
Slides API.

### Request

This example batch request demonstrates how to:

- Add a
  [`presentations.pages`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages)
  resource to an existing presentation, with an `insertionIndex` of `1`, using
  the
  [`CreateSlideRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#createsliderequest)
  method.

- Add a `shapeType` of type `TEXT_BOX` to the new slide using the
  [`CreateShapeRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#createshaperequest)
  method.

- Insert "Hello World" text into the new field using the
  [`InsertTextRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#inserttextrequest)
  method.

```
{
   "requests":[
      {
         "createSlide":{
            "insertionIndex":1,
            "objectId":"newSlide"
         }
      },
      {
         "createShape":{
            "elementProperties":{
               "pageObjectId":"newSlide",
               "size":{
                  "height":{
                     "magnitude":50,
                     "unit":"PT"
                  },
                  "width":{
                     "magnitude":200,
                     "unit":"PT"
                  }
               }
            },
            "shapeType":"TEXT_BOX",
            "objectId":"newTextBox"
         }
      },
      {
         "insertText":{
            "objectId":"newTextBox",
            "text":"Hello World"
         }
      }
   ]
}
```

### Response

This example batch response displays information on how each subrequest within
the batch request was applied. Note the
[`InsertTextRequest`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/request#inserttextrequest)
method doesn't contain a response so the index value of the array at \[2\]
consists of empty curly braces. The batch request does display the
[`WriteControl`](https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate#writecontrol)
property, which shows how the write requests were executed.

```
{
   "requiredRevisionId": ID
   "presentationId": "",
   "replies":[
      {
         "createSlide":{
            "objectId":"newSlide"
         }
      },
      {
         "createShape":{
            "objectId":"newTextBox"
         }
      },
      {
         
      }
   ],
   "writeControl":{
      "requiredRevisionId": REVISION_ID
   }
}
```