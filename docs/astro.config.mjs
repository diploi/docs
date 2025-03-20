import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
const googleAnalyticsMeasurementID = "G-XFEEFZ85LQ";

// https://astro.build/config
export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    server: {
      allowedHosts: [".diploi.app"],
    },
  },
  integrations: [
    starlight({
      title: "Diploi Docs",
      logo: {
        light: "./src/assets/logo-text.svg",
        dark: "./src/assets/logo-white-text.svg",
        replacesTitle: true,
      },
      social: {
        github: "https://github.com/diploi/docs",
      },
      components: {
        SiteTitle: "./src/components/SiteTitle.astro",
      },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 5 },
      head: [
        {
          tag: "script",
          attrs: {
            defer,
            src: "https://umami.console.diploi.com/script.js",
            "data-website-id": "0845061e-d7dd-43ea-afa4-3cdf948fe08b",
          },
        },
        {
          tag: "script",
          attrs: {
            src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsMeasurementID}`,
            async: true,
          },
        },
        {
          tag: "script",
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
      sidebar: [
        {
          label: "Introduction",
          items: [
            {
              label: "What is Diploi?",
              link: "/",
            },
            {
              label: "Get Started",
              link: "/get-started/",
            },
            // {
            //   label: 'Tutorial',
            //   link: '/tutorial/',
            // },
            // {
            //   label: 'Roadmap',
            //   link: '/roadmap/',
            // },
          ],
        },
        {
          label: "Concepts",
          autogenerate: { directory: "concepts" },
        },
        // {
        //   label: "Tutorials",
        //   autogenerate: { directory: "tutorials" },
        // },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
        // {
        //   label: 'Templates',
        //   autogenerate: { directory: 'templates' },
        // },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
    tailwind(),
  ],
});
