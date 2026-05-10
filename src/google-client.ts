import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

export interface GetPresentationParams {
  presentationId: string;
}

export interface CreatePresentationParams {
  title: string;
}

export interface BatchUpdateParams {
  presentationId: string;
  requests: any[];
}

export interface CopyFileParams {
  fileId: string;
  resource: {
    name: string;
  };
}

export interface ListFilesParams {
  q?: string;
  pageSize?: number;
}

export interface ExportFileParams {
  fileId: string;
  mimeType: string;
}

export interface UpdatePermissionsParams {
  fileId: string;
  resource: {
    emailAddress: string;
    role: 'reader' | 'writer' | 'commenter';
    type: 'user';
  };
}

export interface CreateSlidesClientParams {
  auth: OAuth2Client;
}

export interface CreateDriveClientParams {
  auth: OAuth2Client;
}

export interface SlidesClient {
  presentations: {
    get: (params: any) => Promise<any>;
    create: (params: any) => Promise<any>;
    batchUpdate: (params: any) => Promise<any>;
  };
}

export interface DriveClient {
  files: {
    copy: (params: any) => Promise<any>;
    list: (params: any) => Promise<any>;
    export: (params: any) => Promise<any>;
    delete: (params: any) => Promise<any>;
    create: (params: any) => Promise<any>;
    get: (params: any) => Promise<any>;
  };
  permissions: {
    create: (params: any) => Promise<any>;
  };
}

export function createSlidesClient({ auth }: CreateSlidesClientParams): SlidesClient {
  return google.slides({ version: 'v1', auth });
}

export function createDriveClient({ auth }: CreateDriveClientParams): DriveClient {
  return google.drive({ version: 'v3', auth });
}

export async function getPresentation(slidesClient: SlidesClient, params: GetPresentationParams): Promise<any> {
  return slidesClient.presentations.get({ presentationId: params.presentationId });
}

export async function createPresentation(slidesClient: SlidesClient, params: CreatePresentationParams): Promise<any> {
  return slidesClient.presentations.create({ title: params.title });
}

export async function batchUpdate(slidesClient: SlidesClient, params: BatchUpdateParams): Promise<any> {
    console.error(`[batchUpdate] Starting batchUpdate for presentation: ${params.presentationId}, requests: ${params.requests.length}`);
    try {
      const result = await slidesClient.presentations.batchUpdate({
        presentationId: params.presentationId,
        requestBody: {
          requests: params.requests
        }
      });
      console.error(`[batchUpdate] batchUpdate completed successfully`);
      return result;
    } catch (error) {
      console.error(`[batchUpdate] Error during batchUpdate:`, error);
      throw error;
    }
  }

export async function copyFile(driveClient: DriveClient, params: CopyFileParams): Promise<any> {
  return driveClient.files.copy({
    fileId: params.fileId,
    ...params.resource
  });
}

export async function listFiles(driveClient: DriveClient, params: ListFilesParams = {}): Promise<any> {
  return driveClient.files.list({
    ...params
  });
}

export async function exportFile(driveClient: DriveClient, params: ExportFileParams): Promise<any> {
  return driveClient.files.export({
    fileId: params.fileId,
    mimeType: params.mimeType
  });
}

export async function updatePermissions(driveClient: DriveClient, params: UpdatePermissionsParams): Promise<any> {
  return driveClient.permissions.create({
    fileId: params.fileId,
    ...params.resource
  });
}