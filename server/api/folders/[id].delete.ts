import { getTelegramClient } from "~~/server/lib/telegram";
import { Api } from "telegram";

defineRouteMeta({
  openAPI: {
    tags: ["Folders"],
    summary: "Delete a folder",
    description:
      "Deletes the Telegram channel/group that represents the folder. All files inside are permanently removed.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Folder ID",
      },
    ],
    responses: {
      200: {
        description: "Folder deleted",
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
      500: { description: "Delete failed" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: "Invalid folder ID" });
  }

  const client = await getTelegramClient();

  try {
    const inputChannel = await client.getInputEntity(id);

    await client.invoke(
      new Api.channels.DeleteChannel({ channel: inputChannel }),
    );
  } catch (err) {
    pinoLogger.error({ err, folderId: id }, "Failed to delete folder");
    throw createError({ statusCode: 500, message: "Failed to delete folder" });
  }

  pinoLogger.info({ folderId: id }, "Folder deleted");
  return { success: true, message: "Folder deleted" };
});
