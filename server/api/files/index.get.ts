import { getTelegramClient } from "../../lib/telegram";
import { Api } from "telegram";

defineRouteMeta({
  openAPI: {
    tags: ["Files"],
    summary: "List files in a folder",
    description:
      "Returns all document files stored in the specified folder (Telegram chat). Omit folderId to list files in Saved Messages.",
    parameters: [
      {
        name: "folderId",
        in: "query",
        required: false,
        schema: { type: "string" },
        description: "Folder ID (channel/group). Omit for Saved Messages.",
      },
    ],
    responses: {
      200: {
        description: "File list",
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
    },
  },
});

export default defineEventHandler(async (event) => {
  const { folderId } = getQuery<{ folderId?: string }>(event);

  const client = await getTelegramClient();
  const peer = await resolvePeer(client, folderId);

  const files = [];

  for await (const message of client.iterMessages(peer, {
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
