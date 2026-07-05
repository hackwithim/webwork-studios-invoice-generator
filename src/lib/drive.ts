import { google } from "googleapis";
import { Readable } from "stream";

import prisma from "@/lib/prisma";

// Base folder for all documents (Shared Drive ID)
const ROOT_FOLDER_ID = "0AIK4RfhH8cQZUk9PVA";

async function getDriveClient() {
  const company = await prisma.company.findFirst();
  const credentialsJson = company?.googleDriveKey || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (!credentialsJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set in environment variables and no key was uploaded in settings.");
  }

  const credentials = JSON.parse(credentialsJson);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

export async function ensureFolderExists(folderName: string): Promise<string> {
  const drive = await getDriveClient();

  // Search for the folder inside the root folder
  const response = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${ROOT_FOLDER_ID}' in parents and trashed=false`,
    fields: "files(id, name)",
    spaces: "drive",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  // Create it if it doesn't exist
  const folderMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [ROOT_FOLDER_ID],
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: "id",
    supportsAllDrives: true,
  });

  return folder.data.id!;
}

export async function uploadFileToDrive(
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
) {
  const drive = await getDriveClient();
  
  // Convert buffer to readable stream for googleapis
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: mimeType,
    body: stream,
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  return file.data;
}

export async function deleteFileFromDrive(fileId: string) {
  const drive = await getDriveClient();
  try {
    await drive.files.delete({ 
      fileId,
      supportsAllDrives: true,
    });
    return true;
  } catch (error: any) {
    console.error("Failed to delete file from drive:", error);
    // Ignore 404 errors (file already deleted)
    if (error.code === 404) return true;
    throw error;
  }
}

export async function findFileInFolderByName(folderId: string, fileName: string): Promise<string | null> {
  const drive = await getDriveClient();
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
      fields: "files(id)",
      spaces: "drive",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id || null;
    }
  } catch (e) {
    console.error(`Failed to find file by name ${fileName}:`, e);
  }
  return null;
}

export async function moveFileToFolder(fileId: string, newFolderId: string) {
  const drive = await getDriveClient();
  try {
    const file = await drive.files.get({
      fileId,
      fields: "parents",
      supportsAllDrives: true,
    });
    const previousParents = file.data.parents?.join(",") || "";
    await drive.files.update({
      fileId,
      addParents: newFolderId,
      removeParents: previousParents,
      fields: "id, parents",
      supportsAllDrives: true,
    });
    return true;
  } catch (error: any) {
    console.error("Failed to move file:", error);
    if (error.code === 404) {
       // File doesn't exist on drive
       return false;
    }
    return false;
  }
}

export async function updateFileInDrive(
  fileId: string,
  mimeType: string,
  buffer: Buffer
) {
  const drive = await getDriveClient();
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const media = {
    mimeType: mimeType,
    body: stream,
  };

  const file = await drive.files.update({
    fileId,
    media: media,
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  return file.data;
}

export async function verifyFilesExist(fileIds: string[]): Promise<Set<string>> {
  if (fileIds.length === 0) return new Set();
  
  const drive = await getDriveClient();
  const foundIds = new Set<string>();

  // Google Drive API query limit is usually around 500-2000 chars, chunk to 30 items per query just to be safe
  const chunkSize = 30;
  for (let i = 0; i < fileIds.length; i += chunkSize) {
    const chunk = fileIds.slice(i, i + chunkSize);
    const query = chunk.map(id => `'${id}' in parents or id='${id}'`).join(' or ');
    
    try {
      const response = await drive.files.list({
        q: `(${query}) and trashed=false`,
        fields: "files(id)",
        spaces: "drive",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (response.data.files) {
        response.data.files.forEach(f => {
          if (f.id) foundIds.add(f.id);
        });
      }
    } catch (e) {
      console.error("Error verifying chunk of drive files:", e);
    }
  }

  return foundIds;
}
