import { describe, expect, it } from "vitest";
import { approach } from "./glow";
import { oppositeTheme, parseTheme } from "./theme";

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

describe("halo", () => {
  it("se rapproche de la cible sans la dépasser", () => {
    const next = approach(0, 100, 0.25);
    expect(next).toBe(25);
    expect(approach(next, 100, 0.25)).toBeGreaterThan(next);
    expect(approach(100, 100)).toBe(100);
  });

  it("converge vers la cible", () => {
    let x = 0;
    for (let i = 0; i < 100; i++) x = approach(x, 300);
    expect(Math.abs(300 - x)).toBeLessThan(0.5);
  });
});
