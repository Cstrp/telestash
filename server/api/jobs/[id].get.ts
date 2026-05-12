defineRouteMeta({
  openAPI: {
    tags: ["Jobs"],
    summary: "Get job status",
    description:
      "Polls the status of an async file-move job. Status transitions: pending → running → completed | failed.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Job ID returned from POST /api/files/move",
      },
    ],
    responses: {
      200: {
        description: "Job record",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string" },
                status: {
                  type: "string",
                  enum: ["pending", "running", "completed", "failed"],
                },
                messageIds: { type: "array", items: { type: "number" } },
                sourceFolderId: { type: "string" },
                targetFolderId: { type: "string" },
                error: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      404: { description: "Job not found" },
    },
  },
});

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");

  const job = getJob(id!);

  if (!job) {
    throw createError({ statusCode: 404, message: "Job not found" });
  }

  return job;
});
