import { describe, expect, it } from "vitest";
import * as content from "./content";

const { chapters, contacts, inventory, journey, passions, profile, repoExtras, traits } = content;

describe("contenu du portfolio", () => {
  it("ne contient aucune donnée privée du CV", () => {
    const all = JSON.stringify(content);
    for (const secret of ["route du fau", "4349", "28/02/2004", "nicolaslacosse", "LACOSSE"]) {
      expect(all).not.toContain(secret);
    }
  });

  it("mentionne la localisation et la mobilité", () => {
    const stats = profile.stats.map((s) => s.value).join(" ");
    expect(stats).toContain("Toulouse");
    expect(stats).toContain("Toute la France");
    expect(passions.base.detail).toContain("toute la France");
  });

  it("intègre les trois passions annoncées", () => {
    const text = JSON.stringify(passions);
    for (const word of ["Basket", "rugby", "foot", "volley", "Zelda", "Hollow Knight", "énigme", "Tolkien"]) {
      expect(text).toContain(word);
    }
  });

  it("a des liens de contact valides", () => {
    expect(contacts.map((c) => c.label)).toEqual(["E-mail", "Téléphone", "LinkedIn", "GitHub"]);
    for (const c of contacts) {
      expect(c.href).toMatch(/^(mailto:\S+@\S+\.\S+|tel:\+\d{11}|https:\/\/\S+)$/);
      expect(Boolean(c.external)).toBe(c.href.startsWith("https://"));
    }
  });

  it("a des chapitres aux identifiants uniques", () => {
    expect(new Set(chapters.map((c) => c.id)).size).toBe(chapters.length);
  });

  it("raconte un parcours complet, avec défi, actions et enseignement", () => {
    expect(journey.map((s) => s.id)).toEqual(["3r", "ups", "leclerc", "ipi", "celowen"]);
    for (const step of journey) {
      for (const field of [step.period, step.title, step.place, step.challenge, step.takeaway]) expect(field.trim()).not.toBe("");
      expect(step.actions.length).toBeGreaterThan(0);
    }
  });

  it("n'invente pas de chiffres d'impact dans le parcours", () => {
    const text = journey.map((s) => [s.challenge, s.takeaway, ...s.actions].join(" ")).join(" ");
    expect(text).not.toMatch(/\d+\s?%|\+\s?\d+/);
  });

  it("a un inventaire sans doublon, chaque objet relié à un usage réel", () => {
    const items = inventory.flatMap((d) => d.items);
    expect(new Set(items.map((i) => i.name)).size).toBe(items.length);
    for (const i of items) expect(i.usedIn.trim()).not.toBe("");
  });

  it("relie chaque trait à une source", () => {
    for (const t of traits) expect(t.source.trim()).not.toBe("");
  });

  describe("graphique de rentabilité de Potion Craft", () => {
    const data = repoExtras["py-potion-craft-cescosse-alary-sicre-main"].chart!.data;

    it("contient exactement 10 potions distinctes", () => {
      expect(data).toHaveLength(10);
      expect(new Set(data.map((p) => p.potion)).size).toBe(10);
    });

    it("est trié par rentabilité décroissante", () => {
      const values = data.map((p) => p.value);
      expect(values).toEqual([...values].sort((a, b) => b - a));
      expect(values.every((v) => Number.isFinite(v) && v > 0)).toBe(true);
    });
  });
});
