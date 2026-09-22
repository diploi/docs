/**
 * The generated docs page of an element, as Markdown: overlay intro, how to add or launch it, overlay extras, the
 * repository README and a "See also" list.
 */
import { TYPE_INFO, type Element } from './api';
import { expandPlaceholders, rebaseRelativeUrls, type Overlay } from './overlays';
import { cleanReadme, type ReadmeLink } from './readme';

export type ElementPage = {
  markdown: string;
  /** Where the page would live in the docs collection (it does not exist on disk); relative urls resolve against it */
  filePath: string;
  data: {
    title: string;
    description: string;
    sidebar: {
      order?: number;
      label?: string;
      /** Attributes of the sidebar link; carries the icon (drawn by a rule in src/styles/custom.css) */
      attrs: { 'data-element': string; style: string };
    };
    element: {
      identifier: string;
      type: Element['type'];
      name: string;
      iconUrl: string;
      url: string;
      package: string;
      launchUrl?: string;
    };
  };
};

const yaml = (code: string) => '```yaml\n' + code.trim() + '\n```';

const listKey = (element: Element) => (element.type === 'addon' ? 'addons' : 'components');

/** A component other than the element itself, to show importing the element's ENV */
const sampleImporter = (element: Element, elements: Element[]) =>
  elements.find((candidate) => candidate.identifier === (element.identifier === 'bun' ? 'node' : 'bun')) ??
  elements.find((candidate) => candidate.type === 'component' && candidate.identifier !== element.identifier);

const addToProjectSection = (element: Element, elements: Element[]) => {
  const { name, identifier } = element;
  const label = TYPE_INFO[element.type].label;
  const entry = yaml(`
${listKey(element)}:
  - name: ${name}
    identifier: ${identifier}
    package: ${element.package}`);

  const notes: string[] = [];
  if (element.type === 'component') {
    notes.push(`- If the folder of the component in your repository is not named \`${identifier}\`, add a \`folder\` parameter with the name of the folder.`);
    notes.push(
      `- Import the environment variables of add-ons, such as a database, into the component with [\`env.include\`](/reference/diploi-yaml#env) in \`diploi.yaml\`:`,
      '',
      yaml(`
components:
  - name: ${name}
    identifier: ${identifier}
    package: ${element.package}
    env:
      include:
        - postgres.*`),
    );
  } else {
    const importer = sampleImporter(element, elements);
    notes.push(
      `- Components can import the environment variables of this ${label} with [\`env.include\`](/reference/diploi-yaml#env) in \`diploi.yaml\`:`,
      '',
      yaml(`
components:
  - name: ${importer?.name ?? 'Bun'}
    identifier: ${importer?.identifier ?? 'bun'}
    package: ${importer?.package ?? 'https://github.com/diploi/component-bun#main'}
    env:
      include:
        - ${identifier}.*`),
    );
  }

  return [
    '## Add to your project',
    '',
    `Paste this entry into the \`${listKey(element)}\` list in \`diploi.yaml\` to add ${name} to your project.`,
    '',
    entry,
    '',
    ':::note',
    ...notes,
    ':::',
  ].join('\n');
};

const launchSection = (element: Element) =>
  [
    '## Launch',
    '',
    `[Launch ${element.name} on Diploi](${element.launchUrl}) to create a new project from this starter kit. Like any Diploi project, it can be extended with more [components](/building/components) and [add-ons](/building/add-ons) through its \`diploi.yaml\` file.`,
  ].join('\n');

const seeAlsoSection = (element: Element, overlayLinks: ReadmeLink[], readmeLinks: ReadmeLink[]) => {
  const { name, type } = element;
  const { label, overview } = TYPE_INFO[type];
  const links: ReadmeLink[] = [
    { label: overview.title, href: overview.href },
    { label: `${name} ${label} repository`, href: element.url },
    ...(type === 'component' && element.launchUrl ? [{ label: `${name} on diploi.com`, href: element.launchUrl }] : []),
    ...overlayLinks,
    ...readmeLinks,
    { label: 'Learn more about the `diploi.yaml` file', href: '/reference/diploi-yaml' },
  ];

  // The overlay and the README may link the same thing (first one wins)
  const seen = new Set<string>();
  const unique = links.filter(({ label, href }) => {
    const keys = [href.replace(/\/$/, ''), label.trim().toLowerCase()];
    if (keys.some((key) => seen.has(key))) return false;
    keys.forEach((key) => seen.add(key));
    return true;
  });

  return ['## See also', '', ...unique.map(({ label, href }) => `- [${label}](${href})`)].join('\n');
};

export const buildElementPage = (element: Element, overlay: Overlay | undefined, elements: Element[]): ElementPage => {
  const filePath = `src/content/docs/${element.pageId}.md`;
  const readme = cleanReadme(element.readme, element.repository);
  const expand = (text: string) => expandPlaceholders(overlay ? rebaseRelativeUrls(text, overlay, filePath) : text, element, elements);

  const sections = [
    overlay?.intro ? expand(overlay.intro) : '',
    element.type === 'starter' ? launchSection(element) : addToProjectSection(element, elements),
    overlay?.more ? expand(overlay.more) : '',
    readme.markdown ? `## Readme\n\n${readme.markdown}` : '',
    seeAlsoSection(element, overlay?.links ?? [], readme.links),
  ];

  const { label } = TYPE_INFO[element.type];
  return {
    markdown: sections.filter(Boolean).join('\n\n') + '\n',
    filePath,
    data: {
      title: overlay?.title ?? element.name,
      description: overlay?.description ?? element.description ?? `${element.name} ${label} for Diploi`,
      sidebar: {
        ...(overlay?.sidebar?.order !== undefined ? { order: overlay.sidebar.order } : {}),
        ...(overlay?.sidebar?.label ? { label: overlay.sidebar.label } : {}),
        attrs: { 'data-element': element.identifier, style: `--element-icon: url("${element.iconUrl}")` },
      },
      element: {
        identifier: element.identifier,
        type: element.type,
        name: element.name,
        iconUrl: element.iconUrl,
        url: element.url,
        package: element.package,
        ...(element.launchUrl ? { launchUrl: element.launchUrl } : {}),
      },
    },
  };
};
