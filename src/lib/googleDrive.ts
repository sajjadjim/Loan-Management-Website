/**
 * Google Drive Upload Client Utility
 * Integrates Google Drive folder creation and image storage.
 */

export interface ImageUploadItem {
  key: 'photo_url' | 'nid_front_url' | 'nid_back_url' | 'guarantor_photo_url' | 'guarantor_nid_front_url' | 'guarantor_nid_back_url';
  base64: string;
  fileName?: string;
}

export interface GoogleDriveUploadResult {
  folder_url: string;
  urls: {
    photo_url?: string;
    nid_front_url?: string;
    nid_back_url?: string;
    guarantor_photo_url?: string;
    guarantor_nid_front_url?: string;
    guarantor_nid_back_url?: string;
  };
  isDriveConfigured: boolean;
}

export async function uploadMemberImagesToDrive(
  memberNo: string,
  memberName: string,
  imageItems: ImageUploadItem[]
): Promise<GoogleDriveUploadResult> {
  const validItems = (imageItems || []).filter(
    (i) => i.base64 && i.base64.startsWith('data:image/')
  );

  const payloadFiles = validItems.map((item) => ({
    key: item.key,
    fileName: `${memberNo}_${item.key}.jpg`,
    mimeType: 'image/jpeg',
    base64: item.base64,
  }));

  // 1. Try server-side proxy route /api/upload-drive first
  try {
    const res = await fetch('/api/upload-drive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        member_no: memberNo,
        name: memberName,
        files: payloadFiles,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return {
          folder_url: json.folder_url || '',
          urls: json.urls || {},
          isDriveConfigured: true,
        };
      }
    }
  } catch (err) {
    console.warn('Next.js API route /api/upload-drive proxy failed, trying direct client fetch...', err);
  }

  // 2. Direct client-side fetch fallback to Google Apps Script URL if available
  const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL?.trim();
  if (scriptUrl) {
    try {
      const res = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          member_no: memberNo,
          name: memberName,
          files: payloadFiles,
        }),
      });

      const json = await res.json();
      if (json.success) {
        return {
          folder_url: json.folder_url || '',
          urls: json.urls || {},
          isDriveConfigured: true,
        };
      }
    } catch (err) {
      console.warn('Direct client Google Apps Script upload fallback failed', err);
    }
  }

  // Fallback if Google Drive is unconfigured: Return original Data URLs
  const fallbackUrls: Record<string, string> = {};
  validItems.forEach((item) => {
    fallbackUrls[item.key] = item.base64;
  });

  return {
    folder_url: '',
    urls: fallbackUrls,
    isDriveConfigured: false,
  };
}
