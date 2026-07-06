import imageCompression from "browser-image-compression";

/**
 * Готовит фото гостя к загрузке:
 * 1. Если это HEIC/HEIF (стандартный формат фото iPhone) — конвертирует в JPEG,
 *    иначе фото не откроется в большинстве браузеров.
 * 2. Сжимает и одновременно выравнивает поворот по EXIF (частая проблема —
 *    фото "падает на бок" после загрузки).
 * 3. Отдельно готовит маленькую миниатюру для сетки галереи — чтобы галерея
 *    грузилась быстро даже на плохом wifi площадки.
 */
export async function prepareImageForUpload(file) {
  let workingFile = file;
  let convertedFromHeic = false;

  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$|\.heif$/i.test(file.name || "");

  if (isHeic) {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.97 });
    workingFile = new File([converted], "photo.jpg", { type: "image/jpeg" });
    convertedFromHeic = true;
  }

  // Оригинал для скачивания:
  // — если исходник уже был в обычном формате (JPEG/PNG/…), используем его как есть,
  //   без единого изменения — то, что снял гость, то и скачает.
  // — если исходник был HEIC (iPhone), берём максимально качественный JPEG
  //   без уменьшения разрешения — открывается везде, разница на глаз незаметна.
  const original = convertedFromHeic
    ? await imageCompression(workingFile, {
        maxSizeMB: 30,
        initialQuality: 0.97,
        useWebWorker: true,
        fileType: "image/jpeg",
      })
    : file;

  const full = await imageCompression(workingFile, {
    maxWidthOrHeight: 3200,
    maxSizeMB: 8,
    initialQuality: 0.95,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  const thumbnail = await imageCompression(workingFile, {
    maxWidthOrHeight: 1200,
    maxSizeMB: 1.2,
    initialQuality: 0.9,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  return { full, thumbnail, original };
}

export function extensionForFile(file) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[file.type] || "jpg";
}
