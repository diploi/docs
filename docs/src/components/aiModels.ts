export type AiModel = { id: string; label: string };

/**
 * The models of the Diploi AI Gateway, as the Console lists them (the same list as the pricing page on diploi.com).
 * Runs both at build time and in the browser, so it only uses `fetch`.
 */
export const fetchAiModels = async (apiUrl: string): Promise<AiModel[]> => {
  const response = await fetch(`${apiUrl}/api/trpc/ai.models`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Failed to load AI models: ${response.status} ${response.statusText}`);
  const data = (await response.json())?.result?.data;
  if (!data || data.status !== 'ok') throw new Error(`Failed to load AI models: ${JSON.stringify(data)}`);

  return data.models as AiModel[];
};
