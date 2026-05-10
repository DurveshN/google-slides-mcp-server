import { createDriveClient } from '../google-client.js';
import { normalizeError } from './errors.js';
import { Readable } from 'stream';
import { debugLog } from './debug-logger.js';

const CALLMISSED_BASE_URL = 'https://api.callmissed.com/v1';
const CALLMISSED_API_KEY = process.env.CALLMISSED;

if (!CALLMISSED_API_KEY) {
  console.warn('Warning: CALLMISSED environment variable not set. Image generation will fail.');
}

async function getAuth() {
  const { getAuthenticatedClient } = await import('../auth.js');
  return getAuthenticatedClient();
}

interface GenerateImageParams {
  prompt: string;
  model?: string;
  size?: string;
  n?: number;
}

interface GenerateImageResult {
  base64Image: string;
  mimeType: string;
  revisedPrompt?: string;
}

/**
 * Generate an image using CallMissed API (OpenAI-compatible)
 * Returns base64-encoded image data
 */
export async function generateImage({
  prompt,
  model = 'flux-2-klein-9b',
  size = '1024x1024',
  n = 1,
}: GenerateImageParams): Promise<GenerateImageResult> {
  if (!CALLMISSED_API_KEY) {
    throw new Error('CALLMISSED API key not configured. Set CALLMISSED environment variable.');
  }

  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt is required and must be a string');
  }

  const callApi = async (): Promise<GenerateImageResult> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      debugLog('[generateImage] Calling CallMissed API', { model, size, promptLength: prompt.length });
      const response = await fetch(`${CALLMISSED_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CALLMISSED_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          n,
          size,
          response_format: 'b64_json',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        debugLog('[generateImage] API error', { status: response.status, errorText });
        throw new Error(`CallMissed API error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as {
        created: number;
        data: Array<{ b64_json: string; revised_prompt?: string }>;
      };

      if (!data.data || data.data.length === 0 || !data.data[0].b64_json) {
        throw new Error('CallMissed API returned empty image data');
      }

      const mimeType = size.includes('jpg') || size.includes('jpeg') ? 'image/jpeg' : 'image/png';
      debugLog('[generateImage] Success', { mimeType, revisedPromptLength: data.data[0].revised_prompt?.length });

      return {
        base64Image: data.data[0].b64_json,
        mimeType,
        revisedPrompt: data.data[0].revised_prompt,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      throw err;
    }
  };

  try {
    return await callApi();
  } catch (err: any) {
    if (err.name === 'AbortError' || err.message?.includes('fetch failed') || err.message?.includes('timeout')) {
      console.error('[generateImage] First attempt timed out, retrying...');
      debugLog('[generateImage] Retrying after timeout');
      await new Promise(r => setTimeout(r, 1000));
      return await callApi();
    }
    throw err;
  }
}

/**
 * Upload a base64 image to Google Drive and make it publicly accessible
 * Returns the public webContentLink URL
 */
export async function uploadImageToDrive({
  base64Image,
  mimeType = 'image/png',
  filename = `generated_image_${Date.now()}.png`,
}: {
  base64Image: string;
  mimeType?: string;
  filename?: string;
}): Promise<{ fileId: string; publicUrl: string }> {
  debugLog('[uploadImageToDrive] Starting upload', { filename, mimeType, base64Length: base64Image.length });
  const auth = await getAuth();
  const driveClient = createDriveClient({ auth });

  const imageBuffer = Buffer.from(base64Image, 'base64');
  const stream = Readable.from([imageBuffer]);

  try {
    const uploadResponse = await driveClient.files.create({
      requestBody: {
        name: filename,
        mimeType,
      },
      media: {
        mimeType,
        body: stream,
      },
    });

    const fileId = uploadResponse.data.id;
    if (!fileId) {
      throw new Error('Drive upload failed: no file ID returned');
    }
    debugLog('[uploadImageToDrive] File created', { fileId });

    await driveClient.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    debugLog('[uploadImageToDrive] Permissions set');

    const publicUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
    debugLog('[uploadImageToDrive] Done', { publicUrl: publicUrl.slice(0, 80) + '...' });

    return { fileId, publicUrl };
  } catch (error) {
    debugLog('[uploadImageToDrive] Error', { error: (error as Error).message });
    throw normalizeError(error);
  }
}

/**
 * Generate an image and upload to Drive in one step
 * Returns the public URL ready for add_image tool
 */
export async function generateAndUploadImage({
  prompt,
  model = 'flux-2-klein-9b',
  size = '1024x1024',
}: GenerateImageParams & { mimeType?: string }): Promise<{ 
  publicUrl: string; 
  fileId: string; 
  mimeType: string;
  revisedPrompt?: string;
}> {
  debugLog('[generateAndUploadImage] Starting', { promptLength: prompt.length, model, size });
  const { base64Image, mimeType, revisedPrompt } = await generateImage({ prompt, model, size });
  debugLog('[generateAndUploadImage] Image generated, uploading to Drive');
  const { fileId, publicUrl } = await uploadImageToDrive({ base64Image, mimeType });
  debugLog('[generateAndUploadImage] Complete', { fileId, publicUrl: publicUrl.slice(0, 80) + '...' });
  
  return { publicUrl, fileId, mimeType, revisedPrompt };
}
