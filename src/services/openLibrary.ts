const OL_BASE = "https://openlibrary.org";

export function olCoverUrl(coverId: number | undefined, size: "S" | "M" | "L" = "M"): string {
  if (!coverId) return "";
  return `${OL_BASE}/b/id/${coverId}-${size}.jpg`;
}

export interface OLSearchDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

export interface OLSearchResult {
  docs: OLSearchDoc[];
  numFound: number;
}

export async function searchBooks(
  searchQuery: string,
  page = 1,
  limit = 20,
): Promise<OLSearchResult> {
  const params = new URLSearchParams({
    q: searchQuery,
    page: String(page),
    limit: String(limit),
    fields: "key,title,author_name,first_publish_year,cover_i",
  });
  const res = await fetch(`${OL_BASE}/search.json?${params}`);
  if (!res.ok) throw new Error(`Open Library search failed: ${res.status}`);
  return res.json() as Promise<OLSearchResult>;
}

export async function searchByAuthor(
  author: string,
  page = 1,
  limit = 20,
): Promise<OLSearchResult> {
  const params = new URLSearchParams({
    author,
    page: String(page),
    limit: String(limit),
    fields: "key,title,author_name,first_publish_year,cover_i",
  });
  const res = await fetch(`${OL_BASE}/search.json?${params}`);
  if (!res.ok) throw new Error(`Open Library author search failed: ${res.status}`);
  return res.json() as Promise<OLSearchResult>;
}
