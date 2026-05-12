import { getTelegramClient } from "~~/server/lib/telegram";
import { Api } from "telegram";

defineRouteMeta({
  openAPI: {
    tags: ["Files"],
    summary: "Download a file",
    description:
      "Downloads the full file content. The response Content-Disposition header is set to attachment with the original filename.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Message ID",
      },
      {
        name: "folderId",
        in: "query",
        required: false,
        schema: { type: "string" },
        description: "Folder ID (omit for Saved Messages)",
      },
    ],
    responses: {
      200: {
        description: "File content",
        content: {
          "application/octet-stream": {
            schema: { type: "string", format: "binary" },
          },
        },
      },
      400: { description: "Invalid ID" },
      404: { description: "File not found" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const { folderId } = getQuery<{ folderId?: string }>(event);

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: "Invalid file ID" });
  }

  const client = await getTelegramClient();
  const peer = await resolvePeer(client, folderId);

  const [message] = await client.getMessages(peer, { ids: [Number(id)] });

  if (!message) {
    throw createError({ statusCode: 404, message: "File not found" });
  }

  const media = message.media as Api.MessageMediaDocument | undefined;
  if (!media?.document) {
    throw createError({
      statusCode: 404,
      message: "Message has no file attachment",
    });
  }

  const doc = media.document as Api.Document;
  const nameAttr = doc.attributes.find(
    (a) => a instanceof Api.DocumentAttributeFilename,
  ) as Api.DocumentAttributeFilename | undefined;

  const filename = nameAttr?.fileName || `file_${id}`;
  const mimeType = doc.mimeType || "application/octet-stream";

  pinoLogger.info({ messageId: id, filename }, "Downloading file");

  const buffer = (await client.downloadMedia(message, {})) as Buffer;

  if (!buffer) {
    throw createError({ statusCode: 500, message: "Failed to download file" });
  }

  setResponseHeaders(event, {
    "Content-Type": mimeType,
    "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    "Content-Length": String(buffer.length),
  });

  return buffer;
});
