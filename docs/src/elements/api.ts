/**
 * Components, add-ons and starter kits ("elements") as published by the Diploi Console, plus the public files of
 * their repositories (README, icon). Everything here is fetched at build time; no API key is needed.
 */

export type ElementType = 'component' | 'addon' | 'starter';

export type ElementBadge = 'new' | 'beta';

export type Repository = {
  owner: string;
  repo: string;
  ref: string;
  /** Base url for files on GitHub's web UI, with a trailing slash */
  blobBaseUrl: string;
  /** Base url for raw file contents, with a trailing slash */
  rawBaseUrl: string;
};

export type Element = {
  identifier: string;
  name: string;
  type: ElementType;
  componentID: number;
  description: string;
  features?: string[];
  versions: string[];
  badge?: ElementBadge;
  hidden: boolean;
  /** Repository url as listed by the API, e.g. https://github.com/diploi/component-astro */
  url: string;
  repository: Repository;
  /** The `package` value for `diploi.yaml`: repository url + the newest version */
  package: string;
  iconUrl: string;
  /** Url of the element on diploi.com, when it has a page there */
  launchUrl?: string;
  /** Id of the docs page for this element, e.g. `building/components/astro` */
  pageId: string;
  /** Raw README.md of the repository (unmodified) */
  readme: string;
};

const API_URL = import.meta.env.API_URL || import.meta.env.VITE_API_URL || 'https://console.diploi.com';

const TYPE_BY_ID: Record<number, ElementType> = { 1: 'component', 2: 'addon', 3: 'starter' };

export const ELEMENT_TYPES: ElementType[] = ['component', 'addon', 'starter'];

/** Per-type naming used in generated content and urls */
export const TYPE_INFO: Record<
  ElementType,
  { label: string; directory: string; overview: { title: string; href: string } }
> = {
  component: {
    label: 'component',
    directory: 'building/components',
    overview: { title: 'Using Components', href: '/building/components' },
  },
  addon: {
    label: 'add-on',
    directory: 'building/add-ons',
    overview: { title: 'Using Add-ons', href: '/building/add-ons' },
  },
  starter: {
    label: 'starter kit',
    directory: 'building/starter-kits',
    overview: { title: 'Using Starter Kits', href: '/building/starter-kits' },
  },
};

type ApiElement = {
  componentTypeID: number;
  componentID: number;
  identifier: string;
  name: string;
  description: string;
  features?: string[] | null;
  versions: string[];
  badge?: string | null;
  hidden?: boolean;
  url: string;
};

/** Splits a GitHub repository url (https, git@ or with a #ref) into its parts */
export const parseRepositoryUrl = (repositoryUrl: string): Repository | undefined => {
  try {
    const httpUrl = repositoryUrl.replace(/^git@([^:]+):(.+)$/, 'https://$1/$2');
    const url = new URL(httpUrl);
    if (url.host !== 'github.com') return undefined;

    const [, owner, repoWithSuffix, ...subpathParts] = url.pathname.split('/');
    if (!owner || !repoWithSuffix) return undefined;
    const repo = repoWithSuffix.replace(/\.git$/, '');
    const ref = url.hash.replace(/^#/, '') || 'main';
    const subpath = subpathParts.filter(Boolean).join('/');
    const subpathSegment = subpath ? `${subpath}/` : '';

    return {
      owner,
      repo,
      ref,
      blobBaseUrl: `https://github.com/${owner}/${repo}/blob/${ref}/${subpathSegment}`,
      rawBaseUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${subpathSegment}`,
    };
  } catch {
    return undefined;
  }
};

const fetchText = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.text();
};

const toElement = async (api: ApiElement): Promise<Element> => {
  const type = TYPE_BY_ID[api.componentTypeID];
  if (!type) throw new Error(`Unknown component type ${api.componentTypeID} for "${api.identifier}"`);

  const repository = parseRepositoryUrl(api.url);
  if (!repository) throw new Error(`Cannot parse the repository url "${api.url}" of "${api.identifier}"`);

  const version = api.versions.at(-1) ?? repository.ref;
  const badge = api.badge === 'new' || api.badge === 'beta' ? api.badge : undefined;
  const launchUrl =
    type === 'component'
      ? `https://diploi.com/component/${api.identifier}`
      : type === 'starter'
        ? `https://diploi.com/starter-kit/${api.identifier}`
        : undefined;

  return {
    identifier: api.identifier,
    name: api.name,
    type,
    componentID: api.componentID,
    description: api.description,
    features: api.features ?? undefined,
    versions: api.versions,
    badge,
    hidden: api.hidden === true,
    url: api.url,
    repository,
    package: `${api.url.replace(/#.*$/, '')}#${version}`,
    iconUrl: `https://diploi.b-cdn.net/component/${repository.owner}/${repository.repo}/icon.svg?ref=${repository.ref}`,
    launchUrl,
    pageId: `${TYPE_INFO[type].directory}/${api.identifier}`,
    readme: await fetchText(`${repository.rawBaseUrl}README.md`),
  };
};

let elementsPromise: Promise<Element[]> | undefined;

/**
 * All elements listed by the Console, with their READMEs. Fetched once per process; the content collections and
 * the generated pages share the result.
 */
export const fetchElements = (): Promise<Element[]> => {
  elementsPromise ??= (async () => {
    const response = await fetch(`${API_URL}/api/trpc/stack.listPreviewComponents`);
    if (!response.ok) throw new Error(`Failed to list elements: ${response.status} ${response.statusText}`);
    const {
      result: { data },
    } = await response.json();
    if (!data || data.status !== 'ok') throw new Error(`Failed to list elements: ${JSON.stringify(data)}`);

    return Promise.all((data.components as ApiElement[]).map(toElement));
  })().catch((error) => {
    elementsPromise = undefined; // Let the next call retry
    throw error;
  });
  return elementsPromise;
};

/** Sort order shared by the sidebar (Starlight's autogenerate), the element lists and the overviews */
export const compareElements = (
  a: { identifier: string; order?: number },
  b: { identifier: string; order?: number },
) => {
  const [aOrder, bOrder] = [a.order ?? Infinity, b.order ?? Infinity];
  if (aOrder !== bOrder) return aOrder < bOrder ? -1 : 1;
  return a.identifier.localeCompare(b.identifier, 'en');
};
