export type DiploiElement = { name: string; identifier: string; type: string; url: string; badge: string; componentTypeID: number; componentID: number; versions: [string]; description: string };

export type DiploiInstance = {
  name: string;
  vCpu: string;
  memoryGiB: string;
  price: number;
};

export type ComponentsAvailable = 'n8n' | 'fastapi' | 'laravel' | 'flask' | 'deno' | 'supabase' | 'next' | 'node' | 'bun' | 'react-vite' | 'astro' | 'sveltekit' | 'nue' | 'ghost' | 'hono' | 'asp' | 'blazor' | 'django' | 'lovable'

export type AddonsAvailable = 'postgres' | 'redis' | 'mongo' | 'mariadb' | 'minio'

export type StarterKitsAvailable = 'openclaw' | 'chat' | 'refine-pixels' | 'web-app'

export type AllElementsAvailable = ComponentsAvailable | AddonsAvailable | StarterKitsAvailable

export type ElementDetails = 'componentID' | 'componentTypeID' | 'name' | 'url' | 'versions' | 'description'

export const ElementType = {
  component: 1,
  addon: 2,
  starter: 3,
} as const;