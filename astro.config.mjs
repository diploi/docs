import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

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
      sidebar: [
        {
          label: 'Introduction',
          items: [
            { label: 'What is Diploi?', link: '/' },
            { label: 'Get Started', link: '/get-started/' },
          ],
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Concepts',
          autogenerate: { directory: 'concepts' },
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
