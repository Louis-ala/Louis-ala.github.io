// Moteur de « Buzzer Beater » : physique et règles, sans aucun dessin (testable en Node).
// Unités virtuelles : terrain de 480 × 320, temps en secondes. Le rendu met à l'échelle.

export const W = 480;
export const H = 320;
export const FLOOR = 296;
export const GRAVITY = 900;
export const BALL_R = 11;
export const RIM_W = 46; // ouverture du cercle
export const RIM_KNOT = 3; // rayon des extrémités du cercle (points de collision)
export const BOARD_GAP = 6;
export const BOARD_H = 72;
export const HAND = { x: 78, y: 206 } as const; // position de tir
export const GAME_TIME = 30;
export const MIN_ANGLE = 0.35; // ~20°
export const MAX_ANGLE = 1.45; // ~83°
const SPEED_MIN = 260;
const SPEED_MAX = 640;
const SUBSTEP = 1 / 240;
const RESTITUTION_RIM = 0.55;
const RESTITUTION_BOARD = 0.55;
const RESTITUTION_FLOOR = 0.5;
const THREE_POINT_DIST = 250;

export type Phase = "ready" | "playing" | "paused" | "over";

export type GameEvent =
  | { type: "score"; points: number; swish: boolean; streak: number; three: boolean; buzzer: boolean }
  | { type: "miss" }
  | { type: "rim" }
  | { type: "board" }
  | { type: "over"; score: number; best: number; newBest: boolean };

export type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  flying: boolean;
  flightTime: number;
  bounces: number;
  touchedRim: boolean;
  touchedBoard: boolean;
  made: boolean;
  afterBuzzer: boolean; // tiré avant la sirène, encore en l'air quand elle sonne
};

export type Game = {
  phase: Phase;
  ball: Ball;
  hoop: { x: number; y: number }; // x = extrémité avant du cercle, y = hauteur du cercle
  aim: { angle: number; power: number };
  score: number;
  streak: number;
  made: number;
  shots: number;
  best: number;
  timeLeft: number;
  events: GameEvent[];
  rng: () => number;
};

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function handBall(): Ball {
  return {
    x: HAND.x,
    y: HAND.y,
    vx: 0,
    vy: 0,
    flying: false,
    flightTime: 0,
    bounces: 0,
    touchedRim: false,
    touchedBoard: false,
    made: false,
    afterBuzzer: false,
  };
}

export function randomHoop(rng: () => number) {
  return { x: Math.round(270 + rng() * 110), y: Math.round(110 + rng() * 80) };
}

export function createGame(best = 0, rng: () => number = Math.random): Game {
  return {
    phase: "ready",
    ball: handBall(),
    hoop: { x: 330, y: 150 },
    aim: { angle: 0.95, power: 0.6 },
    score: 0,
    streak: 0,
    made: 0,
    shots: 0,
    best,
    timeLeft: GAME_TIME,
    events: [],
    rng,
  };
}

export function start(game: Game): void {
  const best = game.best;
  Object.assign(game, createGame(best, game.rng), { phase: "playing" as Phase });
}

export function launchVelocity(angle: number, power: number) {
  const speed = SPEED_MIN + clamp(power, 0, 1) * (SPEED_MAX - SPEED_MIN);
  const a = clamp(angle, MIN_ANGLE, MAX_ANGLE);
  return { vx: speed * Math.cos(a), vy: -speed * Math.sin(a) };
}

/** Début de trajectoire (sans collisions), pour l'aide à la visée. */
export function predictPath(angle: number, power: number, points = 7, dt = 0.045) {
  const { vx, vy } = launchVelocity(angle, power);
  return Array.from({ length: points }, (_, i) => {
    const t = (i + 1) * dt;
    return { x: HAND.x + vx * t, y: HAND.y + vy * t + 0.5 * GRAVITY * t * t };
  });
}

/** Visée par glisser (lance-pierre) : on tire dans la direction opposée au glisser. */
export function aimFromDrag(dx: number, dy: number) {
  const angle = clamp(Math.atan2(dy, -dx), MIN_ANGLE, MAX_ANGLE);
  const power = clamp(Math.hypot(dx, dy) / 160, 0, 1);
  return { angle, power };
}

export function shoot(game: Game): boolean {
  if (game.phase !== "playing" || game.ball.flying) return false;
  const { vx, vy } = launchVelocity(game.aim.angle, game.aim.power);
  Object.assign(game.ball, handBall(), { vx, vy, flying: true });
  game.shots++;
  return true;
}

function collideKnot(game: Game, kx: number, ky: number) {
  const b = game.ball;
  const dx = b.x - kx;
  const dy = b.y - ky;
  const dist = Math.hypot(dx, dy);
  const min = BALL_R + RIM_KNOT;
  if (dist >= min || dist === 0) return;
  const nx = dx / dist;
  const ny = dy / dist;
  b.x = kx + nx * min;
  b.y = ky + ny * min;
  const vn = b.vx * nx + b.vy * ny;
  if (vn < 0) {
    b.vx -= (1 + RESTITUTION_RIM) * vn * nx;
    b.vy -= (1 + RESTITUTION_RIM) * vn * ny;
    b.vx *= 0.92;
    if (!b.touchedRim) game.events.push({ type: "rim" });
    b.touchedRim = true;
  }
}

function substep(game: Game, dt: number) {
  const b = game.ball;
  const { hoop } = game;
  const prevY = b.y;

  b.vy += GRAVITY * dt;
  b.x += b.vx * dt;
  b.y += b.vy * dt;

  // Cercle : deux points de collision (avant et arrière).
  collideKnot(game, hoop.x, hoop.y);
  collideKnot(game, hoop.x + RIM_W, hoop.y);

  // Planche verticale derrière le cercle.
  const boardX = hoop.x + RIM_W + BOARD_GAP;
  if (b.vx > 0 && b.x + BALL_R > boardX && b.x < boardX && b.y > hoop.y - BOARD_H && b.y < hoop.y + 8) {
    b.x = boardX - BALL_R;
    b.vx = -b.vx * RESTITUTION_BOARD;
    if (!b.touchedBoard) game.events.push({ type: "board" });
    b.touchedBoard = true;
  }

  // Panier : le centre de la balle traverse le plan du cercle vers le bas, entre les deux bords.
  if (!b.made && b.vy > 0 && prevY < hoop.y && b.y >= hoop.y && b.x > hoop.x + RIM_KNOT && b.x < hoop.x + RIM_W - RIM_KNOT) {
    b.made = true;
    const streak = game.streak + 1;
    const swish = !b.touchedRim && !b.touchedBoard;
    const three = hoop.x + RIM_W / 2 - HAND.x >= THREE_POINT_DIST;
    const points = (three ? 3 : 2) + (swish ? 1 : 0) + (streak - 1);
    game.streak = streak;
    game.made++;
    game.score += points;
    game.events.push({ type: "score", points, swish, streak, three, buzzer: b.afterBuzzer });
  }

  // Sol.
  if (b.y + BALL_R > FLOOR && b.vy > 0) {
    b.y = FLOOR - BALL_R;
    b.vy = -b.vy * RESTITUTION_FLOOR;
    b.vx *= 0.8;
    b.bounces++;
  }
}

function endShot(game: Game) {
  const b = game.ball;
  if (b.made) game.hoop = randomHoop(game.rng);
  else {
    game.streak = 0;
    game.events.push({ type: "miss" });
  }
  game.ball = handBall();
  if (game.timeLeft <= 0) finish(game);
}

function finish(game: Game) {
  game.phase = "over";
  const newBest = game.score > game.best;
  if (newBest) game.best = game.score;
  game.events.push({ type: "over", score: game.score, best: game.best, newBest });
}

/** Avance la partie de `dt` secondes (dt est borné pour encaisser un onglet qui ralentit). */
export function step(game: Game, dt: number): void {
  if (game.phase !== "playing") return;
  const delta = Math.min(dt, 1 / 20);

  if (game.timeLeft > 0) {
    game.timeLeft = Math.max(0, game.timeLeft - delta);
    if (game.timeLeft === 0) {
      if (game.ball.flying) game.ball.afterBuzzer = true; // le tir en l'air compte encore
      else return finish(game);
    }
  }

  const b = game.ball;
  if (!b.flying) return;
  b.flightTime += delta;
  for (let t = 0; t < delta; t += SUBSTEP) substep(game, Math.min(SUBSTEP, delta - t));

  const out = b.x - BALL_R > W || b.x + BALL_R < 0;
  if (out || b.bounces >= 2 || b.flightTime > 4) endShot(game);
}

/** Vide et renvoie les événements survenus depuis le dernier appel. */
export function drainEvents(game: Game): GameEvent[] {
  return game.events.splice(0);
}
