import { describe, expect, it } from "vitest";
import { fetchRepos, isShowcased, languageShares, selectRepos, type RawRepo } from "./github";
import { oppositeTheme, parseTheme } from "./theme";

const raw = (name: string, extra: Partial<RawRepo> = {}): RawRepo => ({
  name,
  description: null,
  html_url: `https://github.com/Louis-ala/${name}`,
  homepage: null,
  stargazers_count: 0,
  pushed_at: "2026-01-01T00:00:00Z",
  fork: false,
  languages_url: `https://api.github.com/repos/Louis-ala/${name}/languages`,
  ...extra,
});

describe("filtre des dépôts GitHub", () => {
  it("exclut forks, portfolio, profil, examens et cours", () => {
    for (const name of ["Louis-ala.github.io", "Louis-ala", "framework-back-exam", "Backend", "py-github-pr", "louis-ala.github.io"]) {
      expect(isShowcased(raw(name)), name).toBe(false);
    }
    expect(isShowcased(raw("formations", { fork: true }))).toBe(false);
    expect(isShowcased(raw("vieux-projet", { archived: true }))).toBe(false);
  });

  it("repère les dépôts de cours par leur nom", () => {
    for (const name of ["algo-tp3", "cours-react", "TP_java", "examen-final"]) expect(isShowcased(raw(name)), name).toBe(false);
    for (const name of ["py-potion-craft-cescosse-alary-sicre-main", "tempest", "computer-graphics"]) expect(isShowcased(raw(name)), name).toBe(true);
  });

  it("trie par étoiles puis par activité récente", () => {
    const sorted = selectRepos([
      raw("a", { pushed_at: "2026-01-01T00:00:00Z" }),
      raw("b", { pushed_at: "2026-06-01T00:00:00Z" }),
      raw("c", { stargazers_count: 5 }),
    ]);
    expect(sorted.map((r) => r.name)).toEqual(["c", "b", "a"]);
  });

  it("récupère les dépôts et leurs langages via l'API", async () => {
    const calls: string[] = [];
    const fake = async (url: string) => {
      calls.push(url);
      const body = url.includes("/users/") ? [raw("Backend"), raw("projet", { description: "", homepage: "" })] : { Python: 10 };
      return { ok: true, status: 200, json: async () => body };
    };
    const repos = await fetchRepos("Louis-ala", fake, "jeton");
    expect(repos).toEqual([
      {
        name: "projet",
        description: null,
        url: "https://github.com/Louis-ala/projet",
        homepage: null,
        stars: 0,
        pushedAt: "2026-01-01T00:00:00Z",
        languages: { Python: 10 },
      },
    ]);
    expect(calls).toHaveLength(2); // Backend exclu : pas d'appel pour ses langages
  });

  it("signale une erreur de l'API", async () => {
    const fail = async () => ({ ok: false, status: 403, json: async () => ({}) });
    await expect(fetchRepos("Louis-ala", fail)).rejects.toThrow("403");
  });

  it("calcule la part de chaque langage", () => {
    expect(languageShares({ CSS: 25, Python: 75 })).toEqual([
      { name: "Python", share: 75 },
      { name: "CSS", share: 25 },
    ]);
    expect(languageShares({})).toEqual([]);
  });
});

describe("thème", () => {
  it("n'accepte que light ou dark", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    for (const invalid of [null, undefined, "", "Dark", "auto", 1]) expect(parseTheme(invalid)).toBeNull();
  });

  it("bascule entre les deux thèmes", () => {
    expect(oppositeTheme("light")).toBe("dark");
    expect(oppositeTheme("dark")).toBe("light");
  });
});
