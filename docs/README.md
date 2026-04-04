[![launch with diploi badge](https://diploi.com/launch.svg)](https://diploi.com/import?url=https%3A%2F%2Fgithub.com%2Fdiploi%2Fdocs)

<img alt="icon" src="public/icon.svg" width="32">

# Diploi Documentation

Welcome to the source of [**Diploi Documentation**](https://docs.diploi.com), the home for everything related to developing, deploying, and scaling with **Diploi**.

Our docs are built using [Astro Starlight](https://starlight.astro.build), designed for speed, clarity, and easy contributions.

## 💡 About

This repository powers all the public documentation for [**Diploi**](https://diploi.com) - a next-generation SaaS platform for developing and hosting your applications with zero friction.

If you spot something unclear, outdated, or missing - please help us improve it!  
Every pull request helps make Diploi easier to use for everyone.


## Contributing

We ❤️ contributions! Here’s how to get started:

### 1. Prerequisites

- **Node.js 22+** (or use [nvm](https://github.com/nvm-sh/nvm))
- **pnpm** (recommended package manager)

If you don’t have pnpm yet:

```bash
npm install -g pnpm
```


### 2. Setup and run locally

Clone the repo and start the local dev server:

```bash
git clone https://github.com/diploi/docs.git
cd docs/docs
pnpm install
pnpm run dev
```

Then visit [http://localhost:4321](http://localhost:4321) - your local Diploi Docs will be running there


## Structure

| Path | Description |
|------|--------------|
| `src/content/docs/` | Main documentation pages (Markdown / MDX) |
| `astro.config.mjs` | Starlight site and navigation config |
| `public/` | Static assets (images, icons, etc.) |
| `.github/` | GitHub Actions for CI/CD and deployment |


## Deployment

Docs are automatically deployed when changes are merged into `main`.  
The site is hosted directly on Diploi’s infrastructure - so edits will go live within minutes.


## Useful Links

- 🌐 [Diploi.com](https://diploi.com)
- 📖 [Live Docs](https://docs.diploi.com)
- 🐞 [Report an Issue](https://github.com/diploi/docs/issues)


[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)
