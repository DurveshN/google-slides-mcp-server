/**
 * Properties Tool - T12
 * MCP tools for managing Google Slides page properties and element transforms
 */

import { createSlidesClient } from '../google-client.js';
import type { ToolDefinition } from '../mcp/types.js';
import { validatePresentationId, validateObjectId } from '../utils/validators.js';
import { withErrorHandling, normalizeError } from '../utils/errors.js';
import { Retry } from '../utils/retry.js';

const retry = new Retry({ maxRetries: 3 });

const EMU_PER_INCH = 914400;

function inchesToEmu(inches: number): number {
  return Math.round(inches * EMU_PER_INCH);
}

/**
 * Update page properties (background color)
 */
export async function updatePagePropertiesTool(args: Record<string, unknown>) {
  const {
    presentationId,
    slideId,
    backgroundColor,
  } = args as {
    presentationId: string;
    slideId: string;
    backgroundColor?: string;
  };

  if (!presentationId || typeof presentationId !== 'string') {
    throw new Error('presentationId is required and must be a string');
  }

  if (!slideId || typeof slideId !== 'string') {
    throw new Error('slideId is required and must be a string');
  }

  validatePresentationId(presentationId);
  validateObjectId(slideId);

  const auth = await getAuth();
  const slidesClient = createSlidesClient({ auth });

  const request: any = {
    updatePageProperties: {
      objectId: slideId,
      fields: 'pageBackgroundFill',
      pageProperties: {
        pageBackgroundFill: {
          solidFill: {
            color: {
              rgbColor: {
                red: 0,
                green: 0,
                blue: 0,
              },
            },
          },
        },
      },
    },
  };

  if (backgroundColor && typeof backgroundColor === 'string') {
    const hex = backgroundColor.startsWith('#') ? backgroundColor.slice(1) : backgroundColor;
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    request.updatePageProperties.pageProperties.pageBackgroundFill = {
      solidFill: {
        color: {
          rgbColor: {
            red: r,
            green: g,
            blue: b,
          },
        },
      },
    };
  }

  try {
    const response = await retry.execute(
      () => slidesClient.presentations.batchUpdate({
        presentationId,
        requestBody: {
          requests: [request],
        },
      }),
      'updatePageProperties'
    );

    return response.result.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Update element transform (position, size, rotation)
 */
export async function updateElementTransformTool(args: Record<string, unknown>) {
  const {
    presentationId,
    elementId,
    x,
    y,
    width,
    height,
    rotation,
  } = args as {
    presentationId: string;
    elementId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  };

  if (!presentationId || typeof presentationId !== 'string') {
    throw new Error('presentationId is required and must be a string');
  }

  if (!elementId || typeof elementId !== 'string') {
    throw new Error('elementId is required and must be a string');
  }

  if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number') {
    throw new Error('x, y, width, and height must be numbers');
  }

  validatePresentationId(presentationId);
  validateObjectId(elementId);

  const auth = await getAuth();
  const slidesClient = createSlidesClient({ auth });

  const request: any = {
    updatePageElementTransform: {
      objectId: elementId,
      applyMode: "ABSOLUTE",
      transform: {
        scaleX: 1,
        scaleY: 1,
        translateX: inchesToEmu(x),
        translateY: inchesToEmu(y),
        unit: "EMU",
      },
    },
  };

  if (width > 0) {
    request.updatePageElementTransform.transform.scaleX = inchesToEmu(width);
  }

  if (height > 0) {
    request.updatePageElementTransform.transform.scaleY = inchesToEmu(height);
  }

  try {
    const response = await retry.execute(
      () => slidesClient.presentations.batchUpdate({
        presentationId,
        requestBody: {
          requests: [request],
        },
      }),
      'updateElementTransform'
    );

    return response.result.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Get authentication client
 */
async function getAuth() {
  const { getAuthenticatedClient } = await import('../auth.js');
  return getAuthenticatedClient();
}

/**
 * Properties Tool Definitions
 */
export const updatePagePropertiesToolDef: ToolDefinition = {
  name: 'update_page_properties',
  description: `Update a slide's background color by setting the \`pageBackgroundFill\` property. Replaces any existing background fill with a solid color.

• Provide color as hex (e.g., \`"#FF0000"\` or \`"FF0000"\`)
• Light backgrounds: \`#ffffff\`, \`#f8f9fa\` — use dark text (\`#202124\`) for contrast
• Dark backgrounds: \`#202124\`, \`#1a1a2e\` — use light text (\`#ffffff\`, \`#e8eaed\`)
• Accent options: \`#e8f0fe\` (blue), \`#fce8e6\` (red), \`#e6f4ea\` (green)
• Always ensure text contrast ratio is strong for readability`,
  inputSchema: {
    type: 'object',
    properties: {
      presentationId: {
        type: 'string',
        description: 'ID of the presentation',
      },
      slideId: {
        type: 'string',
        description: 'ID of the slide to update',
      },
      backgroundColor: {
        type: 'string',
        description: 'Background color in hex format (e.g., "#FF0000" or "FF0000")',
      },
    },
    required: ['presentationId', 'slideId'],
  },
  handler: withErrorHandling(updatePagePropertiesTool, 'update_page_properties'),
};

export const updateElementTransformToolDef: ToolDefinition = {
  name: 'update_element_transform',
  description: `Move, resize, or rotate a page element using an **ABSOLUTE** affine transform. This replaces the element's entire transform matrix — omitted values reset to zero.

• \`x\`, \`y\`: Position of the element's **upper-left corner** in inches from the page origin
• \`width\`, \`height\`: Size in inches. The tool converts these to EMU units internally
• \`rotation\`: Angle in degrees (0-360). Positive = clockwise
• Use for fine-tuning alignment after creating elements
• Keep elements within slide bounds (10 x 5.625 inches)
• Tables do not support scaling transforms — use table row/column properties instead`,
  inputSchema: {
    type: 'object',
    properties: {
      presentationId: {
        type: 'string',
        description: 'ID of the presentation',
      },
      elementId: {
        type: 'string',
        description: 'ID of the element to update',
      },
      x: {
        type: 'number',
        description: 'X position in inches',
      },
      y: {
        type: 'number',
        description: 'Y position in inches',
      },
      width: {
        type: 'number',
        description: 'Width in inches',
      },
      height: {
        type: 'number',
        description: 'Height in inches',
      },
      rotation: {
        type: 'number',
        description: 'Rotation angle in degrees',
      },
    },
    required: ['presentationId', 'elementId', 'x', 'y', 'width', 'height'],
  },
  handler: withErrorHandling(updateElementTransformTool, 'update_element_transform'),
};