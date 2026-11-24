import { describe, expect, it } from "vitest";
import { render } from "./entry-server";
import { chapters, repoExtras } from "./data/content";
import type { Repo } from "./lib/github";

const potion: Repo = {
  name: "py-potion-craft-cescosse-alary-sicre-main",
  description: null,
  url: "https://github.com/Louis-ala/py-potion-craft-cescosse-alary-sicre-main",
  homepage: null,
  stars: 0,
  pushedAt: "2026-11-24T10:43:12Z",
  languages: { Python: 9000, CSS: 1000 },
};
const other: Repo = { ...potion, name: "mon-projet-cool", description: "Un autre projet", url: "https://github.com/Louis-ala/mon-projet-cool", homepage: "https://exemple.fr" };

const html = render([potion, other]);
const count = (re: RegExp) => html.match(re)?.length ?? 0;

describe("rendu pré-calculé de la page", () => {
  it("a un seul titre h1 avec le nom", () => {
    expect(count(/<h1\b/g)).toBe(1);
    expect(html).toMatch(/<h1[^>]*>Louis<br\/?>.*Alary/);
  });

  it("contient tous les chapitres, dans l'ordre, avec leurs ancres", () => {
    const positions = chapters.map((c) => html.indexOf(`id="${c.id}"`));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("propose une navigation par marque-pages vers chaque chapitre", () => {
    expect(html).toMatch(/<nav[^>]*aria-label="Chapitres"/);
    for (const c of chapters) expect(html).toContain(`href="#${c.id}"`);
  });

  it("a un lien d'évitement vers le contenu principal", () => {
    expect(html).toContain('href="#contenu"');
    expect(html).toMatch(/<main[^>]*id="contenu"/);
  });

  it("décrit la photo et fixe ses dimensions", () => {
    const img = html.match(/<img[^>]*>/)?.[0] ?? "";
    expect(img).toMatch(/alt="Portrait de Louis Alary[^"]*"/);
    expect(img).toMatch(/width="\d+"/);
    expect(img).toMatch(/height="\d+"/);
  });

  it("pré-rend les projets GitHub, enrichis pour Potion Craft", () => {
    expect(html).toContain("Potion Craft");
    expect(html).toContain(repoExtras[potion.name].contributionTitle!.replace("'", "&#x27;"));
    expect(html).toContain("Mon Projet Cool");
    expect(html).toContain('href="https://exemple.fr"'); // démo
    expect(count(/data-magic="/g)).toBeGreaterThanOrEqual(10);
  });

  it("affiche un message d'attente sans dépôts", () => {
    expect(render([])).toContain("Chargement des quêtes depuis GitHub");
  });

  it("sécurise tous les liens qui ouvrent un nouvel onglet", () => {
    const blank = html.match(/<a[^>]*target="_blank"[^>]*>/g) ?? [];
    expect(blank.length).toBeGreaterThan(0);
    for (const a of blank) expect(a).toContain('rel="noopener noreferrer"');
  });

  it("a un bouton « Changer le thème » accessible", () => {
    expect(html).toMatch(/<button[^>]*aria-pressed="false"[^>]*>[\s\S]*?Changer le thème/);
  });

  it("propose le mini-jeu sans le charger d'avance", () => {
    expect(html).toContain("Buzzer Beater");
    expect(html).not.toContain("<canvas");
  });

  it("donne un nom à chaque bouton", () => {
    const buttons = html.match(/<button[\s\S]*?<\/button>/g) ?? [];
    for (const b of buttons) expect(b.replace(/<[^>]+>/g, "").trim().length, b).toBeGreaterThan(0);
  });
});
