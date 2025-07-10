import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
const googleAnalyticsMeasurementID = "G-XFEEFZ85LQ";

// https://astro.build/config
export default defineConfig({
  markdown: {},
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
            defer: true,
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
          ],
        },
        {
          label: "Deploying",
          items: [
            "deploying/creating-a-deployment",
            "deploying/creating-a-project",
            "deploying/custom-domain",
          ],
        },
        {
          label: "Building",
          items: [
            'building/components',
            'building/add-ons',
            'building/add-ssh-key',
            'building/remote-development',
          ],
        },
        {
          label: "Reference",
          items: [
            "reference/technical-deep-dive",
            "reference/architecture",
            "reference/diploi-yaml",
            {
              label: "Deployments",
              items: [
                "reference/deployments/deployment",
                "reference/deployments/deployment-lifecycle",
              ],
            },
            {
              label: "Projects",
              items: [
                "reference/projects/project",
                "reference/projects/project-lifecycle",
              ],
            },
          ],
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
    tailwind(),
  ],
});
