/**
 * Utility to resize & optimize image files up to ~500KB - 2000KB (2MB) target size
 * for high-resolution document and photo storage on Google Drive.
 */
export async function compressImage(
  file: File,
  maxKB: number = 2000,
  maxDimension: number = 2400
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Proportional resize if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(event.target?.result as string);
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // High quality initial JPEG export (0.92 quality)
        let quality = 0.92;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Iteratively adjust JPEG quality and dimensions until size <= maxKB
        while (dataUrl.length * 0.75 > maxKB * 1024 && quality > 0.3) {
          quality -= 0.05;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // If quality reduced to minimum and still exceeds maxKB, resize dimensions
        if (dataUrl.length * 0.75 > maxKB * 1024) {
          const scaledCanvas = document.createElement('canvas');
          scaledCanvas.width = Math.round(width * 0.75);
          scaledCanvas.height = Math.round(height * 0.75);
          const scaledCtx = scaledCanvas.getContext('2d');
          if (scaledCtx) {
            scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
            dataUrl = scaledCanvas.toDataURL('image/jpeg', 0.75);
          }
        }

        resolve(dataUrl);
      };

      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Compress raw Data URL (e.g. from WebCam Canvas capture)
 */
export async function compressDataUrl(
  dataUrl: string,
  maxKB: number = 2000,
  maxDimension: number = 2400
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.85;
      let compressed = canvas.toDataURL('image/jpeg', quality);

      while (compressed.length * 0.75 > maxKB * 1024 && quality > 0.3) {
        quality -= 0.05;
        compressed = canvas.toDataURL('image/jpeg', quality);
      }

      if (compressed.length * 0.75 > maxKB * 1024) {
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = Math.round(width * 0.75);
        scaledCanvas.height = Math.round(height * 0.75);
        const scaledCtx = scaledCanvas.getContext('2d');
        if (scaledCtx) {
          scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
          compressed = scaledCanvas.toDataURL('image/jpeg', 0.75);
        }
      }

      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Calculates human-readable KB size of a Base64 Data URL string
 */
export function getBase64SizeKB(dataUrl: string): number {
  if (!dataUrl) return 0;
  const stringLength = dataUrl.length - (dataUrl.indexOf(',') + 1);
  return Math.round((stringLength * 0.75) / 1024);
}
