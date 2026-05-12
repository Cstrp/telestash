import { getTelegramClient } from "../../lib/telegram";

defineRouteMeta({
  openAPI: {
    tags: ["Folders"],
    summary: "List all folders",
    description:
      "Returns all Telegram groups and channels the account belongs to, usable as folders.",
    responses: {
      200: {
        description: "List of folders",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  parentId: { type: "number" },
                  name: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async () => {
  const client = await getTelegramClient();

  const folders = [];

  for await (const dialog of client.iterDialogs()) {
    if (!dialog.isChannel && !dialog.isGroup) continue;

    const entity = dialog.entity;

    if (!entity || !("id" in entity)) continue;

    folders.push({
      id: Number(entity.id),
      parentId: 0,
      name: dialog.title || "Untitled",
    });
  }

  return folders;
});
