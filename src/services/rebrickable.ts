import { LegoSet, SetPart, Part, Color } from '../types';

// Use our Cloudflare Pages Function proxy to keep the API key secure
const API_BASE = '/api/rebrickable';

async function fetchFromRebrickable<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Rebrickable API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getSetByNumber(setNum: string): Promise<LegoSet> {
  // Search for the set by number
  const data = await fetchFromRebrickable<{ results: LegoSet[] }>(
    `/sets/?search=${encodeURIComponent(setNum)}`
  );

  if (data.results.length === 0) {
    throw new Error(`Set ${setNum} not found`);
  }

  // Return the first matching set
  return data.results[0];
}

export async function getSetParts(setNum: string): Promise<SetPart[]> {
  // First get the set to find its set_num (Rebrickable ID)
  const set = await getSetByNumber(setNum);

  // Fetch all pages of parts
  const allParts: SetPart[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await fetchFromRebrickable<{
      results: SetPart[];
      next: string | null;
    }>(`/sets/${set.set_num}/parts/?page=${page}`);

    allParts.push(...data.results);
    hasMore = data.next !== null;
    page++;
  }

  return allParts;
}

export async function getPartByNumber(partNum: string): Promise<Part> {
  // Search by part number, element ID, or any identifier
  // Using search parameter because it's more flexible than lego_id
  const data = await fetchFromRebrickable<{ results: Part[] }>(
    `/parts/?search=${encodeURIComponent(partNum)}`
  );

  if (data.results.length === 0) {
    throw new Error(`Part ${partNum} not found`);
  }

  // Return the first matching part
  return data.results[0];
}

export async function searchParts(query: string): Promise<Part[]> {
  const data = await fetchFromRebrickable<{ results: Part[] }>(
    `/parts/?search=${encodeURIComponent(query)}`
  );
  return data.results;
}

export async function getPartColors(partNum: string): Promise<Array<Color & { part_img_url: string; elements: string[] }>> {
  // Get all available colors for a specific part
  const data = await fetchFromRebrickable<{
    results: Array<{
      color_id: number;
      color_name: string;
      num_sets: number;
      num_set_parts: number;
      part_img_url: string;
      elements: string[];
    }>
  }>(`/parts/${encodeURIComponent(partNum)}/colors/`);

  // Transform to Color objects with image URL
  return data.results.map(result => ({
    id: result.color_id,
    name: result.color_name,
    rgb: '000000', // RGB not provided by this endpoint
    is_trans: result.color_name.toLowerCase().includes('trans'),
    part_img_url: result.part_img_url,
    elements: result.elements,
  }));
}

export function extractSetNumberFromQR(qrData: string): string | null {
  const patterns = [
    /\/sets\/(\d+-\d+)/,
    /set[_-]?num[=:](\d+-\d+)/i,
    /(\d{4,5}-\d+)/,
  ];

  for (const pattern of patterns) {
    const match = qrData.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
