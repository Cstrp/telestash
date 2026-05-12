import pinoHttp from "pino-http";

type PinoLevel =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal"
  | "silent";

const isHttpLogEnabled = process.env.NUXT_LOG_HTTP_ENABLED !== "false";
const httpLogLevel = (process.env.NUXT_LOG_HTTP_LEVEL || "info") as PinoLevel;
const ignorePaths = (process.env.NUXT_LOG_HTTP_IGNORE_PATHS || "")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

export default defineNitroPlugin((app) => {
  if (!isHttpLogEnabled) return;

  const httpLogger = pinoHttp({
    logger: pinoLogger,
    autoLogging: {
      ignore: (req) => ignorePaths.some((path) => req.url?.startsWith(path)),
    },
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return httpLogLevel;
    },
    customSuccessMessage: (req, res, responseTime) =>
      `${req.method} ${req.url} ${res.statusCode} +${responseTime}ms`,
    customErrorMessage: (req, res, err) =>
      `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
        userAgent: req.headers?.["user-agent"],
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  });

  app.hooks.hook("request", (event) => {
    httpLogger(event.node.req, event.node.res);
  });
});
