import { google } from "googleapis";
import { Readable } from "stream";

// Scope for Google Drive API
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

function getDriveClient() {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    console.warn("Google Drive API credentials not configured in environment variables.");
    return null;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  });

  return google.drive({ version: "v3", auth });
}

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  webViewLink?: string;
  webContentLink?: string;
}

/**
 * Upload a customer security document / NID image to Google Drive
 */
export async function uploadDocumentToGoogleDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string
): Promise<DriveUploadResult> {
  const drive = getDriveClient();
  const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!drive) {
    // Fallback stub for development/testing when Drive credentials are pending
    const mockFileId = `DRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return {
      fileId: mockFileId,
      fileName,
      webViewLink: `https://drive.google.com/file/d/${mockFileId}/view`,
    };
  }

  const bufferStream = new Readable();
  bufferStream.push(fileBuffer);
  bufferStream.push(null);

  const fileMetadata: any = {
    name: fileName,
    parents: targetFolderId ? [targetFolderId] : undefined,
  };

  const media = {
    mimeType,
    body: bufferStream,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, name, webViewLink, webContentLink",
  });

  return {
    fileId: response.data.id || "",
    fileName: response.data.name || fileName,
    webViewLink: response.data.webViewLink || undefined,
    webContentLink: response.data.webContentLink || undefined,
  };
}

/**
 * Delete a document from Google Drive by File ID
 */
export async function deleteDocumentFromGoogleDrive(fileId: string): Promise<boolean> {
  const drive = getDriveClient();
  if (!drive) return true;

  try {
    await drive.files.delete({ fileId });
    return true;
  } catch (error) {
    console.error("Error deleting file from Google Drive:", error);
    return false;
  }
}
