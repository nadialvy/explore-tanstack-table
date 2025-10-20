export type MediaType = "image" | "video" | "auto";

interface ShareMediaOptions {
  url: string;
  filename?: string;
  type?: MediaType;
  title?: string;
  text?: string;
  /** If true, share URL directly instead of fetching file (useful for CORS-protected URLs) */
  shareUrlDirectly?: boolean;
}

/**
 * Share media file (image or video) via Web Share API or download as fallback
 * @param options - Configuration for sharing media
 * @returns Result with sharing method used
 */
export async function shareMediaFile(options: ShareMediaOptions) {
  const {
    url,
    filename,
    type = "auto",
    title,
    text,
    shareUrlDirectly = false,
  } = options;

  // detect is it public url
  const isExternalUrl = url.startsWith("http://") || url.startsWith("https://");

  // Untuk external URL, share langsung (better untuk Stories)
  // Untuk local asset, fetch & create File object (works best)
  if (shareUrlDirectly || isExternalUrl) {
    return shareUrlOnly({ url, title, text });
  }

  try {
    // Coba fetch file (untuk local assets)
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const blob = await res.blob();

    let mimeType = blob.type;
    let finalFilename = filename;

    // Deteksi atau fallback MIME type
    if (!mimeType || mimeType === "application/octet-stream") {
      // Blob tidak punya MIME type yang jelas, gunakan type parameter
      if (type === "video") {
        mimeType = "video/mp4";
      } else if (type === "image") {
        mimeType = "image/png";
      } else if (finalFilename) {
        // Coba detect dari extension filename
        const ext = finalFilename.split(".").pop()?.toLowerCase();
        if (ext === "mp4" || ext === "webm" || ext === "mov") {
          mimeType = `video/${ext}`;
        } else if (
          ext === "png" ||
          ext === "jpg" ||
          ext === "jpeg" ||
          ext === "gif"
        ) {
          mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
        }
      }
    }

    // Generate filename jika tidak ada
    if (!finalFilename) {
      if (mimeType.startsWith("video/")) {
        finalFilename = "share-video." + (mimeType.split("/")[1] || "mp4");
      } else if (mimeType.startsWith("image/")) {
        finalFilename = "share-image." + (mimeType.split("/")[1] || "png");
      } else {
        finalFilename =
          type === "video" ? "share-video.mp4" : "share-image.png";
        mimeType = type === "video" ? "video/mp4" : "image/png";
      }
    }

    const file = new File([blob], finalFilename, { type: mimeType });

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
    a.download = finalFilename;
    a.click();
    URL.revokeObjectURL(a.href);
    return { ok: true, method: "download" as const, fileType: mediaType };
  } catch (error) {
    // CORS error atau network error - fallback ke share URL langsung
    console.warn("Failed to fetch media, falling back to URL share:", error);
    return shareUrlOnly({ url, title, text });
  }
}

/**
 * Share URL langsung (fallback untuk CORS-protected URLs)
 */
function shareUrlOnly({
  url,
  title,
  text,
}: {
  url: string;
  title?: string;
  text?: string;
}) {
  const shareTitle = title || "Bagikan media";
  const shareText = text || "Lihat ini!";

  if (navigator.share) {
    return navigator
      .share({
        title: shareTitle,
        text: shareText,
        url: url,
      })
      .then(() => ({
        ok: true,
        method: "url-share" as const,
        fileType: "url" as const,
      }));
  }

  // Fallback: copy URL ke clipboard
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(url).then(() => ({
      ok: true,
      method: "clipboard" as const,
      fileType: "url" as const,
      message: "URL copied to clipboard",
    }));
  }

  // Last fallback: open in new tab
  window.open(url, "_blank");
  return Promise.resolve({
    ok: true,
    method: "new-tab" as const,
    fileType: "url" as const,
    message: "Opened in new tab",
  });
}
