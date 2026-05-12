import { getTelegramClient, disconnectTelegramClient } from "../lib/telegram";

export default defineNitroPlugin(async (app) => {
  try {
    await getTelegramClient();
  } catch (errorr) {
    pinoLogger.warn(
      { err: errorr },
      "Telegram client failed to connect on startup — routes will retry lazily",
    );
  }

  app.hooks.hookOnce("close", async () => {
    await disconnectTelegramClient();
  });
});
