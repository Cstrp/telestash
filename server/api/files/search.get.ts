import { getTelegramClient } from "../../lib/telegram";
import { Api } from "telegram";

defineRouteMeta({
  openAPI: {
    tags: ["Files"],
    summary: "Search for files",
    description:
      "Searches for files by name/text. If folderId is provided, searches within that folder only; otherwise searches across all Saved Messages.",
    parameters: [
      {
        name: "q",
        in: "query",
        required: true,
        schema: { type: "string" },
        description: "Search query",
      },
      {
        name: "folderId",
        in: "query",
        required: false,
        schema: { type: "string" },
        description: "Restrict search to this folder ID",
      },
    ],
    responses: {
      200: {
        description: "Matching files",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
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
      },
      400: { description: "Missing query parameter" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const { q, folderId } = getQuery<{ q?: string; folderId?: string }>(event);

  if (!q || !q.trim()) {
    throw createError({
      statusCode: 400,
      message: "q query parameter is required",
    });
  }

  const client = await getTelegramClient();
  const peer = await resolvePeer(client, folderId);

  const files = [];

  for await (const message of client.iterMessages(peer, {
    search: q.trim(),
    filter: new Api.InputMessagesFilterDocument(),
  })) {
    const media = message.media as Api.MessageMediaDocument | undefined;
    if (!media?.document) continue;

    const doc = media.document as Api.Document;
    const nameAttr = doc.attributes.find(
      (a) => a instanceof Api.DocumentAttributeFilename,
    ) as Api.DocumentAttributeFilename | undefined;

    const name = nameAttr?.fileName || "unknown";
    const ext = getExtension(name);

    files.push({
      id: message.id,
      folderId: folderId ? Number(folderId) : 0,
      name,
      size: Number(doc.size),
      mimeType: doc.mimeType,
      extension: ext,
      icon: getIconType(doc.mimeType, ext),
      createdAt: new Date(message.date * 1000).toISOString(),
    });
  }

  return files;
});
