/**
 * Prepares a repository README for embedding in a docs page: drops the parts that only make sense on GitHub (icon,
 * title, badges), turns GitHub alerts into Starlight asides, points relative links back at the repository, and lifts
 * the "Links" section out so that it can be merged into the page's "See also" list.
 */
import type { Blockquote, Html, Link, Nodes, Paragraph, Root, RootContent } from 'mdast';
import type { ContainerDirective } from 'mdast-util-directive';
import { toString } from 'mdast-util-to-string';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import type { Repository } from './api';

export type ReadmeLink = { label: string; href: string };

export type CleanedReadme = {
  /** The README as Markdown, empty when nothing but the title and badges was there */
  markdown: string;
  /** Links from the README's "Links" section, without the ones pointing at docs.diploi.com */
  links: ReadmeLink[];
};

const ICON_SRC_REGEX = /^(?:\.\/)?\.diploi\/icon\.svg$/;
const BADGE_URL_PREFIXES = [
  'https://diploi.com/launch.svg',
  'https://diploi.com/component.svg',
  'https://badgen.net/',
  'https://img.shields.io/',
];
const DOCS_URL_PREFIX = 'https://docs.diploi.com';
/** Heading of a README section that is just a list of links; an emoji may precede it */
const LINKS_HEADING_REGEX = /^\P{L}*(links?|docs|documentation|resources|see also)$/iu;
const HTML_URL_ATTRIBUTE_REGEX = /\b(src|href)=(["'])(.*?)\2/g;

/** GitHub alerts (`> [!NOTE]`) and the Starlight aside each becomes */
const GITHUB_ALERTS: Record<string, { name: string; title?: string }> = {
  NOTE: { name: 'note' },
  TIP: { name: 'tip' },
  IMPORTANT: { name: 'tip', title: 'Important' },
  WARNING: { name: 'caution' },
  CAUTION: { name: 'danger' },
};
const GITHUB_ALERT_REGEX = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\n|$)/i;

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkStringify, { bullet: '-', emphasis: '_', strong: '*', fences: true, rule: '-', listItemIndent: 'one' });

const isRelativeUrl = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return false;
  return !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);
};

/** Resolves a repository-relative url against GitHub (blob urls for links, raw urls for images) */
const resolveRepositoryUrl = (url: string, repository: Repository, kind: 'link' | 'image') => {
  const base = kind === 'image' ? repository.rawBaseUrl : repository.blobBaseUrl;
  try {
    return new URL(url.trim().replace(/^\/+/, ''), base).toString();
  } catch {
    return url;
  }
};

const isBadgeUrl = (url: string) => BADGE_URL_PREFIXES.some((prefix) => url.startsWith(prefix));

const isIconHtml = (node: Html) => {
  const match = /<img\b[^>]*\bsrc=(["'])(.*?)\1/.exec(node.value);
  return match !== null && ICON_SRC_REGEX.test(match[2]!);
};

/** Removes badge images (and the links wrapping them) from a paragraph; returns true when the paragraph is left empty */
const stripBadges = (paragraph: Paragraph) => {
  paragraph.children = paragraph.children.filter((child) => {
    if (child.type === 'image') return !isBadgeUrl(child.url);
    if (child.type === 'link') {
      const images = child.children.filter((grandchild) => grandchild.type === 'image');
      const onlyBadges = images.length > 0 && images.length === child.children.length && images.every((image) => isBadgeUrl(image.url));
      return !onlyBadges;
    }
    return true;
  });
  return toString(paragraph).trim() === '';
};

/** The Starlight aside for a blockquote written as a GitHub alert, or undefined for an ordinary blockquote */
const toAside = (blockquote: Blockquote): ContainerDirective | undefined => {
  const paragraph = blockquote.children[0];
  const marker = paragraph?.type === 'paragraph' ? paragraph.children[0] : undefined;
  if (!paragraph || paragraph.type !== 'paragraph' || marker?.type !== 'text') return undefined;
  const match = GITHUB_ALERT_REGEX.exec(marker.value);
  if (!match) return undefined;
  const aside = GITHUB_ALERTS[match[1]!.toUpperCase()]!;

  // Drop the `[!NOTE]` line: the marker text, and the hard break GitHub allows after it
  marker.value = marker.value.slice(match[0].length);
  if (marker.value === '') paragraph.children.shift();
  if (paragraph.children[0]?.type === 'break') paragraph.children.shift();
  const children = paragraph.children.length > 0 ? blockquote.children : blockquote.children.slice(1);

  const label: Paragraph[] = aside.title ? [{ type: 'paragraph', data: { directiveLabel: true }, children: [{ type: 'text', value: aside.title }] }] : [];
  return { type: 'containerDirective', name: aside.name, attributes: {}, children: [...label, ...children] };
};

/**
 * Splits a section that is nothing but a list of links ("Links", "Docs", …) out of the document, so that its links
 * can be merged into the page's "See also" list. A section holding anything else is left where it is.
 */
const extractLinksSection = (children: RootContent[]): { rest: RootContent[]; links: ReadmeLink[] } => {
  const start = children.findIndex((node) => node.type === 'heading' && LINKS_HEADING_REGEX.test(toString(node).trim()));
  if (start === -1) return { rest: children, links: [] };

  const depth = (children[start] as { depth: number }).depth;
  let end = children.length;
  for (let index = start + 1; index < children.length; index++) {
    const node = children[index]!;
    if (node.type === 'heading' && node.depth <= depth) {
      end = index;
      break;
    }
  }

  // Only lift the section out when every list item is a link and nothing else, so that no text is lost
  const section = children.slice(start + 1, end);
  const links: ReadmeLink[] = [];
  for (const node of section) {
    if (node.type !== 'list') return { rest: children, links: [] };
    for (const item of node.children) {
      const itemLinks: Link[] = [];
      visit(item as Nodes, 'link', (link: Link) => void itemLinks.push(link));
      if (itemLinks.length === 0 || toString(item).trim() !== itemLinks.map((link) => toString(link).trim()).join(' ')) {
        return { rest: children, links: [] };
      }
      for (const link of itemLinks) {
        if (link.url.startsWith(DOCS_URL_PREFIX)) continue;
        links.push({ label: toString(link).trim() || link.url, href: link.url });
      }
    }
  }

  return { rest: [...children.slice(0, start), ...children.slice(end)], links };
};

export const cleanReadme = (readme: string, repository: Repository): CleanedReadme => {
  const tree = processor.parse(readme) as Root;

  // Repository icon and title: the docs page has its own
  tree.children = tree.children.filter((node) => !(node.type === 'html' && isIconHtml(node)));
  const titleIndex = tree.children.findIndex((node) => node.type === 'heading' && node.depth === 1);
  if (titleIndex !== -1) tree.children.splice(titleIndex, 1);

  // Badges
  tree.children = tree.children.filter((node) => !(node.type === 'paragraph' && stripBadges(node)));
  visit(tree, 'paragraph', (paragraph) => {
    paragraph.children = paragraph.children.filter((child) => !(child.type === 'html' && isIconHtml(child)));
  });

  const { rest, links } = extractLinksSection(tree.children);
  tree.children = rest;

  // GitHub alerts become asides
  visit(tree, 'blockquote', (blockquote, index, parent) => {
    const aside = toAside(blockquote);
    if (aside && parent && index !== undefined) parent.children[index] = aside;
  });

  // Relative urls point at files in the repository
  visit(tree, ['link', 'image', 'definition'], (node) => {
    if (!('url' in node) || !isRelativeUrl(node.url)) return;
    node.url = resolveRepositoryUrl(node.url, repository, node.type === 'image' ? 'image' : 'link');
  });
  visit(tree, 'html', (node) => {
    node.value = node.value.replace(HTML_URL_ATTRIBUTE_REGEX, (match, attribute: string, quote: string, url: string) => {
      if (!isRelativeUrl(url)) return match;
      return `${attribute}=${quote}${resolveRepositoryUrl(url, repository, attribute === 'src' ? 'image' : 'link')}${quote}`;
    });
  });

  // The README is embedded under a level 2 heading of the page
  visit(tree, 'heading', (heading) => {
    heading.depth = Math.min(6, heading.depth + 1) as typeof heading.depth;
  });

  const markdown = toString(tree).trim() === '' && !tree.children.some((node) => node.type === 'html') ? '' : String(processor.stringify(tree)).trim();

  return { markdown, links };
};
