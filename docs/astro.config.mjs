import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
const googleAnalyticsMeasurementID = 'G-XFEEFZ85LQ';
import starlightLlmsTxt from 'starlight-llms-txt';
import { sidebar } from './src/sidebar.mjs';
import { fileURLToPath } from 'node:url';

// starlight-llms-txt has no option to leave out one of its routes, so its /llms-full.txt entrypoint is swapped for
// ours (src/llms/llms-full.txt.ts: pages in sidebar order with a Source url each, for the Diploi MCP server)
const llmsFullOverride = () => ({
  name: 'diploi-llms-full-override',
  enforce: 'pre',
  resolveId(source) {
    if (/starlight-llms-txt[\\/]llms-full\.txt\.ts$/.test(source)) {
      return fileURLToPath(new URL('./src/llms/llms-full.txt.ts', import.meta.url));
    }
  },
});

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.diploi.com',
  trailingSlash: 'never',
  markdown: {},
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    plugins: [tailwindcss(), llmsFullOverride()],
    server: {
      allowedHosts: ['.diploi.me'],
    },
  },
  integrations: [
    starlight({
      title: 'Diploi Docs',
      logo: {
        light: './src/assets/logo-text.svg',
        dark: './src/assets/logo-white-text.svg',
        replacesTitle: true,
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/diploi/docs' }],
      components: {
        SiteTitle: './src/components/SiteTitle.astro',
      },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 5 },
      head: [
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: 'https://umami.console.diploi.com/script.js',
            'data-website-id': '0845061e-d7dd-43ea-afa4-3cdf948fe08b',
          },
        },
        {
          tag: 'script',
          attrs: {
            src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsMeasurementID}`,
            async: true,
          },
        },
        {
          tag: 'script',
          content: `
            window.dataLayer = window.dataLayer || [];
            function gtag() {
              dataLayer.push(arguments);
            }
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsMeasurementID}');
          `,
        },
      ],
      sidebar,
      customCss: ['./src/styles/tailwind.css', './src/styles/custom.css'],
      plugins: [
        starlightLlmsTxt({
          // Starlight's heading anchor links ("Section titled …") are navigation, not content
          customSelectors: { all: ['.sl-anchor-link'] },
          customSets: [
            {
              label: 'Welcome to Diploi',
              description:
                'An introduction to what is Diploi, who is it for and what it does',
              paths: ['index'],
            },
            {
              label: 'Get started',
              description:
                'Quick guide explaining the essentials to get an application created and hosted on Diploi',
              paths: ['get-started'],
            },
            {
              label: 'Deploying',
              description: 'How to deploy an application on Diploi',
              paths: ['deploying/**'],
            },
            {
              label: 'Building',
              description: 'How to start building an application on Diploi',
              paths: ['building/**'],
            },
            {
              label: 'Reference',
              description:
                'Explanations about how Diploi works and how its architecture is defined',
              paths: ['reference/**'],
            },
            {
              label: 'FAQ',
              description: 'Responses to common questions about Diploi',
              paths: ['faq'],
            },
            {
              label: 'The Diploi Way',
              description: 'The philosophy behind Diploi and our vision',
              paths: ['the-diploi-way'],
            },
            {
              label: 'Roadmap',
              description: 'Our future plans',
              paths: ['roadmap'],
            },
            {
              label: 'Troubleshooting',
              description: 'Solutions to common problems in Diploi',
              paths: ['troubleshooting'],
            },
          ],
        }),
      ],
    }),
  ],
});
