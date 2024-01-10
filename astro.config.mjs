import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const googleAnalyticsMeasurementID = 'G-XFEEFZ85LQ';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'Diploi Docs',
      logo: {
        light: './src/assets/logo-text.svg',
        dark: './src/assets/logo-white-text.svg',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/diploi/docs',
      },
      head: [
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
        }
      ],
      sidebar: [
        {
          label: 'Introduction',
          items: [
            { label: 'What is Diploi?', link: '/' },
            { label: 'Get Started', link: '/get-started/' },
          ],
        },
        {
          label: 'Concepts',
          autogenerate: { directory: 'concepts' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Templates',
          autogenerate: { directory: 'templates' },
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
