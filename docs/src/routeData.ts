import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { getCollection } from 'astro:content';
import { compareElements, ELEMENT_TYPES, TYPE_INFO, type ElementType } from './elements/api';

/** Slug of the heading on each overview page under which the <ElementOverview> sections are rendered */
const OVERVIEW_SECTION_SLUG: Record<ElementType, string> = {
  component: 'components',
  addon: 'add-ons',
  starter: 'starter-kits',
};

/** Adds the sections rendered by <ElementOverview> to the table of contents of the overview pages */
export const onRequest = defineRouteMiddleware(async (context) => {
  const { starlightRoute } = context.locals;
  const type = ELEMENT_TYPES.find((candidate) => TYPE_INFO[candidate].directory === starlightRoute.id);
  if (!type || !starlightRoute.toc) return;

  const elements = (await getCollection('elements', ({ data }) => data.type === type && !data.hidden)).map(({ data }) => data).sort(compareElements);
  const parent = starlightRoute.toc.items.find((item) => item.slug === OVERVIEW_SECTION_SLUG[type]);
  if (!parent) return;

  parent.children.push(...elements.map((element) => ({ depth: 3, slug: element.identifier, text: element.name, children: [] })));
});
