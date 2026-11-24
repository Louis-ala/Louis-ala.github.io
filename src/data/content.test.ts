import { describe, expect, it } from "vitest";
import * as content from "./content";

const { contacts, education, experience, potionProject, profile, skills } = content;

describe("contenu du portfolio", () => {
  it("ne contient aucune donnée privée du CV", () => {
    const all = JSON.stringify(content);
    for (const secret of ["route du fau", "4349", "28/02/2004", "nicolaslacosse", "LACOSSE"]) {
      expect(all).not.toContain(secret);
    }
  });

  it("mentionne la localisation et la mobilité", () => {
    expect(profile.location).toContain("Toulouse");
    expect(profile.location).toContain("toute la France");
  });

  it("a des liens de contact valides", () => {
    expect(contacts.map((c) => c.label)).toEqual(["E-mail", "Téléphone", "LinkedIn", "GitHub"]);
    for (const c of contacts) {
      expect(c.href).toMatch(/^(mailto:\S+@\S+\.\S+|tel:\+\d{11}|https:\/\/\S+)$/);
      expect(Boolean(c.external)).toBe(c.href.startsWith("https://"));
    }
  });

  it("a un parcours complet", () => {
    expect(experience.length).toBeGreaterThan(0);
    expect(education.length).toBeGreaterThan(0);
    for (const step of [...experience, ...education]) {
      expect(step.period.trim()).not.toBe("");
      expect(step.title.trim()).not.toBe("");
      expect(step.place.trim()).not.toBe("");
    }
  });

  it("n'a pas de compétence en double", () => {
    const items = skills.flatMap((g) => g.items);
    expect(new Set(items).size).toBe(items.length);
  });

  describe("graphique de rentabilité", () => {
    const { top10 } = potionProject;

    it("contient exactement 10 potions distinctes", () => {
      expect(top10).toHaveLength(10);
      expect(new Set(top10.map((p) => p.potion)).size).toBe(10);
    });

    it("est trié par rentabilité décroissante", () => {
      const values = top10.map((p) => p.value);
      expect(values).toEqual([...values].sort((a, b) => b - a));
      expect(values.every((v) => Number.isFinite(v) && v > 0)).toBe(true);
    });

    it("pointe vers le bon dépôt GitHub", () => {
      expect(potionProject.repo).toBe("https://github.com/Louis-ala/py-potion-craft-cescosse-alary-sicre-main");
    });
  });
});
