const ICON_MAP: Record<string, string> = {
  // Images
  "image/jpeg": "image",
  "image/png": "image",
  "image/gif": "image",
  "image/webp": "image",
  "image/bmp": "image",
  "image/svg+xml": "image",
  "image/heic": "image",
  "image/heif": "image",
  // Video
  "video/mp4": "video",
  "video/webm": "video",
  "video/ogg": "video",
  "video/quicktime": "video",
  "video/x-matroska": "video",
  "video/x-msvideo": "video",
  // Audio
  "audio/mpeg": "audio",
  "audio/wav": "audio",
  "audio/aac": "audio",
  "audio/flac": "audio",
  "audio/mp4": "audio",
  "audio/ogg": "audio",
  "audio/opus": "audio",
  // Documents
  "application/pdf": "pdf",
  "application/zip": "archive",
  "application/x-rar-compressed": "archive",
  "application/x-tar": "archive",
  "application/gzip": "archive",
  "application/x-7z-compressed": "archive",
  "text/plain": "text",
  "text/html": "code",
  "text/css": "code",
  "text/javascript": "code",
  "application/json": "code",
  "application/typescript": "code",
  "application/msword": "document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "document",
  "application/vnd.ms-excel": "spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "spreadsheet",
  "application/vnd.ms-powerpoint": "presentation",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "presentation",
};

export const getIconType = (mimeType: string, ext: string): string => {
  if (ICON_MAP[mimeType]) return ICON_MAP[mimeType];

  const extLower = ext.toLowerCase().replace(/^\./, "");
  const extMap: Record<string, string> = {
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    webp: "image",
    bmp: "image",
    svg: "image",
    heic: "image",
    heif: "image",
    mp4: "video",
    webm: "video",
    ogg: "video",
    mov: "video",
    mkv: "video",
    avi: "video",
    mp3: "audio",
    wav: "audio",
    aac: "audio",
    flac: "audio",
    m4a: "audio",
    opus: "audio",
    pdf: "pdf",
    zip: "archive",
    rar: "archive",
    tar: "archive",
    gz: "archive",
    "7z": "archive",
    txt: "text",
    md: "text",
    html: "code",
    css: "code",
    js: "code",
    ts: "code",
    json: "code",
    py: "code",
    doc: "document",
    docx: "document",
    xls: "spreadsheet",
    xlsx: "spreadsheet",
    ppt: "presentation",
    pptx: "presentation",
  };

  return extMap[extLower] ?? "file";
};

export const getExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf(".");
  return lastDot >= 0 ? filename.slice(lastDot + 1).toLowerCase() : "";
};
