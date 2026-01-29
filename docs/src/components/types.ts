export type DiploiElement = { name: string; type: string; url: string; badge: string, componentTypeID: number };
export type DiploiInstance = {
  name: string;
  vCpu: string;
  memoryGiB: string;
  price: number;
};
export type ComponentsAvailable = 'n8n' | 'FastAPI' | 'Laravel' | 'Flask' | 'Deno' | 'Supabase' | 'Next.js' | 'Node.js' | 'Bun' | 'React + Vite' | 'Astro' | 'SvelteKit' | 'Nue' | 'Ghost' | 'Hono' | 'Lovable' | 'ASP.NET' | 'Blazor' | 'Django'
export type AddonsAvailable = 'PostgreSQL' | 'Redis' | 'MongoDB' | 'MariaDB' | 'MinIO'

export const ElementType = {
  component: 1,
  addon: 2,
  starter: 3,
} as const;