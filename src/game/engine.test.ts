import { describe, expect, it } from "vitest";
import {
  BALL_R,
  createGame,
  drainEvents,
  FLOOR,
  GAME_TIME,
  HAND,
  MAX_ANGLE,
  MIN_ANGLE,
  RIM_W,
  aimFromDrag,
  launchVelocity,
  predictPath,
  shoot,
  start,
  step,
  type Game,
} from "./engine";

const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

function newGame(): Game {
  const g = createGame(0, seq(0.5));
  start(g);
  return g;
}

/** Joue un tir jusqu'à son terme (ou 5 s simulées). */
function playShot(g: Game, angle: number, power: number) {
  g.aim = { angle, power };
  shoot(g);
  for (let i = 0; i < 300 && g.ball.flying; i++) step(g, 1 / 60);
  return drainEvents(g);
}

/** Cherche un tir gagnant par balayage, pour vérifier que le panier est atteignable. */
function findWinningShot(hoop: { x: number; y: number }) {
  for (let a = MIN_ANGLE; a <= MAX_ANGLE; a += 0.02) {
    for (let p = 0; p <= 1; p += 0.01) {
      const g = newGame();
      g.hoop = { ...hoop };
      if (playShot(g, a, p).some((e) => e.type === "score")) return { a, p };
    }
  }
  return null;
}

describe("lancer", () => {
  it("part vers la droite et vers le haut, plus vite avec plus de puissance", () => {
    const soft = launchVelocity(0.8, 0.1);
    const hard = launchVelocity(0.8, 0.9);
    expect(soft.vx).toBeGreaterThan(0);
    expect(soft.vy).toBeLessThan(0);
    expect(Math.hypot(hard.vx, hard.vy)).toBeGreaterThan(Math.hypot(soft.vx, soft.vy));
  });

  it("borne l'angle et la puissance", () => {
    expect(launchVelocity(-5, 2)).toEqual(launchVelocity(MIN_ANGLE, 1));
    expect(aimFromDrag(-1000, 1000).power).toBe(1);
    expect(aimFromDrag(0, 0).power).toBe(0);
  });

  it("vise à l'opposé du glisser (lance-pierre)", () => {
    const aim = aimFromDrag(-60, 60); // glisser vers la gauche et le bas
    expect(aim.angle).toBeCloseTo(Math.PI / 4, 5);
  });

  it("prévoit une trajectoire qui s'incurve sous la gravité", () => {
    const path = predictPath(1, 0.7);
    const dy1 = path[1].y - path[0].y;
    const dy2 = path[2].y - path[1].y;
    expect(dy2).toBeGreaterThan(dy1);
  });

  it("refuse de tirer si la balle est déjà en l'air ou hors partie", () => {
    const g = newGame();
    expect(shoot(g)).toBe(true);
    expect(shoot(g)).toBe(false);
    const idle = createGame();
    expect(shoot(idle)).toBe(false);
  });
});

describe("physique et score", () => {
  it("chaque position de panier possible peut être marquée", () => {
    for (const hoop of [
      { x: 270, y: 110 },
      { x: 270, y: 190 },
      { x: 380, y: 110 },
      { x: 380, y: 190 },
      { x: 330, y: 150 },
    ]) {
      expect(findWinningShot(hoop), `panier en ${hoop.x},${hoop.y}`).not.toBeNull();
    }
  });

  it("une balle lâchée au centre du cercle est un « swish »", () => {
    const g = newGame();
    Object.assign(g.ball, { x: g.hoop.x + RIM_W / 2, y: g.hoop.y - 40, vx: 0, vy: 0, flying: true });
    for (let i = 0; i < 60; i++) step(g, 1 / 60);
    const score = drainEvents(g).find((e) => e.type === "score");
    expect(score).toMatchObject({ type: "score", swish: true, streak: 1 });
    expect(g.score).toBeGreaterThanOrEqual(3);
  });

  it("une balle sur le bord du cercle rebondit et touche le cercle", () => {
    const g = newGame();
    Object.assign(g.ball, { x: g.hoop.x, y: g.hoop.y - 40, vx: 0, vy: 0, flying: true });
    for (let i = 0; i < 30; i++) step(g, 1 / 60);
    expect(g.ball.touchedRim || drainEvents(g).some((e) => e.type === "rim")).toBe(true);
  });

  it("rebondit sur le sol sans le traverser", () => {
    const g = newGame();
    Object.assign(g.ball, { x: 40, y: FLOOR - 30, vx: 0, vy: 200, flying: true });
    for (let i = 0; i < 20; i++) {
      step(g, 1 / 60);
      expect(g.ball.y + BALL_R).toBeLessThanOrEqual(FLOOR + 0.001);
    }
  });

  it("enchaîne les combos et les remet à zéro sur un raté", () => {
    const g = newGame();
    const win = findWinningShot(g.hoop)!;
    g.hoop = { x: 330, y: 150 };
    const first = playShot(g, win.a, win.p).find((e) => e.type === "score");
    expect(first).toMatchObject({ streak: 1 });

    g.hoop = { x: 330, y: 150 }; // on remet le panier au même endroit pour rejouer le même tir
    const second = playShot(g, win.a, win.p).find((e) => e.type === "score");
    expect(second).toMatchObject({ streak: 2 });
    expect(second && second.type === "score" && second.points).toBeGreaterThan(
      first && first.type === "score" ? first.points : 0,
    );

    const miss = playShot(g, MIN_ANGLE, 0);
    expect(miss.some((e) => e.type === "miss")).toBe(true);
    expect(g.streak).toBe(0);
  });

  it("déplace le panier après un panier réussi", () => {
    const g = createGame(0, seq(0, 1));
    start(g);
    const before = { ...g.hoop };
    Object.assign(g.ball, { x: g.hoop.x + RIM_W / 2, y: g.hoop.y - 40, vx: 0, vy: 0, flying: true });
    for (let i = 0; i < 300 && g.ball.flying; i++) step(g, 1 / 60);
    expect(g.hoop).not.toEqual(before);
  });
});

describe("chrono", () => {
  it("termine la partie à la sirène et enregistre le record", () => {
    const g = newGame();
    g.score = 12;
    for (let i = 0; i < (GAME_TIME + 1) * 20; i++) step(g, 1 / 20);
    expect(g.phase).toBe("over");
    expect(g.best).toBe(12);
    expect(drainEvents(g).at(-1)).toMatchObject({ type: "over", newBest: true });
  });

  it("compte un tir lancé juste avant la sirène (buzzer beater)", () => {
    const g = newGame();
    g.timeLeft = 0.01;
    Object.assign(g.ball, { x: g.hoop.x + RIM_W / 2, y: g.hoop.y - 60, vx: 0, vy: 0, flying: true });
    for (let i = 0; i < 300 && g.phase === "playing"; i++) step(g, 1 / 60);
    const events = drainEvents(g);
    expect(events.find((e) => e.type === "score")).toMatchObject({ buzzer: true });
    expect(g.phase).toBe("over");
  });

  it("ne bouge plus en pause", () => {
    const g = newGame();
    g.phase = "paused";
    step(g, 1);
    expect(g.timeLeft).toBe(GAME_TIME);
    expect(g.ball.x).toBe(HAND.x);
  });
});
