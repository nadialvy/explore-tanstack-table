// shareImage.ts
export async function shareImageFile(imgUrl: string, filename = "share.png") {
  // Ambil gambar (bisa public URL atau data URL)
  const res = await fetch(imgUrl);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: blob.type || "image/png" });

  // Cek dukungan share file
  if (
    (navigator as any).canShare &&
    (navigator as any).canShare({ files: [file] })
  ) {
    await (navigator as any).share({
      title: "Bagikan gambar",
      text: "Cek ini!",
      files: [file],
    });
    return { ok: true, method: "web-share" as const };
  }

  // Fallback: unduh agar user bisa upload manual
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  return { ok: true, method: "download" as const };
}
