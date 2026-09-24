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
| `src/content/elements/` | Hand-written parts of the generated component, add-on and starter kit pages (see below) |
| `src/elements/` | Loads components, add-ons and starter kits from the Diploi Console and generates their pages |
| `src/sidebar.mjs` | The navigation |
| `astro.config.mjs` | Starlight site config |
| `public/` | Static assets (images, icons, etc.) |
| `.github/` | GitHub Actions for CI/CD and deployment |


## Component, add-on and starter kit pages

The pages under `/building/components`, `/building/add-ons` and `/building/starter-kits`, the lists on the overview
pages and the sidebar groups are generated at build time from what the Diploi Console lists
(`stack.listPreviewComponents`) and from each element's repository (`README.md`, `.diploi/icon.svg`). A new component
gets a page as soon as the Console lists it; nothing needs to change in this repository.

A page is: the intro from its overlay, how to add it to `diploi.yaml` (or how to launch it, for starter kits), the rest
of the overlay, the repository README, and a "See also" list.

To add or edit the hand-written parts of a page, create or edit `src/content/elements/<identifier>.md`, where
`<identifier>` is the identifier used by the Console (`next`, `postgres`, `web-app`, …):

```md
---
description: Deploy production-ready Next.js apps with server rendering on Diploi.
summary: A React-based web development framework for server-side and static web rendering. # overview page blurb, defaults to description
links: # added to "See also" and to the cards on the overview page
  - label: Next.js docs
    href: https://nextjs.org/docs
sidebar: # optional, e.g. to order starter kits
  order: 1
---
Intro, shown before "Add to your project".

<!-- more -->

## Anything else

Shown after "Add to your project" and before the README. Plain Markdown: asides, code fences, tables and images
(relative to this file) all work. `{{package}}` becomes the element's package reference and `{{package:postgres}}`
that of another element; `{{name}}`, `{{identifier}}`, `{{url}}` and `{{version}}` work the same way.
```

To take over a page completely, add a regular page at the same path (e.g. `src/content/docs/building/components/next.mdx`)
and it will be used instead of the generated one.


## Deployment

Docs are automatically deployed when changes are merged into `main`.  
The site is hosted directly on Diploi’s infrastructure - so edits will go live within minutes.


## Useful Links

- 🌐 [Diploi.com](https://diploi.com)
- 📖 [Live Docs](https://docs.diploi.com)
- 🐞 [Report an Issue](https://github.com/diploi/docs/issues)


[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)
