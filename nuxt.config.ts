const isTauri =
  process.env.TAURI_PLATFORM !== undefined ||
  process.env.TAURI_FAMILY !== undefined ||
  process.env.TAURI !== undefined;

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ignore: ["**/src-tauri/**"],
  devServer: { host: "0" },
  ssr: false,
  experimental: {
    viteEnvironmentApi: true,
  },

  runtimeConfig: {
    telegramApiHash: process.env.NUXT_TELEGRAM_API_HASH || "",
    telegramSession: process.env.NUXT_TELEGRAM_SESSION || "",
    telegramApiId: process.env.NUXT_TELEGRAM_API_ID || "",
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
    ...(isTauri ? [] : ["@vite-pwa/nuxt"]),
  ],

  typescript: {
    typeCheck: true,
    strict: true,
  },

  routeRules: {
    "/": { ssr: false },
  },

  vite: {
    ssr: { noExternal: [], resolve: { conditions: ["node"] } },
    server: { strictPort: true, hmr: { port: 24678 } },
    optimizeDeps: { exclude: ["cssstyle", "jsdom"] },
    envPrefix: ["VITE_", "TAURI_", "NUXT_"],
    clearScreen: false,

    build: {
      chunkSizeWarningLimit: 768,
      commonjsOptions: {
        transformMixedEsModules: true,
        exclude: ["cssstyle", "jsdom"],
      },
    },

    esbuild: { charset: "utf8" },
  },

  nitro: {
    compressPublicAssets: true,
    prerender: { crawlLinks: true, ignore: ["/**"] },
    experimental: { tasks: true, openAPI: true, websocket: true },
  },
});
