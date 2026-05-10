/**
 * Element Tools - Text Boxes, Shapes, Images, and Tables
 * T8: Add text boxes and shapes
 * T9: Add images and tables
 */

import { batchUpdate, createSlidesClient } from '../google-client.js';
import { validatePresentationId, validateObjectId, validateUrl } from '../utils/validators.js';
import { getAuthenticatedClient } from '../auth.js';
import { normalizeError } from '../utils/errors.js';
import { Retry } from '../utils/retry.js';

const retry = new Retry({ maxRetries: 3 });

const EMU_PER_INCH = 914400;

/**
 * Add an image to a slide
 */
export async function add_image(params: {
  presentationId: string;
  slideId: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}): Promise<{ elementId: string }> {
  validatePresentationId(params.presentationId);
  validateObjectId(params.slideId);
  validateUrl(params.imageUrl);

  if (params.width <= 0 || params.height <= 0) {
    throw new Error('Image width and height must be positive numbers');
  }

  const request = {
    createImage: {
      objectId: `image_${Date.now()}`,
      url: params.imageUrl,
      elementProperties: {
        pageObjectId: params.slideId,
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: params.x * EMU_PER_INCH,
          translateY: params.y * EMU_PER_INCH,
          unit: "EMU",
        },
      },
    },
  };

  const auth = await getAuthenticatedClient();
  const slidesClient = createSlidesClient({ auth });

  try {
    const response = await retry.execute(
      () => batchUpdate(slidesClient, {
        presentationId: params.presentationId,
        requests: [request],
      }),
      'add_image'
    );

    const elementId = response.result.data?.replies?.[0]?.createImage?.objectId;

    if (!elementId) {
      throw new Error('Failed to create image: no element ID returned');
    }

    return { elementId };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Add a table to a slide
 */
export async function add_table(params: {
  presentationId: string;
  slideId: string;
  rows: number;
  columns: number;
  x: number;
  y: number;
  width: number;
  height: number;
}): Promise<{ elementId: string }> {
  validatePresentationId(params.presentationId);
  validateObjectId(params.slideId);

  if (params.rows <= 0 || params.columns <= 0) {
    throw new Error('Rows and columns must be positive numbers');
  }

  if (params.rows > 20) {
    throw new Error('Maximum rows allowed is 20');
  }

  if (params.columns > 10) {
    throw new Error('Maximum columns allowed is 10');
  }

  const request = {
    createTable: {
      objectId: `table_${Date.now()}`,
      elementProperties: {
        pageObjectId: params.slideId,
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: params.x * EMU_PER_INCH,
          translateY: params.y * EMU_PER_INCH,
          unit: "EMU",
        },
      },
      rows: params.rows,
      columns: params.columns,
    },
  };

  const auth = await getAuthenticatedClient();
  const slidesClient = createSlidesClient({ auth });

  try {
    const response = await retry.execute(
      () => batchUpdate(slidesClient, {
        presentationId: params.presentationId,
        requests: [request],
      }),
      'add_table'
    );

    const elementId = response.result.data?.replies?.[0]?.createTable?.objectId;

    if (!elementId) {
      throw new Error('Failed to create table: no element ID returned');
    }

    return { elementId };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Add a text box to a slide (T8)
 */
export async function add_text_box(params: {
  presentationId: string;
  slideId: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  bold?: boolean;
  color?: string;
}): Promise<{ elementId: string }> {
  validatePresentationId(params.presentationId);
  validateObjectId(params.slideId);

  if (!params.text || typeof params.text !== 'string') {
    throw new Error('text is required and must be a string');
  }

  if (params.text.length > 10000) {
    throw new Error('Text length must be ≤ 10,000 characters');
  }

  if (typeof params.x !== 'number' || typeof params.y !== 'number') {
    throw new Error('x and y must be numbers');
  }

  if (typeof params.width !== 'number' || typeof params.height !== 'number') {
    throw new Error('width and height must be numbers');
  }

  if (params.fontSize !== undefined && (typeof params.fontSize !== 'number' || params.fontSize <= 0)) {
    throw new Error('fontSize must be a positive number');
  }

  const auth = await getAuthenticatedClient();
  const slidesClient = createSlidesClient({ auth });

  const elementId = crypto.randomUUID().slice(0, 50);

const requests = [
        {
          createShape: {
            objectId: elementId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: params.slideId,
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: params.x * EMU_PER_INCH,
                translateY: params.y * EMU_PER_INCH,
                unit: 'EMU',
              },
            },
          },
        },
    {
      insertText: {
        objectId: elementId,
        text: params.text,
        insertionIndex: 0,
      },
    },
    {
      updateParagraphStyle: {
        objectId: elementId,
        paragraphStyle: {
          alignment: 'START',
          indentStart: {
            magnitude: 0,
            unit: 'EMU',
          },
        },
        fields: 'alignment,indentStart',
      },
    },
    {
      updateTextStyle: {
        objectId: elementId,
        textRange: {
          type: 'ALL',
        },
        textStyle: {
          fontSize: {
            magnitude: params.fontSize ?? 12,
            unit: 'PT',
          },
          bold: params.bold ?? false,
          fillColor: {
            solidFillColor: {
              rgbColor: params.color ? hexToRgb(params.color) : { red: 0, green: 0, blue: 0 },
            },
          },
        },
        fields: 'fontSize,bold,fillColor',
      },
    },
  ];

  try {
    await retry.execute(
      () => batchUpdate(slidesClient, {
        presentationId: params.presentationId,
        requests,
      }),
      'add_text_box'
    );

    return { elementId };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Add a shape to a slide (T8)
 */
export async function add_shape(params: {
  presentationId: string;
  slideId: string;
  shapeType: string;
  x: number;
  y: number;
  width: number;
  height: number;
}): Promise<{ elementId: string }> {
  validatePresentationId(params.presentationId);
  validateObjectId(params.slideId);

  if (!params.shapeType || typeof params.shapeType !== 'string') {
    throw new Error('shapeType is required and must be a string');
  }

  if (typeof params.x !== 'number' || typeof params.y !== 'number') {
    throw new Error('x and y must be numbers');
  }

  if (typeof params.width !== 'number' || typeof params.height !== 'number') {
    throw new Error('width and height must be numbers');
  }

  const auth = await getAuthenticatedClient();
  const slidesClient = createSlidesClient({ auth });

  const elementId = crypto.randomUUID().slice(0, 50);

  try {
    await retry.execute(
      () => batchUpdate(slidesClient, {
        presentationId: params.presentationId,
        requests: [
          {
            createShape: {
              objectId: elementId,
              shapeType: params.shapeType as any,
              elementProperties: {
                pageObjectId: params.slideId,
                transform: {
                  scaleX: 1,
                  scaleY: 1,
                  translateX: params.x * EMU_PER_INCH,
                  translateY: params.y * EMU_PER_INCH,
                  unit: "EMU",
                },
              },
            },
          },
        ],
      }),
      'add_shape'
    );

    return { elementId };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { red: number; green: number; blue: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        red: parseInt(result[1], 16) / 255,
        green: parseInt(result[2], 16) / 255,
        blue: parseInt(result[3], 16) / 255,
      }
    : { red: 0, green: 0, blue: 0 };
}