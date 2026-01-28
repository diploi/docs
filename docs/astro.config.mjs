import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
const googleAnalyticsMeasurementID = "G-XFEEFZ85LQ";
import starlightLlmsTxt from "starlight-llms-txt";

// https://astro.build/config
export default defineConfig({
  site: "https://docs.diploi.com/",
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
            {
              label: "The Diploi Way",
              link: "/the-diploi-way/",
            },
          ],
        },
        {
          label: "Deploying",
          items: [
            "deploying/creating-a-project",
            "deploying/creating-a-deployment",
            "deploying/import-from-github",
            "deploying/cloning-a-deployment",
            "deploying/custom-domain",
          ],
        },
        {
          label: "Building",
          items: [
            "building/components",
            {
              label: "Components supported",
              collapsed: true,
              items: [
                "building/components/astro",
                "building/components/asp",
                "building/components/blazor",
                "building/components/bun",
                "building/components/deno",
                "building/components/django",
                "building/components/fastapi",
                "building/components/flask",
                "building/components/ghost",
                "building/components/hono",
                "building/components/laravel",
                "building/components/n8n",
                "building/components/nextjs",
                "building/components/nodejs",
                "building/components/nue",
                "building/components/react-vite",
                "building/components/supabase",
                "building/components/sveltekit",
              ],
            },
            "building/add-ons",
            {
              label: "Add-ons supported",
              collapsed: true,
              items: [
                "building/add-ons/mariadb",
                "building/add-ons/minio",
                "building/add-ons/mongo",
                "building/add-ons/postgres",
                "building/add-ons/redis",
              ],
            },
            "building/add-ssh-key",
            "building/remote-development",
          ],
        },
        {
          label: "Reference",
          items: [
            "reference/diploi-cli",
            "reference/technical-deep-dive",
            "reference/architecture",
            "reference/diploi-yaml",
            "reference/glossary",
            {
              label: "Projects",
              items: [
                "reference/projects/project",
                "reference/projects/project-lifecycle",
              ],
            },
            {
              label: "Deployments",
              items: [
                "reference/deployments/deployment",
                "reference/deployments/deployment-lifecycle",
              ],
            },
          ],
        },
        {
          label: "FAQ",
          link: "/faq/"
        },
        {
          label: "Troubleshooting",
          link: "/troubleshooting/",
        },
        {
          label: "Roadmap",
          link: "/roadmap/"
        },
        {
          label: "LLMs",
          collapsed: true,
          items: [
            { label: 'llms.txt', link: "/llms.txt" },
            { label: 'llms-small.txt', link: "/llms-small.txt" },
            { label: 'llms-full.txt', link: "/llms-full.txt" }
          ],
        },
      ],
      customCss: ["./src/styles/custom.css"],
      plugins: [
        starlightLlmsTxt({
          customSets: [
            {
              label: "Welcome to Diploi",
              description:
                "An introduction to what is Diploi, who is it for and what it does",
              paths: ["index"],
            },
            {
              label: "Get started",
              description:
                "Quick guide explaining the essentials to get an application created and hosted on Diploi",
              paths: ["get-started"],
            },
            {
              label: "Deploying",
              description:
                "How to deploy an application on Diploi",
              paths: ["deploying/**"],
            },
            {
              label: "Building",
              description:
                "How to start building an application on Diploi",
              paths: ["building/**"],
            },
            {
              label: "Reference",
              description: "Explanations about how Diploi works and how its architecture is defined",
              paths: ["reference/**"],
            },
            {
              label: "FAQ",
              description:
                "Responses to common questions about Diploi",
              paths: ["faq"],
            },
            {
              label: "The Diploi Way",
              description:
              "The philosophy behind Diploi and our vision",
              paths: ["the-diploi-way"],
            },
            {
              label: "Roadmap",
              description:
              "Our future plans",
              paths: ["roadmap"],
            },
            {
              label: "Troubleshooting",
              description:
              "Solutions to common problems in Diploi",
              paths: ["troubleshooting"],
            },
          ],
        }),
      ],
    }),
    tailwind(),
  ],
});
