/**
 * Image Utilities for San Rafael Tenis Club Hockey App
 * Handles validation, parsing, resizing and progressive jpeg compression.
 */

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

export const MAX_INPUT_FILE_BYTES = 8 * 1024 * 1024; // 8MB
export const MAX_OUTPUT_BASE64_CHARS = 280000;

export interface ImageCompressionOptions {
  maxDimension: number;
  quality: number;
}

export const IMAGE_PRESETS: Record<'avatar' | 'logo' | 'gallery', ImageCompressionOptions> = {
  avatar: { maxDimension: 200, quality: 0.75 },
  logo: { maxDimension: 256, quality: 0.85 },
  gallery: { maxDimension: 800, quality: 0.75 },
};

export function validateImageFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new ImageValidationError('El archivo seleccionado no es una imagen válida.');
  }
  if (file.size > MAX_INPUT_FILE_BYTES) {
    throw new ImageValidationError('La imagen excede el tamaño máximo permitido de 8MB.');
  }
}

export function processImageFile(
  file: File,
  options: ImageCompressionOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      validateImageFile(file);
    } catch (err) {
      reject(err);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al cargar la imagen.'));
      img.onload = () => {
        try {
          const result = compressImage(img, options.maxDimension, options.quality);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function compressImage(img: HTMLImageElement, maxDim: number, initialQuality: number): string {
  let width = img.width;
  let height = img.height;

  // Adjust dimensions
  if (width > height) {
    if (width > maxDim) {
      height = Math.round(height * (maxDim / width));
      width = maxDim;
    }
  } else {
    if (height > maxDim) {
      width = Math.round(width * (maxDim / height));
      height = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto de canvas.');
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  let quality = initialQuality;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);

  // Progressive compression if base64 size exceeds limits
  while (dataUrl.length > MAX_OUTPUT_BASE64_CHARS && quality > 0.3) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  // Last resort: progressively halve the dimensions
  if (dataUrl.length > MAX_OUTPUT_BASE64_CHARS) {
    let scale = 0.50;
    const miniCanvas = document.createElement('canvas');
    const miniCtx = miniCanvas.getContext('2d');
    if (miniCtx) {
      while (dataUrl.length > MAX_OUTPUT_BASE64_CHARS && scale > 0.1) {
        miniCanvas.width = Math.max(1, Math.round(width * scale));
        miniCanvas.height = Math.max(1, Math.round(height * scale));
        miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
        miniCtx.drawImage(img, 0, 0, miniCanvas.width, miniCanvas.height);
        
        quality = 0.4;
        dataUrl = miniCanvas.toDataURL('image/jpeg', quality);
        scale -= 0.1;
      }
    }
  }

  return dataUrl;
}
