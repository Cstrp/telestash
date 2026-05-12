import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { pinoLogger } from "../utils/pino-logger";

let client: TelegramClient | undefined;

export const getTelegramClient = async (): Promise<TelegramClient> => {
  if (client?.connected) return client;

  const config = useRuntimeConfig();

  const apiId = parseInt(config.telegramApiId, 10);
  const sessionString = config.telegramSession;
  const apiHash = config.telegramApiHash;

  if (!apiId || !apiHash) {
    throw new Error(
      "TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in environment variables",
    );
  }

  const session = new StringSession(sessionString);

  client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    useWSS: false,
  });

  await client.connect();
  pinoLogger.info("Telegram client connected");

  return client;
};

export const disconnectTelegramClient = async (): Promise<void> => {
  if (client?.connected) {
    await client.disconnect();
    pinoLogger.info("Telegram client disconnected");
  }

  client = undefined;
};
