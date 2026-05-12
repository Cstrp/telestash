import { getTelegramClient } from "../../lib/telegram";

defineRouteMeta({
  openAPI: {
    tags: ["Files"],
    summary: "Move files to another folder",
    description:
      "Enqueues an async job that forwards messages to the target folder and deletes the originals. Poll GET /api/jobs/:id for completion.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["messageIds", "targetFolderId"],
            properties: {
              messageIds: {
                type: "array",
                items: { type: "number" },
                description: "IDs of messages to move",
              },
              sourceFolderId: {
                type: "string",
                description: "Source folder ID (omit for Saved Messages)",
              },
              targetFolderId: {
                type: "string",
                description: "Target folder ID (omit for Saved Messages)",
              },
            },
          },
        },
      },
    },
    responses: {
      202: {
        description: "Job enqueued",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                jobId: { type: "string" },
                status: { type: "string", enum: ["pending"] },
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
  const body = await readBody<{
    messageIds?: number[];
    sourceFolderId?: string;
    targetFolderId?: string;
  }>(event);

  if (!Array.isArray(body?.messageIds) || body.messageIds.length === 0) {
    throw createError({
      statusCode: 400,
      message: "messageIds array is required",
    });
  }

  if (!body.targetFolderId && body.targetFolderId !== undefined) {
    throw createError({
      statusCode: 400,
      message: "targetFolderId is required",
    });
  }

  const job = createJob({
    messageIds: body.messageIds,
    sourceFolderId: body.sourceFolderId,
    targetFolderId: body.targetFolderId,
  });

  setResponseStatus(event, 202);

  // Run job asynchronously — do not await
  runMoveJob(
    job.id,
    body.messageIds,
    body.sourceFolderId,
    body.targetFolderId,
  ).catch((err) => {
    pinoLogger.error({ err, jobId: job.id }, "Move job error");
  });

  return { jobId: job.id, status: job.status };
});

const runMoveJob = async (
  jobId: string,
  messageIds: number[],
  sourceFolderId: string | undefined,
  targetFolderId: string | undefined,
): Promise<void> => {
  updateJob(jobId, { status: "running" });
  pinoLogger.info(
    { jobId, messageIds, sourceFolderId, targetFolderId },
    "Move job started",
  );

  try {
    const client = await getTelegramClient();
    const sourcePeer = await resolvePeer(client, sourceFolderId);
    const targetPeer = await resolvePeer(client, targetFolderId);

    await client.forwardMessages(targetPeer, {
      messages: messageIds,
      fromPeer: sourcePeer,
    });

    await client.deleteMessages(sourcePeer, messageIds, { revoke: true });

    updateJob(jobId, { status: "completed" });
    pinoLogger.info({ jobId }, "Move job completed");
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    updateJob(jobId, { status: "failed", error: errorMessage });
    pinoLogger.error({ err, jobId }, "Move job failed");
  }
};
