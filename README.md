# Telestash (Nuxt 4 + Tauri)

Desktop app powered by Nuxt 4 frontend and Tauri runtime.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

Install Rust toolchain (required by Tauri):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Development

Run Tauri with Nuxt dev server (recommended):

```bash
pnpm dev
```

Run only Nuxt dev server:

```bash
pnpm dev:web
```

## Build

Build web assets:

```bash
pnpm build:web
```

Build desktop app:

```bash
pnpm build:tauri
```
