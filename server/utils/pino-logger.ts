import { existsSync, mkdirSync } from "node:fs";
import { cwd } from "node:process";
import { join } from "node:path";

import pino from "pino";

const logLevel = process.env.NUXT_LOG_LEVEL || "info";
const logDir = join(cwd(), process.env.NUXT_LOG_DIR || ".logs");
const colorize = process.env.NUXT_LOG_COLORIZE !== "false";
const usePretty = import.meta.dev || process.env.NUXT_LOG_PRETTY === "true";

if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

const prettyTransport = {
  target: "pino-pretty",
  options: {
    colorize,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
  },
};

const fileTransports = {
  targets: [
    {
      level: "info" as const,
      target: "pino/file",
      options: { destination: join(logDir, "info.log") },
    },
    {
      level: "error" as const,
      target: "pino/file",
      options: { destination: join(logDir, "error.log") },
    },
    {
      level: "debug" as const,
      target: "pino/file",
      options: { destination: join(logDir, "debug.log") },
    },
  ],
};

export const pinoLogger = pino({
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: usePretty ? prettyTransport : fileTransports,
});
