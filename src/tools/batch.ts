/**
 * Batch Tool - T15
 * MCP tool for atomic batch updates to Google Slides presentations
 */

import { createSlidesClient } from '../google-client.js';
import type { ToolDefinition } from '../mcp/types.js';
import { validatePresentationId } from '../utils/validators.js';
import { withErrorHandling, normalizeError } from '../utils/errors.js';
import { Retry } from '../utils/retry.js';

const retry = new Retry({ maxRetries: 3 });

/**
 * Batch update multiple requests atomically
 */
export async function batchUpdateTool(args: Record<string, unknown>) {
  const {
    presentationId,
    requests,
  } = args as {
    presentationId: string;
    requests: Array<Record<string, unknown>>;
  };

  if (!presentationId || typeof presentationId !== 'string') {
    throw new Error('presentationId is required and must be a string');
  }

  validatePresentationId(presentationId);

  if (!Array.isArray(requests) || requests.length === 0) {
    throw new Error('requests is required and must be a non-empty array');
  }

  const auth = await getAuth();
  const slidesClient = createSlidesClient({ auth });

  try {
    const response = await retry.execute(
      () => slidesClient.presentations.batchUpdate({
        presentationId,
        requestBody: {
          requests,
        },
      }),
      'batchUpdate'
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
 * Batch Tool Definition
 */
export const batchUpdateToolDef: ToolDefinition = {
  name: 'batch_update',
  description: `Execute multiple Slides API requests atomically in a single call.

• All requests succeed together or all fail together (atomic transaction).
• Reduces network round trips compared to multiple individual tool calls.
• Best for: creating a slide with multiple elements, applying formatting to several objects, or building complex layouts.
• Subrequests execute in order and can reference results from earlier requests.
• Use individual tools for simple, single-step operations instead.`,
  inputSchema: {
    type: 'object',
    properties: {
      presentationId: {
        type: 'string',
        description: 'ID of the presentation to update',
      },
      requests: {
        type: 'array',
        description: 'Array of Google Slides API requests',
        items: {
          type: 'object',
          description: 'Individual request object',
        },
      },
    },
    required: ['presentationId', 'requests'],
  },
  handler: withErrorHandling(batchUpdateTool, 'batch_update'),
};