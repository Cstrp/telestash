defineRouteMeta({
  openAPI: {
    tags: ["Health"],
    summary: "Get the health status of the server",
    description: "The server's health status, uptime, and current timestamp.",
    responses: {
      default: {
        description: "Health status response",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string" },
                uptime: { type: "number" },
                timestamp: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(() => {
  return {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
});
