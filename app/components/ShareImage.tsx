export type MediaType = "image" | "video" | "auto";

interface ShareMediaOptions {
  url: string;
  filename?: string;
  type?: MediaType;
  title?: string;
  text?: string;
}

/**
 * Share media file (image or video) via Web Share API or download as fallback
 * @param options - Configuration for sharing media
 * @returns Result with sharing method used
 */
export async function shareMediaFile(options: ShareMediaOptions) {
  const { url, filename, type = "auto", title, text } = options;

  const res = await fetch(url);
  const blob = await res.blob();

  let mimeType = blob.type;
  let defaultFilename = filename;

  if (!defaultFilename) {
    // generate based on type
    if (mimeType.startsWith("video/")) {
      defaultFilename = "share-video." + (mimeType.split("/")[1] || "mp4");
    } else if (mimeType.startsWith("image/")) {
      defaultFilename = "share-image." + (mimeType.split("/")[1] || "png");
    } else {
      defaultFilename =
        type === "video" ? "share-video.mp4" : "share-image.png";
      mimeType = type === "video" ? "video/mp4" : "image/png";
    }
  }

  const file = new File([blob], defaultFilename, { type: mimeType });

  const mediaType = mimeType.startsWith("video/") ? "video" : "gambar";
  const shareTitle = title || `Bagikan ${mediaType}`;
  const shareText = text || "Cek ini!";

  if (
    (navigator as any).canShare &&
    (navigator as any).canShare({ files: [file] })
  ) {
    await (navigator as any).share({
      title: shareTitle,
      text: shareText,
      files: [file],
    });
    return { ok: true, method: "web-share" as const, fileType: mediaType };
  }

  // fallback => download
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = defaultFilename;
  a.click();
  URL.revokeObjectURL(a.href);
  return { ok: true, method: "download" as const, fileType: mediaType };
}

/**
 * Legacy function for backward compatibility 
 */
export async function shareImageFile(imgUrl: string, filename = "share.png") {
  return shareMediaFile({ url: imgUrl, filename, type: "image" });
}
