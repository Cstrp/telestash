import { mkdir } from "fs/promises";
import { dirname } from "path";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  runtimeConfig: {
    telegramApiId: process.env.TELEGRAM_API_ID || "",
    telegramApiHash: process.env.TELEGRAM_API_HASH || "",
    telegramSession: process.env.TELEGRAM_SESSION || "",
  },

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/scripts",
    "@nuxt/eslint",
    "@nuxtjs/i18n",
    "@nuxt/fonts",
    "@nuxtjs/seo",
    "@pinia/nuxt",
    "@nuxt/icon",
  ],

  vite: { clearScreen: false },
  nitro: { experimental: { tasks: true, openAPI: true, websocket: true } },
});
