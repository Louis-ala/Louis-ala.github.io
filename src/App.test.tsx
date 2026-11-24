import { describe, expect, it } from "vitest";
import { render } from "./entry-server";
import { potionProject } from "./data/content";

const html = render();
const count = (re: RegExp) => html.match(re)?.length ?? 0;

describe("rendu de la page", () => {
  it("a un seul titre h1 avec le nom", () => {
    expect(count(/<h1\b/g)).toBe(1);
    expect(html).toMatch(/<h1[^>]*>Louis Alary<\/h1>/);
  });

  it("affiche les sections dans l'ordre", () => {
    const order = ["Projet", "Parcours", "Compétences", "Contact"].map((t) => html.indexOf(`>${t}</h2>`));
    expect(order.every((i) => i > 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
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

  it("sécurise tous les liens qui ouvrent un nouvel onglet", () => {
    const blank = html.match(/<a[^>]*target="_blank"[^>]*>/g) ?? [];
    expect(blank.length).toBeGreaterThan(0);
    for (const a of blank) expect(a).toContain('rel="noopener noreferrer"');
  });

  it("a un bouton de thème accessible", () => {
    const button = html.match(/<button[^>]*data-theme-toggle[^>]*>[\s\S]*?<\/button>/)?.[0] ?? "";
    expect(button).toContain('type="button"');
    expect(button).toContain('aria-pressed="false"');
    expect(button).toContain("Mode sombre"); // nom accessible
  });

  it("affiche une barre par potion du top 10", () => {
    expect(count(/class="chart__bar"/g)).toBe(potionProject.top10.length);
    for (const p of potionProject.top10) expect(html).toContain(p.potion.replace("'", "&#x27;"));
  });
});
