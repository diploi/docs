import { basename } from 'node:path';
import { docsLoader } from '@astrojs/starlight/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import { z } from 'astro/zod';
import { fetchElements, type Element } from './api';
import { loadOverlays, overlayLinkSchema, overlaysDirectoryPath, type Overlay } from './overlays';
import { buildElementPage } from './page';

/** Schema of the `elements` collection: what the Console lists, plus the overlay metadata */
export const elementSchema = z.object({
  identifier: z.string(),
  name: z.string(),
  type: z.enum(['component', 'addon', 'starter']),
  componentID: z.number(),
  description: z.string(),
  /** Short blurb for lists and overviews */
  summary: z.string(),
  features: z.array(z.string()).optional(),
  versions: z.array(z.string()),
  hidden: z.boolean(),
  url: z.string(),
  package: z.string(),
  iconUrl: z.string(),
  launchUrl: z.string().optional(),
  /** Id of the docs page, e.g. `building/components/astro` */
  pageId: z.string(),
  order: z.number().optional(),
  links: z.array(overlayLinkSchema),
});

/** Fields the generated docs pages add to Starlight's frontmatter schema */
export const docsElementSchema = z.object({
  element: z
    .object({
      identifier: z.string(),
      type: z.enum(['component', 'addon', 'starter']),
      name: z.string(),
      iconUrl: z.string(),
      url: z.string(),
      package: z.string(),
      launchUrl: z.string().optional(),
    })
    .optional(),
});

const elementData = (element: Element, overlay: Overlay | undefined): z.input<typeof elementSchema> => ({
  identifier: element.identifier,
  name: overlay?.title ?? element.name,
  type: element.type,
  componentID: element.componentID,
  description: overlay?.description ?? element.description,
  summary: overlay?.summary ?? overlay?.description ?? element.description,
  features: element.features,
  versions: element.versions,
  hidden: element.hidden,
  url: element.url,
  package: element.package,
  iconUrl: element.iconUrl,
  launchUrl: element.launchUrl,
  pageId: element.pageId,
  order: overlay?.sidebar?.order,
  links: overlay?.links ?? [],
});

/** Loads the components, add-ons and starter kits listed by the Diploi Console into the `elements` collection */
export function elementsLoader(): Loader {
  return {
    name: 'diploi-elements',
    load: async ({ store, parseData, logger, config }) => {
      const elements = await fetchElements();
      const overlays = await loadOverlays(config.root);

      store.clear();
      for (const element of elements) {
        const data = await parseData({ id: element.identifier, data: elementData(element, overlays.get(element.identifier)) });
        store.set({ id: element.identifier, data });
      }
      logger.info(`Loaded ${elements.length} elements from the Diploi Console`);
    },
  };
}

/** A docs entry created by this loader (as opposed to one loaded from a file in `src/content/docs`) */
const isGeneratedEntry = (entry: { data: Record<string, unknown> }) => entry.data.element !== undefined;

/**
 * Starlight's docs loader, plus a generated page for every element that has no page of its own in
 * `src/content/docs`. Hand-written content for generated pages lives in `src/content/elements` (see overlays.ts).
 */
export function docsWithElementsLoader(): Loader {
  const base = docsLoader();

  return {
    name: 'diploi-docs',
    load: async (context: LoaderContext) => {
      const { store, logger, parseData, renderMarkdown, generateDigest, config, watcher } = context;

      // The glob loader drops every entry it did not touch, so generated pages from the previous run are gone after
      // it; keep a copy in case the elements cannot be refreshed in dev
      const previous = store.entries().filter(([, entry]) => isGeneratedEntry(entry));
      await base.load(context);

      let elements: Element[];
      let overlays: Map<string, Overlay>;
      try {
        elements = await fetchElements();
        overlays = await loadOverlays(config.root);
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        logger.warn(`Could not load the elements (${(error as Error).message}), keeping the generated pages of the previous run`);
        for (const [, entry] of previous) store.set(entry);
        return;
      }

      const generatePage = async (element: Element) => {
        const overlay = overlays.get(element.identifier);
        const page = buildElementPage(element, overlay, elements);
        const data = await parseData({ id: element.pageId, data: page.data });
        // The page gets a (virtual) file path inside the docs collection: Starlight's sidebar groups pages by it,
        // its Markdown plugins (asides, heading links) only run for files in the collection, and images in the
        // overlay are resolved against it
        const rendered = await renderMarkdown(page.markdown, { fileURL: new URL(page.filePath, config.root) });
        store.set({
          id: element.pageId,
          data,
          body: page.markdown,
          filePath: page.filePath,
          digest: generateDigest(page.markdown),
          rendered,
          assetImports: rendered.metadata?.imagePaths,
        });
      };

      let generated = 0;
      for (const element of elements) {
        if (element.hidden) continue;
        if (store.has(element.pageId)) {
          logger.info(`Not generating "${element.pageId}", a page for it exists in src/content/docs`);
          continue;
        }
        await generatePage(element);
        generated++;
      }
      logger.info(`Generated ${generated} element pages`);

      if (!watcher) return;

      // Regenerate a page when its overlay changes
      const directory = overlaysDirectoryPath(config.root);
      watcher.add(directory);
      const onOverlayChange = async (changedPath: string) => {
        if (!changedPath.startsWith(directory) || !changedPath.endsWith('.md')) return;
        const element = elements.find((candidate) => candidate.identifier === basename(changedPath, '.md'));
        if (!element || element.hidden) return;
        const existing = store.get(element.pageId);
        if (existing && !isGeneratedEntry(existing)) return;
        try {
          overlays = await loadOverlays(config.root);
          await generatePage(element);
          logger.info(`Regenerated "${element.pageId}"`);
        } catch (error) {
          logger.error(`Could not regenerate "${element.pageId}": ${(error as Error).message}`);
        }
      };
      watcher.on('change', onOverlayChange);
      watcher.on('add', onOverlayChange);
      watcher.on('unlink', onOverlayChange);
    },
  };
}
