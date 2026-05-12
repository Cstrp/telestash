import { getTelegramClient } from "../../lib/telegram";

defineRouteMeta({
  openAPI: {
    tags: ["Drives"],
    summary: "List available drives",
    description:
      "Returns Saved Messages (root drive) and all Telegram groups/channels accessible to the account.",
    responses: {
      200: {
        description: "List of drives",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "number",
                    description: "Drive ID (0 = Saved Messages)",
                  },
                  name: { type: "string" },
                  icon: { type: "string" },
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

  const me = await client.getMe();
  const drives = [
    {
      id: 0,
      name:
        `${me.firstName ?? ""} ${me.lastName ?? ""}`.trim() || "Saved Messages",
      icon: "saved",
    },
  ];

  for await (const dialog of client.iterDialogs()) {
    if (!dialog.isChannel && !dialog.isGroup) continue;

    const entity = dialog.entity;

    if (!entity || !("id" in entity)) continue;

    drives.push({
      id: Number(entity.id),
      name: dialog.title || "Untitled",
      icon: dialog.isChannel ? "channel" : "group",
    });
  }

  return drives;
});
