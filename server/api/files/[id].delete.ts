import { getTelegramClient } from "~~/server/lib/telegram";

defineRouteMeta({
  openAPI: {
    tags: ["Files"],
    summary: "Delete a file",
    description:
      "Permanently deletes the Telegram message containing the file. Pass folderId if the file is in a group/channel.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Message ID of the file",
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
        description: "File deleted",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      400: { description: "Invalid ID" },
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

  await client.deleteMessages(peer, [Number(id)], { revoke: true });

  pinoLogger.info({ messageId: id, folderId }, "File deleted");
  return { success: true, message: "File deleted" };
});
