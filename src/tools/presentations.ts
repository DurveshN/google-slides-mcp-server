/**
 * Presentations Tool - T6
 * MCP tools for managing Google Slides presentations
 */

import { createSlidesClient, createDriveClient } from '../google-client.js';
import type { ToolDefinition } from '../mcp/types.js';
import { getAuthenticatedClient } from '../auth.js';
import { validatePresentationId } from '../utils/validators.js';
import { withErrorHandling, normalizeError } from '../utils/errors.js';
import { Retry } from '../utils/retry.js';

const retry = new Retry({ maxRetries: 3 });

/**
 * Create a new presentation
 */
export async function createPresentationTool(args: Record<string, unknown>) {
  const { title } = args as { title: string };

  if (!title || typeof title !== 'string') {
    throw new Error('Title is required and must be a string');
  }

  const auth = await getAuthenticatedClient();
  const slidesClient = createSlidesClient({ auth });
  const driveClient = createDriveClient({ auth });

  try {
    const presentation = await retry.execute(
      () => slidesClient.presentations.create({ title }),
      'createPresentation'
    );

    return {
      presentationId: presentation.result.data.presentationId,
      title: presentation.result.data.title,
      url: `https://docs.google.com/presentation/d/${presentation.result.data.presentationId}`,
    };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Get a presentation by ID
 */
export async function getPresentationTool(args: Record<string, unknown>) {
  const { presentationId } = args as { presentationId: string };

  if (!presentationId || typeof presentationId !== 'string') {
    throw new Error('presentationId is required and must be a string');
  }

  validatePresentationId(presentationId);

  const auth = await getAuthenticatedClient();
  const slidesClient = createSlidesClient({ auth });

  try {
    const presentation = await retry.execute(
      () => slidesClient.presentations.get({ presentationId }),
      'getPresentation'
    );

    return presentation.result.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Copy an existing presentation
 */
export async function copyPresentationTool(args: Record<string, unknown>) {
  const { presentationId, newTitle } = args as {
    presentationId: string;
    newTitle: string;
  };

  if (!presentationId || typeof presentationId !== 'string') {
    throw new Error('presentationId is required and must be a string');
  }

  if (!newTitle || typeof newTitle !== 'string') {
    throw new Error('newTitle is required and must be a string');
  }

  validatePresentationId(presentationId);

  const auth = await getAuthenticatedClient();
  const driveClient = createDriveClient({ auth });

  try {
    const copied = await retry.execute(
      () => driveClient.files.copy({
        fileId: presentationId,
        name: newTitle,
      }),
      'copyPresentation'
    );

    return {
      newPresentationId: copied.result.data.id,
      title: copied.result.data.name,
      url: `https://docs.google.com/presentation/d/${copied.result.data.id}`,
    };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Delete a presentation
 */
export async function deletePresentationTool(args: Record<string, unknown>) {
  const { presentationId } = args as { presentationId: string };

  if (!presentationId || typeof presentationId !== 'string') {
    throw new Error('presentationId is required and must be a string');
  }

  validatePresentationId(presentationId);

  const auth = await getAuthenticatedClient();
  const driveClient = createDriveClient({ auth });

  try {
    await retry.execute(
      () => driveClient.files.delete({ fileId: presentationId }),
      'deletePresentation'
    );

    return { success: true, message: `Presentation ${presentationId} deleted` };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Presentations Tool Definition
 */
export const presentationsTool: ToolDefinition = {
  name: 'create_presentation',
  description: 'Create a new Google Slides presentation',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Title of the presentation',
      },
    },
    required: ['title'],
  },
  handler: withErrorHandling(createPresentationTool, 'create_presentation'),
};

export const getPresentationToolDef: ToolDefinition = {
  name: 'get_presentation',
  description: 'Get a presentation by ID',
  inputSchema: {
    type: 'object',
    properties: {
      presentationId: {
        type: 'string',
        description: 'ID of the presentation to retrieve',
      },
    },
    required: ['presentationId'],
  },
  handler: withErrorHandling(getPresentationTool, 'get_presentation'),
};

export const copyPresentationToolDef: ToolDefinition = {
  name: 'copy_presentation',
  description: 'Copy an existing presentation',
  inputSchema: {
    type: 'object',
    properties: {
      presentationId: {
        type: 'string',
        description: 'ID of the presentation to copy',
      },
      newTitle: {
        type: 'string',
        description: 'New title for the copied presentation',
      },
    },
    required: ['presentationId', 'newTitle'],
  },
  handler: withErrorHandling(copyPresentationTool, 'copy_presentation'),
};

export const deletePresentationToolDef: ToolDefinition = {
  name: 'delete_presentation',
  description: 'Delete a presentation',
  inputSchema: {
    type: 'object',
    properties: {
      presentationId: {
        type: 'string',
        description: 'ID of the presentation to delete',
      },
    },
    required: ['presentationId'],
  },
  handler: withErrorHandling(deletePresentationTool, 'delete_presentation'),
};