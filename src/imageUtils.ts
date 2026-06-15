/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utilidades compartidas para procesar imágenes subidas por el usuario antes
 * de guardarlas en Firestore.
 *
 * Por qué existe esto:
 * - Firestore tiene límites de tamaño por documento, y guardar imágenes
 *   "crudas" en base64 puede generar documentos enormes (costos de
 *   almacenamiento/lectura, y riesgo de que alguien suba archivos gigantes
 *   a propósito para llenar la base de datos - "DoS" de almacenamiento).
 * - `firestore.rules` exige que los campos `fotoUrl` / `imagenUrl` no
 *   superen ~300.000 caracteres. Esta utilidad redimensiona y comprime
 *   la imagen en el navegador del usuario para que el resultado quede
 *   muy por debajo de ese límite.
 */

export const MAX_INPUT_FILE_BYTES = 8 * 1024 * 1024; // 8 MB: límite del archivo original antes de procesar
export const MAX_OUTPUT_BASE64_CHARS = 280_000; // Margen de seguridad por debajo del límite de 300.000 de las reglas

export interface ImageProcessOptions {
  /** Dimensión máxima (ancho o alto) en píxeles del resultado final. */
  maxDimension: number;
  /** Calidad inicial de compresión JPEG (0 a 1). */
  quality?: number;
}

export class ImageValidationError extends Error {}

/**
 * Valida que el archivo sea una imagen y no supere el tamaño máximo permitido.
 * Lanza ImageValidationError con un mensaje en español listo para mostrar al usuario.
 */
export function validateImageFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new ImageValidationError('Por favor, selecciona un archivo de imagen válido.');
  }
  if (file.size > MAX_INPUT_FILE_BYTES) {
    throw new ImageValidationError('La imagen es demasiado grande (máximo 8 MB). Por favor, elige una imagen más liviana.');
  }
}

/**
 * Lee un archivo como Data URL (base64).
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('No se pudo leer el archivo.'));
      }
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Carga una Data URL en un elemento <img> para poder dibujarla en un canvas.
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo procesar la imagen.'));
    img.src = dataUrl;
  });
}

/**
 * Redimensiona una imagen para que su lado más largo no supere `maxDimension`,
 * y la comprime como JPEG. Si el resultado sigue siendo muy grande, reduce
 * progresivamente la calidad hasta entrar dentro de MAX_OUTPUT_BASE64_CHARS.
 *
 * Devuelve un Data URL (string) listo para guardar en Firestore.
 */
export async function processImageFile(file: File, options: ImageProcessOptions): Promise<string> {
  validateImageFile(file);

  const { maxDimension, quality = 0.75 } = options;

  const originalDataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(originalDataUrl);

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  if (width > height) {
    if (width > maxDimension) {
      height = Math.round(height * (maxDimension / width));
      width = maxDimension;
    }
  } else {
    if (height > maxDimension) {
      width = Math.round(width * (maxDimension / height));
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    // Si el canvas no está disponible, devolvemos la imagen original
    // (el límite de tamaño en Firestore puede rechazarla, pero al menos
    // no rompemos la app).
    return originalDataUrl;
  }

  ctx.drawImage(img, 0, 0, width, height);

  let result = canvas.toDataURL('image/jpeg', quality);

  // Si aún es demasiado pesada, bajamos la calidad progresivamente.
  let currentQuality = quality;
  while (result.length > MAX_OUTPUT_BASE64_CHARS && currentQuality > 0.3) {
    currentQuality -= 0.1;
    result = canvas.toDataURL('image/jpeg', currentQuality);
  }

  // Como último recurso, si sigue siendo muy grande, reducimos también las
  // dimensiones a la mitad y recomprimimos una vez.
  if (result.length > MAX_OUTPUT_BASE64_CHARS) {
    const smallerCanvas = document.createElement('canvas');
    smallerCanvas.width = Math.round(width / 2);
    smallerCanvas.height = Math.round(height / 2);
    const smallerCtx = smallerCanvas.getContext('2d');
    if (smallerCtx) {
      smallerCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
      result = smallerCanvas.toDataURL('image/jpeg', 0.6);
    }
  }

  return result;
}

/** Presets recomendados para distintos usos dentro de la app. */
export const IMAGE_PRESETS = {
  /** Fotos de jugadoras, DT, AC: thumbnails pequeños. */
  avatar: { maxDimension: 200, quality: 0.75 } as ImageProcessOptions,
  /** Logos de equipos/club. */
  logo: { maxDimension: 256, quality: 0.85 } as ImageProcessOptions,
  /** Fotos de galería: algo más grandes, pero igual acotadas. */
  gallery: { maxDimension: 800, quality: 0.75 } as ImageProcessOptions,
};
