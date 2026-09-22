/**
 * Overlays are the hand-written parts of a generated element page: `src/content/elements/<identifier>.md`.
 *
 *   ---
 *   description: Page description (also the summary on the overview page unless `summary` is set)
 *   links:
 *     - label: Astro docs
 *       href: https://docs.astro.build/
 *   sidebar: { order: 1 }
 *   ---
 *   Intro, shown before the generated "Add to your project" / "Launch" section.
 *
 *   <!-- more -->
 *
 *   Optional extra sections, shown after it and before the README.
 *
 * Plain Markdown (asides, code fences, tables, images and links relative to the file). `{{package}}`, `{{name}}`,
 * `{{identifier}}`, `{{url}}` and `{{version}}` are replaced with the element's values, `{{package:postgres}}`
 * with another element's.
 */
import { readdir, readFile } from 'node:fs/promises';
import { posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';
import type { Element } from './api';

export const OVERLAYS_DIR = 'src/content/elements';

export const overlayLinkSchema = z.object({ label: z.string(), href: z.string() });

export const overlayFrontmatterSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    /** Short blurb for the overview page; defaults to `description` */
    summary: z.string().optional(),
    links: z.array(overlayLinkSchema).default([]),
    sidebar: z.object({ order: z.number().optional(), label: z.string().optional() }).strict().optional(),
  })
  .strict();

export type OverlayFrontmatter = z.infer<typeof overlayFrontmatterSchema>;

export type Overlay = OverlayFrontmatter & {
  identifier: string;
  /** Path of the overlay file, relative to the project root */
  filePath: string;
  intro: string;
  more: string;
};

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/;
const MORE_MARKER_REGEX = /^[ \t]*<!--\s*more\s*-->[ \t]*$/m;
const PLACEHOLDER_REGEX = /\{\{\s*(package|name|identifier|url|version)(?::([\w.-]+))?\s*\}\}/g;

const parseOverlay = (identifier: string, filePath: string, source: string): Overlay => {
  const match = FRONTMATTER_REGEX.exec(source);
  const frontmatter = match ? parseYaml(match[1]!) ?? {} : {};
  const body = match ? match[2]! : source;

  const parsed = overlayFrontmatterSchema.safeParse(frontmatter);
  if (!parsed.success) {
    throw new Error(`Invalid frontmatter in ${filePath}:\n${parsed.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`).join('\n')}`);
  }

  const [intro = '', more = ''] = body.split(MORE_MARKER_REGEX, 2);
  return { ...parsed.data, identifier, filePath, intro: intro.trim(), more: more.trim() };
};

/** Reads all overlays, keyed by element identifier */
export const loadOverlays = async (root: URL): Promise<Map<string, Overlay>> => {
  const directory = new URL(`${OVERLAYS_DIR}/`, root);
  let files: string[];
  try {
    files = await readdir(directory);
  } catch {
    return new Map();
  }

  const overlays = new Map<string, Overlay>();
  for (const file of files.filter((name) => name.endsWith('.md') && !name.startsWith('_')).sort()) {
    const identifier = file.slice(0, -'.md'.length);
    const source = await readFile(new URL(file, directory), 'utf-8');
    overlays.set(identifier, parseOverlay(identifier, `${OVERLAYS_DIR}/${file}`, source));
  }
  return overlays;
};

export const overlaysDirectoryPath = (root: URL) => fileURLToPath(new URL(`${OVERLAYS_DIR}/`, root));

/** Replaces `{{field}}` / `{{field:identifier}}` placeholders with element values */
export const expandPlaceholders = (text: string, element: Element, elements: Element[]) =>
  text.replace(PLACEHOLDER_REGEX, (placeholder, field: string, identifier?: string) => {
    const target = identifier ? elements.find((candidate) => candidate.identifier === identifier) : element;
    if (!target) throw new Error(`Unknown element "${identifier}" in placeholder ${placeholder} of the ${element.identifier} overlay`);
    switch (field) {
      case 'package':
        return target.package;
      case 'name':
        return target.name;
      case 'identifier':
        return target.identifier;
      case 'url':
        return target.url;
      case 'version':
        return target.versions.at(-1) ?? target.repository.ref;
      default:
        return placeholder;
    }
  });

const MARKDOWN_RELATIVE_URL_REGEX = /(!?\[(?:[^\]\\]|\\.)*\]\()(\.\.?\/[^)\s]*)/g;
const HTML_RELATIVE_URL_REGEX = /(\b(?:src|href)=)(["'])(\.\.?\/.*?)\2/g;

/**
 * Makes urls that are relative to the overlay file relative to the (virtual) file of the generated page instead,
 * which is what Astro resolves images against.
 */
export const rebaseRelativeUrls = (text: string, overlay: Overlay, pageFilePath: string) => {
  const from = posix.dirname(overlay.filePath);
  const to = posix.dirname(pageFilePath);
  const rebase = (url: string) => {
    const rebased = posix.relative(to, posix.join(from, url));
    return rebased.startsWith('.') ? rebased : `./${rebased}`;
  };
  return text
    .replace(MARKDOWN_RELATIVE_URL_REGEX, (_, prefix: string, url: string) => `${prefix}${rebase(url)}`)
    .replace(HTML_RELATIVE_URL_REGEX, (_, prefix: string, quote: string, url: string) => `${prefix}${quote}${rebase(url)}${quote}`);
};
