/**
 * Drive Tool - T13-T14
 * MCP tools for managing Google Drive operations
 */

import { createDriveClient } from '../google-client.js';
import type { ToolDefinition } from '../mcp/types.js';
import { validatePresentationId } from '../utils/validators.js';
import { withErrorHandling, normalizeError } from '../utils/errors.js';
import { Retry } from '../utils/retry.js';

const retry = new Retry({ maxRetries: 3 });

/**
 * List all presentations in Drive
 */
export async function listPresentationsTool(args: Record<string, unknown>) {
  const { query, pageSize } = args as {
    query?: string;
    pageSize?: number;
  };

  const auth = await getAuth();
  const driveClient = createDriveClient({ auth });

  const params: any = {
    q: "mimeType='application/vnd.google-apps.presentation'",
    fields: 'files(id, name, modifiedTime)',
  };

  if (query && typeof query === 'string') {
    params.q += ` and name contains '${query}'`;
  }

  if (pageSize && typeof pageSize === 'number' && pageSize > 0) {
    params.pageSize = pageSize;
  }

  try {
    const response = await retry.execute(
      () => driveClient.files.list(params),
      'listPresentations'
    );

    const presentations = response.result.data.files?.map((file: any) => ({
      id: file.id,
      name: file.name,
      modifiedTime: file.modifiedTime,
    })) || [];

    return {
      presentations,
      nextPageToken: response.result.data.nextPageToken,
    };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Export presentation to PDF
 */
export async function exportPresentationTool(args: Record<string, unknown>) {
  const {
    presentationId,
    mimeType = 'application/pdf',
  } = args as {
    presentationId: string;
    mimeType?: string;
  };

  if (!presentationId || typeof presentationId !== 'string') {
    throw new Error('presentationId is required and must be a string');
  }

  validatePresentationId(presentationId);

  if (!mimeType || typeof mimeType !== 'string') {
    throw new Error('mimeType is required and must be a string');
  }

  if (mimeType !== 'application/pdf') {
    throw new Error('Only PDF export is supported');
  }

  const auth = await getAuth();
  const driveClient = createDriveClient({ auth });

  try {
    const response = await retry.execute(
      () => driveClient.files.export({
        fileId: presentationId,
        mimeType,
      }),
      'exportPresentation'
    );

    return {
      content: response.result.data,
      mimeType,
      presentationId,
    };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Update sharing permissions
 */
export async function updatePermissionsTool(args: Record<string, unknown>) {
  const {
    presentationId,
    email,
    role,
  } = args as {
    presentationId: string;
    email: string;
    role: 'reader' | 'writer' | 'commenter';
  };

  if (!presentationId || typeof presentationId !== 'string') {
    throw new Error('presentationId is required and must be a string');
  }

  validatePresentationId(presentationId);

  if (!email || typeof email !== 'string') {
    throw new Error('email is required and must be a string');
  }

  if (!role || !['reader', 'writer', 'commenter'].includes(role)) {
    throw new Error('role must be one of: reader, writer, commenter');
  }

  const auth = await getAuth();
  const driveClient = createDriveClient({ auth });

  try {
    const response = await retry.execute(
      () => driveClient.permissions.create({
        fileId: presentationId,
        resource: {
          type: 'user',
          role: role,
          emailAddress: email,
        },
        fields: 'id',
      }),
      'updatePermissions'
    );

    return {
      permissionId: response.result.data.id,
      email,
      role,
      presentationId,
    };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Delete a presentation
 */
export async function deletePresentationTool(args: Record<string, unknown>) {
  const { presentationId } = args as {
    presentationId: string;
  };

  if (!presentationId || typeof presentationId !== 'string') {
    throw new Error('presentationId is required and must be a string');
  }

  validatePresentationId(presentationId);

  const auth = await getAuth();
  const driveClient = createDriveClient({ auth });

  try {
    await retry.execute(
      () => driveClient.files.delete({
        fileId: presentationId,
      }),
      'deletePresentation'
    );

    return {
      success: true,
      message: `Presentation ${presentationId} deleted`,
    };
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
 * Drive Tool Definitions
 */
export const listPresentationsToolDef: ToolDefinition = {
  name: 'list_presentations',
  description: `List Google Slides presentations from Drive, optionally filtering by name.

• Use \`query\` to search for specific deck titles or keywords.
• Check if a presentation already exists before creating duplicates.
• Returns presentation IDs, names, and last modified times.
• Use \`pageSize\` to limit results when browsing large Drive libraries.`,
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Optional query to filter presentations by name',
      },
      pageSize: {
        type: 'number',
        description: 'Optional page size limit',
      },
    },
  },
  handler: withErrorHandling(listPresentationsTool, 'list_presentations'),
};

export const exportPresentationToolDef: ToolDefinition = {
  name: 'export_presentation',
  description: `Export a presentation as a PDF for sharing or offline use.

• Generates a downloadable PDF from any Google Slides deck.
• Ideal for distributing handouts, archiving final versions, or sharing with non-Google users.
• Only \`application/pdf\` export is supported.
• Returns the file content and MIME type.`,
  inputSchema: {
    type: 'object',
    properties: {
      presentationId: {
        type: 'string',
        description: 'ID of the presentation to export',
      },
      mimeType: {
        type: 'string',
        description: 'MIME type (default: application/pdf)',
      },
    },
    required: ['presentationId'],
  },
  handler: withErrorHandling(exportPresentationTool, 'export_presentation'),
};

export const updatePermissionsToolDef: ToolDefinition = {
  name: 'update_permissions',
  description: `Share a presentation with a specific user by email address.

• \`reader\`: View-only access (good for distribution and read-only sharing).
• \`writer\`: Full edit access (for co-authors and collaborators).
• \`commenter\`: Can view and leave feedback without editing.
• Use to grant access after creating or updating a deck.
• Requires the recipient's email address.`,
  inputSchema: {
    type: 'object',
    properties: {
      presentationId: {
        type: 'string',
        description: 'ID of the presentation',
      },
      email: {
        type: 'string',
        description: 'Email address of the user',
      },
      role: {
        type: 'string',
        enum: ['reader', 'writer', 'commenter'],
        description: 'Permission role',
      },
    },
    required: ['presentationId', 'email', 'role'],
  },
  handler: withErrorHandling(updatePermissionsTool, 'update_permissions'),
};

export const deletePresentationToolDef: ToolDefinition = {
  name: 'delete_presentation',
  description: `Permanently delete a presentation from Google Drive. This action cannot be undone.

• Use to clean up temporary drafts, duplicates, or outdated decks.
• The presentation ID is removed from Drive immediately.
• No recovery option through this tool.`,
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