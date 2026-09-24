import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import { docsElementSchema, docsWithElementsLoader, elementSchema, elementsLoader } from './elements/loaders';

export const collections = {
  // Starlight's docs, plus a generated page for every component, add-on and starter kit (see src/elements)
  docs: defineCollection({ loader: docsWithElementsLoader(), schema: docsSchema({ extend: docsElementSchema }) }),
  // The components, add-ons and starter kits listed by the Diploi Console
  elements: defineCollection({ loader: elementsLoader(), schema: elementSchema }),
};
