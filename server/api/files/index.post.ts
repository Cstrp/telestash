import { getTelegramClient } from "../../lib/telegram";
import { Api } from "telegram";

defineRouteMeta({
  openAPI: {
    tags: ["Files"],
    summary: "Upload a file",
    description:
      "Uploads a file to the specified folder via multipart/form-data. Omit folderId to upload to Saved Messages.",
    requestBody: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            required: ["file"],
            properties: {
              file: {
                type: "string",
                format: "binary",
                description: "File to upload",
              },
              folderId: {
                type: "string",
                description: "Target folder ID (omit for Saved Messages)",
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: "File uploaded successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "number" },
                folderId: { type: "number" },
                name: { type: "string" },
                size: { type: "number" },
                mimeType: { type: "string" },
                extension: { type: "string" },
                icon: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      400: { description: "No file provided" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event);

  const filePart = parts?.find((p) => p.name === "file");
  if (!filePart?.data || !filePart.filename) {
    throw createError({ statusCode: 400, message: "file field is required" });
  }

  const folderIdPart = parts?.find((p) => p.name === "folderId");
  const folderId = folderIdPart?.data
    ? folderIdPart.data.toString()
    : undefined;

  const filename = filePart.filename;
  const mimeType = filePart.type ?? "application/octet-stream";
  const ext = getExtension(filename);

  const client = await getTelegramClient();
  const peer = await resolvePeer(client, folderId);

  pinoLogger.info({ filename, folderId }, "Uploading file to Telegram");

  const message = await client.sendFile(peer, {
    file: filePart.data,
    caption: "",
    forceDocument: true,
    workers: 4,
    attributes: [new Api.DocumentAttributeFilename({ fileName: filename })],
  });

  pinoLogger.info({ messageId: message.id, filename }, "File uploaded");

  setResponseStatus(event, 201);
  return {
    id: message.id,
    folderId: folderId ? Number(folderId) : 0,
    name: filename,
    size: filePart.data.length,
    mimeType,
    extension: ext,
    icon: getIconType(mimeType, ext),
    createdAt: new Date(message.date * 1000).toISOString(),
  };
});
