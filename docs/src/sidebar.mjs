// The docs navigation, shared by astro.config.mjs (Starlight) and src/pages/llms-full.txt.ts (page order for LLMs)
export const sidebar = [
  {
    label: 'Introduction',
    items: [
      {
        label: 'What is Diploi?',
        link: '/',
      },
      {
        label: 'Get Started',
        link: '/get-started',
      },
      {
        label: 'The Diploi Way',
        link: '/the-diploi-way',
      },
    ],
  },
  {
    label: 'Deploying',
    items: [
      "deploying/creating-a-project",
      "deploying/creating-a-deployment",
      "deploying/import-from-github",
      "deploying/cloning-a-deployment",
      "deploying/custom-domain",
      "deploying/resize-disk",
    ],
  },
  {
    label: 'Building',
    items: [
      'building/components',
      // Components, add-ons and starter kits come from the Diploi Console (see src/elements)
      {
        label: 'Components supported',
        collapsed: true,
        items: [{ autogenerate: { directory: 'building/components' } }],
      },
      'building/add-ons',
      {
        label: 'Add-ons supported',
        collapsed: true,
        items: [{ autogenerate: { directory: 'building/add-ons' } }],
      },
      'building/starter-kits',
      {
        label: 'Starter Kits available',
        collapsed: true,
        items: [{ autogenerate: { directory: 'building/starter-kits' } }],
      },
      'building/add-ssh-key',
      'building/remote-development',
    ],
  },
  {
    label: 'Reference',
    items: [
      'reference/diploi-cli',
      'reference/technical-deep-dive',
      'reference/architecture',
      'reference/diploi-yaml',
      'reference/github-action',
      'reference/built-in-email',
      'reference/ai-gateway',
      'reference/glossary',
      {
        label: 'Projects',
        items: [
          'reference/projects/project',
          'reference/projects/project-lifecycle',
        ],
      },
      {
        label: 'Deployments',
        items: [
          'reference/deployments/deployment',
          'reference/deployments/deployment-lifecycle',
        ],
      },
    ],
  },
  {
    label: 'FAQ',
    link: '/faq',
  },
  {
    label: 'Troubleshooting',
    link: '/troubleshooting',
  },
  {
    label: 'Roadmap',
    link: '/roadmap',
  },
  {
    label: 'LLMs',
    collapsed: true,
    items: [
      { label: 'llms.txt', link: '/llms.txt' },
      { label: 'llms-small.txt', link: '/llms-small.txt' },
      { label: 'llms-full.txt', link: '/llms-full.txt' },
    ],
  },
];
