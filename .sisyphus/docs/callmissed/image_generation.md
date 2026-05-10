API Guides & Tutorials

Generate images from a text prompt. OpenAI-compatible endpoint.

## Overview

Generate images from a text prompt. The request and response shape match OpenAI's images.generate, so any existing OpenAI SDK works by pointing base_url at https://api.callmissed.com/v1.

Endpoint: POST /v1/images/generations

Images come back as base64-encoded PNG (or JPEG, depending on the model) in the data[].b64_json field.

## Basic Usage

```
from openai import OpenAI

client = OpenAI(
    api_key="cm_your_key",
    base_url="https://api.callmissed.com/v1",
)

res = client.images.generate(
    model="flux-2-klein-9b",
    prompt="A golden retriever in a sunlit library, cinematic bokeh",
    n=1,
    size="1024x1024",
)
# res.data[0].b64_json → base64 image
```

## Parameters

### Response

```
{
  "created": 1731234567,
  "data": [
    { "b64_json": "<base64 PNG>", "revised_prompt": null }
  ]
}
```

## Models

## Sizes

Common presets: 512x512, 768x768, 1024x1024, 1024x1536, 1536x1024.

Any width/height from 64 to 4096 is accepted, but providers may clamp or round down to their supported values.

## Pricing

Flat per-image price, converted to credits at 1 credit = ₹1.

Credits are deducted after the upstream call returns successfully. A failed generation does not cost credits.

## Errors

PREVIOUS

Voices

NEXT

Anthropic API
