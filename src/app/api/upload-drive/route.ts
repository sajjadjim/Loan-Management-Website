import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { member_no, name, files } = body;

    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;

    // Option 1: Forward request to Google Apps Script Web App (Primary for personal Drive)
    if (scriptUrl && scriptUrl.startsWith('http')) {
      try {
        const gasRes = await fetch(scriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            member_no: member_no || 'Unknown',
            name: name || 'Member',
            files: Array.isArray(files) ? files : [],
          }),
          redirect: 'follow',
        });

        if (gasRes.ok) {
          const gasJson = await gasRes.json();
          if (gasJson.success) {
            return NextResponse.json({
              success: true,
              folder_url: gasJson.folder_url || '',
              urls: gasJson.urls || {},
            });
          }
        }
      } catch (gasErr) {
        console.error('Google Apps Script proxy error in Next.js API route:', gasErr);
      }
    }

    // Option 2: Fallback to Google Drive Service Account API if credentials configured
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1NnSLLkd-plY13jynoj2O2Z-J7itnoE1V';

    if (clientEmail && privateKey) {
      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });

      const drive = google.drive({ version: 'v3', auth });

      const cleanName = (name || 'Member').replace(/[^\w\s\u0980-\u09FF-]/gi, '').trim();
      const folderName = `Member_${member_no || 'Unknown'}_${cleanName}`;

      let folderId: string | null = null;
      let folderUrl: string = '';

      let q = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
      if (parentFolderId) {
        q += ` and '${parentFolderId}' in parents`;
      }

      const searchRes = await drive.files.list({ q, fields: 'files(id, webViewLink)' });
      if (searchRes.data.files && searchRes.data.files.length > 0) {
        folderId = searchRes.data.files[0].id!;
        folderUrl = searchRes.data.files[0].webViewLink || `https://drive.google.com/drive/folders/${folderId}`;
      } else {
        const fileMetadata: any = {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        };
        if (parentFolderId) {
          fileMetadata.parents = [parentFolderId];
        }

        const createRes = await drive.files.create({
          requestBody: fileMetadata,
          fields: 'id, webViewLink',
        });

        folderId = createRes.data.id!;
        folderUrl = createRes.data.webViewLink || `https://drive.google.com/drive/folders/${folderId}`;

        await drive.permissions.create({
          fileId: folderId,
          requestBody: { role: 'reader', type: 'anyone' },
        });
      }

      const uploadedUrls: Record<string, string> = {};

      if (Array.isArray(files) && folderId) {
        for (const item of files) {
          if (!item.base64 || !item.key) continue;

          const base64Clean = item.base64.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Clean, 'base64');
          const stream = Readable.from(buffer);
          const fileName = item.fileName || `${item.key}.jpg`;
          const mimeType = item.mimeType || 'image/jpeg';

          const fileRes = await drive.files.create({
            requestBody: {
              name: fileName,
              parents: [folderId],
            },
            media: {
              mimeType: mimeType,
              body: stream,
            },
            fields: 'id, webViewLink',
          });

          const fileId = fileRes.data.id!;
          await drive.permissions.create({
            fileId: fileId,
            requestBody: { role: 'reader', type: 'anyone' },
          });

          uploadedUrls[item.key] = `https://lh3.googleusercontent.com/d/${fileId}`;
        }
      }

      return NextResponse.json({
        success: true,
        folder_url: folderUrl,
        urls: uploadedUrls,
      });
    }

    return NextResponse.json(
      { success: false, error: 'No Google Drive connection configured.' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Google Drive Upload Route Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to upload to Google Drive' },
      { status: 500 }
    );
  }
}
