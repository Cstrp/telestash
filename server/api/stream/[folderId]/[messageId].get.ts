import { getTelegramClient } from "~~/server/lib/telegram";
import { Readable } from "node:stream";
import bigInt from "big-integer";
import { Api } from "telegram";

defineRouteMeta({
  openAPI: {
    tags: ["Stream"],
    summary: "Stream media for preview",
    description:
      "Streams media content with Range header support for video/audio playback in the browser. Supports partial content (HTTP 206).",
    parameters: [
      {
        name: "folderId",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: 'Folder ID or "me" for Saved Messages',
      },
      {
        name: "messageId",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Message ID",
      },
    ],
    responses: {
      200: { description: "Full file content" },
      206: { description: "Partial content (Range request)" },
      404: { description: "Message or media not found" },
    },
  },
});

const CHUNK_SIZE = 1024 * 1024; // 1 MB per streaming chunk

export default defineEventHandler(async (event) => {
  const folderId = getRouterParam(event, "folderId");
  const messageId = getRouterParam(event, "messageId");

  if (!messageId || isNaN(Number(messageId))) {
    throw createError({ statusCode: 400, message: "Invalid messageId" });
  }

  const client = await getTelegramClient();
  const peer = await resolvePeer(client, folderId);

  const [message] = await client.getMessages(peer, {
    ids: [Number(messageId)],
  });

  if (!message) {
    throw createError({ statusCode: 404, message: "Message not found" });
  }

  const media = message.media as Api.MessageMediaDocument | undefined;
  if (!media?.document) {
    throw createError({ statusCode: 404, message: "Message has no media" });
  }

  const doc = media.document as Api.Document;
  const totalSize = Number(doc.size);
  const mimeType = doc.mimeType || "application/octet-stream";

  const rangeHeader = getRequestHeader(event, "range");

  let start = 0;
  let end = totalSize - 1;
  let isPartial = false;

  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);

    if (match) {
      start = parseInt(match[1]!, 10);
      end = match[2] ? parseInt(match[2]!, 10) : totalSize - 1;
      isPartial = true;
    }
  }

  const contentLength = end - start + 1;

  setResponseHeaders(event, {
    "Content-Type": mimeType,
    "Content-Length": String(contentLength),
    "Accept-Ranges": "bytes",
  });

  if (isPartial) {
    setResponseStatus(event, 206);
    setResponseHeader(
      event,
      "Content-Range",
      `bytes ${start}-${end}/${totalSize}`,
    );
  }

  pinoLogger.info(
    { messageId, folderId, start, end, mimeType },
    "Streaming media",
  );

  const inputLocation = new Api.InputDocumentFileLocation({
    id: doc.id,
    accessHash: doc.accessHash,
    fileReference: doc.fileReference,
    thumbSize: "",
  });

  const nodeStream = new Readable({ read() {} });

  (async () => {
    try {
      let downloaded = 0;
      for await (const chunk of client.iterDownload({
        file: inputLocation,
        offset: bigInt(start),
        limit: contentLength,
        requestSize: CHUNK_SIZE,
      })) {
        const remaining = contentLength - downloaded;
        const slice =
          chunk.length > remaining ? chunk.slice(0, remaining) : chunk;
        nodeStream.push(slice);
        downloaded += slice.length;
        if (downloaded >= contentLength) break;
      }
      nodeStream.push(null);
    } catch (err) {
      nodeStream.destroy(err instanceof Error ? err : new Error(String(err)));
    }
  })();

  return sendStream(event, nodeStream);
});
