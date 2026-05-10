/**
 * Slides Tool - T7
 * MCP tools for managing slides within presentations
 */

import { createSlidesClient } from '../google-client.js';
import type { ToolDefinition } from '../mcp/types.js';
import { getAuthenticatedClient } from '../auth.js';
import { validatePresentationId, validateObjectId } from '../utils/validators.js';
import { withErrorHandling, normalizeError } from '../utils/errors.js';
import { Retry } from '../utils/retry.js';

const retry = new Retry({ maxRetries: 3 });

/**
 * Create a new slide
 */
export async function createSlideTool(args: Record<string, unknown>) {
  const {
    presentationId,
    layout,
    insertionIndex,
  } = args as {
    presentationId: string;
    layout?: string;
    insertionIndex?: number;
  };

  if (!presentationId || typeof presentationId !== 'string') {
    throw new Error('presentationId is required and must be a string');
  }

  validatePresentationId(presentationId);

  const auth = await getAuthenticatedClient();
  const slidesClient = createSlidesClient({ auth });

  const slideId = crypto.randomUUID().slice(0, 50);

  const requests = [
    {
      createSlide: {
        objectId: slideId,
        insertionIndex: insertionIndex ?? 0,
        slideLayoutReference: layout
          ? {
              predefinedLayout: layout as any,
            }
          : undefined,
      },
    },
  ];

  try {
    await retry.execute(
      () => slidesClient.presentations.batchUpdate({
        presentationId,
        requestBody: { requests },
      }),
      'createSlide'
    );

    return { slideId };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Delete a slide
 */
export async function deleteSlideTool(args: Record<string, unknown>) {
  const {
    presentationId,
    slideId,
    newIndex,
  } = args as {
    presentationId: string;
    slideId: string;
    newIndex?: number;
  };

  if (!presentationId || typeof presentationId !== 'string') {
    throw new Error('presentationId is required and must be a string');
  }

  if (!slideId || typeof slideId !== 'string') {
    throw new Error('slideId is required and must be a string');
  }

  validatePresentationId(presentationId);
  validateObjectId(slideId);

  const auth = await getAuthenticatedClient();
  const slidesClient = createSlidesClient({ auth });

  try {
    await retry.execute(
      () => slidesClient.presentations.batchUpdate({
        presentationId,
        requestBody: {
          requests: [
            {
              deleteObject: {
                objectId: slideId,
              },
            },
          ],
        },
      }),
      'deleteSlide'
    );

    return { success: true, message: `Slide ${slideId} deleted` };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Reorder slides
 */
export async function reorderSlidesTool(args: Record<string, unknown>) {
  const { presentationId, slideId, newIndex } = args as {
    presentationId: string;
    slideId: string;
    newIndex: number;
  };

  if (!presentationId || typeof presentationId !== 'string') {
    throw new Error('presentationId is required and must be a string');
  }

  if (!slideId || typeof slideId !== 'string') {
    throw new Error('slideId is required and must be a string');
  }

  if (typeof newIndex !== 'number') {
    throw new Error('newIndex is required and must be a number');
  }

  validatePresentationId(presentationId);
  validateObjectId(slideId);

  const auth = await getAuthenticatedClient();
  const slidesClient = createSlidesClient({ auth });

  try {
    await retry.execute(
      () => slidesClient.presentations.batchUpdate({
        presentationId,
        requestBody: {
          requests: [
            {
              updateSlidesPosition: {
                slideObjectIds: [slideId],
                insertionIndex: newIndex,
              },
            },
          ],
        },
      }),
      'reorderSlides'
    );

    return { success: true, message: `Slide ${slideId} reordered to position ${newIndex}` };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Slides Tool Definitions
 */
export const createSlideToolDef: ToolDefinition = {
  name: 'create_slide',
  description: 'Create a new slide in a presentation',
  inputSchema: {
    type: 'object',
    properties: {
      presentationId: {
        type: 'string',
        description: 'ID of the presentation',
      },
      layout: {
        type: 'string',
        description: 'Layout to use (e.g., "TITLE_SLIDE", "BLANK")',
      },
      insertionIndex: {
        type: 'number',
        description: 'Position to insert the slide',
      },
    },
    required: ['presentationId'],
  },
  handler: withErrorHandling(createSlideTool, 'create_slide'),
};

export const deleteSlideToolDef: ToolDefinition = {
  name: 'delete_slide',
  description: `Remove a slide from a presentation by its slide ID.

**Use this for:**
• Cleaning up unwanted, empty, or duplicate slides.
• Reorganizing content by removing slides that no longer fit the narrative flow.
• Removing placeholder slides after restructuring a presentation.

**Parameters:**
• \`presentationId\` (required) — ID of the presentation.
• \`slideId\` (required) — ID of the slide to delete.

> **Warning:** This action is permanent. The slide and all its content are immediately removed.`,
  inputSchema: {
    type: 'object',
    properties: {
      presentationId: {
        type: 'string',
        description: 'ID of the presentation',
      },
      slideId: {
        type: 'string',
        description: 'ID of the slide to delete',
      },
    },
    required: ['presentationId', 'slideId'],
  },
  handler: withErrorHandling(deleteSlideTool, 'delete_slide'),
};

export const reorderSlidesToolDef: ToolDefinition = {
  name: 'reorder_slides',
  description: `Move a slide to a new position in the presentation sequence.

**Use this for:**
• Adjusting narrative flow — move key points earlier or later.
• Reorganizing sections — group related slides together.
• Fixing slide order after inserting new content.

**Parameters:**
• \`presentationId\` (required) — ID of the presentation.
• \`slideId\` (required) — ID of the slide to move.
• \`newIndex\` (required) — Zero-based target position. \`0\` = first slide, \`1\` = second slide, etc.

> **Note:** \`newIndex\` is 0-based. The slide is inserted *before* the slide currently at that index.`,
  inputSchema: {
    type: 'object',
    properties: {
      presentationId: {
        type: 'string',
        description: 'ID of the presentation',
      },
      slideId: {
        type: 'string',
        description: 'ID of the slide to reorder',
      },
      newIndex: {
        type: 'number',
        description: 'New position for the slide',
      },
    },
    required: ['presentationId', 'slideId', 'newIndex'],
  },
  handler: withErrorHandling(reorderSlidesTool, 'reorder_slides'),
};