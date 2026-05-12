import { getTelegramClient } from "../../lib/telegram";
import { Api } from "telegram";

defineRouteMeta({
  openAPI: {
    tags: ["Folders"],
    summary: "Create a new folder",
    description:
      "Creates a new Telegram supergroup that acts as a folder for storing files.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string", description: "Folder name" },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: "Folder created",
        content: {
          "application/json": {
            schema: {
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
      400: { description: "Invalid input" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string }>(event);

  if (!body?.name || typeof body.name !== "string" || !body.name.trim()) {
    throw createError({ statusCode: 400, message: "name is required" });
  }

  const client = await getTelegramClient();

  const result = (await client.invoke(
    new Api.channels.CreateChannel({
      title: body.name.trim(),
      about: "Telegram Drive folder",
      broadcast: false,
      megagroup: true,
    }),
  )) as Api.Updates;

  const chat = (
    result as unknown as {
      chats: Array<{ id: bigint | number; title: string }>;
    }
  ).chats?.[0];

  if (!chat) {
    throw createError({ statusCode: 500, message: "Failed to create folder" });
  }

  setResponseStatus(event, 201);
  return {
    id: Number(chat.id),
    parentId: 0,
    name: chat.title,
  };
});
