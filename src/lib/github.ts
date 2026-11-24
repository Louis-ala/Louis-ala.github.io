// Récupération des dépôts publics via l'API GitHub.
// Appelée au build (scripts/prerender.mjs, via entry-server) pour pré-rendre les projets,
// puis dans le navigateur pour les rafraîchir. En cas d'échec, les données du build restent.

export type Repo = {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  pushedAt: string;
  languages: Record<string, number>; // octets par langage
};

export type RawRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived?: boolean;
  languages_url: string;
};

/** Dépôts exclus explicitement : portfolio, profil, examens et cours. */
export const EXCLUDED_REPOS = ["Louis-ala.github.io", "Louis-ala", "framework-back-exam", "Backend", "py-github-pr"];

/** Mots qui signalent un dépôt d'examen ou de cours, en plus de la liste explicite. */
const SCHOOL_WORDS = new Set(["exam", "examen", "cours", "tp", "td"]);

export function isShowcased(repo: Pick<RawRepo, "name" | "fork" | "archived">): boolean {
  if (repo.fork || repo.archived) return false;
  const name = repo.name.toLowerCase();
  if (EXCLUDED_REPOS.some((excluded) => excluded.toLowerCase() === name)) return false;
  const words = name.split(/[^a-z0-9]+/);
  return !words.some((w) => SCHOOL_WORDS.has(w) || /^tp\d+$/.test(w));
}

/** Filtre puis trie : étoiles d'abord, activité récente ensuite. */
export function selectRepos(raw: RawRepo[]): RawRepo[] {
  return raw
    .filter(isShowcased)
    .sort((a, b) => b.stargazers_count - a.stargazers_count || b.pushed_at.localeCompare(a.pushed_at));
}

type FetchLike = (input: string, init?: { headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export async function fetchRepos(user: string, fetchImpl: FetchLike = fetch, token?: string): Promise<Repo[]> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetchImpl(`https://api.github.com/users/${user}/repos?per_page=100&type=owner&sort=pushed`, {
    headers,
  });
  if (!res.ok) throw new Error(`GitHub API : ${res.status}`);
  const raw = (await res.json()) as RawRepo[];

  return Promise.all(
    selectRepos(raw).map(async (r) => {
      let languages: Record<string, number> = {};
      try {
        const lr = await fetchImpl(r.languages_url, { headers });
        if (lr.ok) languages = (await lr.json()) as Record<string, number>;
      } catch {
        // langages facultatifs
      }
      return {
        name: r.name,
        description: r.description || null,
        url: r.html_url,
        homepage: r.homepage || null,
        stars: r.stargazers_count,
        pushedAt: r.pushed_at,
        languages,
      };
    }),
  );
}

/** Part de chaque langage, triée, en pourcentage arrondi (pour la barre des cartes). */
export function languageShares(languages: Record<string, number>, max = 4): { name: string; share: number }[] {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  if (!total) return [];
  return Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([name, bytes]) => ({ name, share: Math.max(1, Math.round((bytes / total) * 100)) }));
}

/* ---------- Cache navigateur : limite les appels (60 requêtes/heure sans jeton) ---------- */

const CACHE_KEY = "repos-cache-v1";
const CACHE_TTL = 60 * 60 * 1000;

export async function fetchReposCached(user: string): Promise<Repo[]> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? "null") as { at: number; repos: Repo[] } | null;
    if (cached && Date.now() - cached.at < CACHE_TTL) return cached.repos;
  } catch {
    // stockage indisponible : on appelle l'API
  }
  const repos = await fetchRepos(user);
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos }));
  } catch {
    // pas de cache, tant pis
  }
  return repos;
}
