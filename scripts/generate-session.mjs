#!/usr/bin/env node

import { stdin as input, stdout as output } from "node:process";
import { StringSession } from "telegram/sessions/index.js";
import { createInterface } from "node:readline/promises";
import { TelegramClient } from "telegram";

const apiId = parseInt(process.env.TELEGRAM_API_ID ?? "", 10);
const apiHash = process.env.TELEGRAM_API_HASH ?? "";

if (!apiId || !apiHash) {
  console.error(
    "ERROR: TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in your .env file.",
  );

  process.exit(1);
}

const rl = createInterface({ input, output });

console.log("\n=== Telegram Drive — Session Generator ===\n");

const phone = await rl.question(
  "Enter your Telegram phone number (with country code, e.g. +12345678900): ",
);

const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
  connectionRetries: 3,
});

await client.start({
  phoneNumber: () => Promise.resolve(phone.trim()),
  phoneCode: () =>
    rl.question("Enter the verification code sent to your Telegram: "),
  password: () =>
    rl.question("Enter your 2FA password (press Enter if none): "),
  onError: (err) => {
    console.error("Authentication error:", err.message);
  },
});

const sessionString = client.session.save();

console.log("\n✅ Authentication successful!\n");
console.log("Add the following to your .env file:\n");
console.log(`TELEGRAM_SESSION="${sessionString}"\n`);
console.log(
  "Keep this session string private — it grants full access to your Telegram account.\n",
);

await client.disconnect();
rl.close();
