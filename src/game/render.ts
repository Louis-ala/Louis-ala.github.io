// Rendu Canvas de « Buzzer Beater ». Lit l'état du moteur, ne le modifie jamais.
import { BALL_R, BOARD_GAP, BOARD_H, FLOOR, H, HAND, RIM_KNOT, RIM_W, W, predictPath, type Game } from "./engine";

export type Palette = { bg: string; line: string; fg: string; muted: string; gold: string; court: string; violet: string; ball: string };

export type Fx = {
  trail: { x: number; y: number }[];
  particles: { x: number; y: number; text: string; age: number; color: string }[];
  net: number; // ondulation du filet, 1 → 0
  shake: number; // amplitude de secousse en px virtuels
  spin: number; // rotation de la balle
  reduced: boolean;
};

export const createFx = (reduced: boolean): Fx => ({ trail: [], particles: [], net: 0, shake: 0, spin: 0, reduced });

/** Résout une couleur de jeton (qui peut être en light-dark()) en couleur calculée. */
export function readPalette(el: HTMLElement): Palette {
  const probe = document.createElement("span");
  el.appendChild(probe);
  const read = (token: string) => {
    probe.style.color = `var(--color-${token})`;
    return getComputedStyle(probe).color;
  };
  const palette = {
    bg: read("surface"),
    line: read("line"),
    fg: read("fg"),
    muted: read("muted"),
    gold: read("gold"),
    court: read("court"),
    violet: read("violet"),
    ball: read("ball"),
  };
  probe.remove();
  return palette;
}

/** Fait vieillir les effets ; renvoie vrai s'il reste quelque chose à animer. */
export function updateFx(fx: Fx, game: Game, dt: number): boolean {
  const b = game.ball;
  if (b.flying && !fx.reduced) {
    fx.trail.push({ x: b.x, y: b.y });
    if (fx.trail.length > 10) fx.trail.shift();
  } else fx.trail.length = 0;
  if (b.flying) fx.spin += (b.vx / BALL_R) * dt;

  for (const p of fx.particles) p.age += dt;
  fx.particles = fx.particles.filter((p) => p.age < 1.1);
  fx.net = Math.max(0, fx.net - dt * 2.2);
  fx.shake = Math.max(0, fx.shake - dt * 30);
  return fx.particles.length > 0 || fx.net > 0 || fx.shake > 0;
}

export function draw(ctx: CanvasRenderingContext2D, game: Game, fx: Fx, c: Palette, scale: number, dpr: number) {
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  ctx.clearRect(0, 0, W, H);

  ctx.save();
  if (fx.shake > 0 && !fx.reduced) ctx.translate((Math.random() - 0.5) * fx.shake, (Math.random() - 0.5) * fx.shake);

  // Terrain : parquet, ligne de fond, repère de tir.
  ctx.fillStyle = c.bg;
  ctx.fillRect(-10, -10, W + 20, H + 20);
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, FLOOR);
  ctx.lineTo(W, FLOOR);
  ctx.stroke();
  for (let x = 24; x < W; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, FLOOR + 6);
    ctx.lineTo(x + 20, FLOOR + 6);
    ctx.stroke();
  }
  ctx.fillStyle = c.court;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.ellipse(HAND.x, FLOOR, 26, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  drawHoop(ctx, game, fx, c);
  drawAim(ctx, game, c);
  drawBall(ctx, game, fx, c);

  // Textes « +3 », « Swish ! » qui montent et s'effacent.
  ctx.textAlign = "center";
  for (const p of fx.particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.age / 1.1);
    ctx.fillStyle = p.color;
    ctx.font = `${p.text.startsWith("+") ? 22 : 14}px Silkscreen, monospace`;
    ctx.fillText(p.text, p.x, p.y - (fx.reduced ? 0 : p.age * 40));
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawHoop(ctx: CanvasRenderingContext2D, game: Game, fx: Fx, c: Palette) {
  const { x, y } = game.hoop;
  const boardX = x + RIM_W + BOARD_GAP;

  // Poteau et planche.
  ctx.fillStyle = c.muted;
  ctx.fillRect(boardX + 14, y - BOARD_H + 10, 5, FLOOR - (y - BOARD_H + 10));
  ctx.fillRect(boardX, y - 10, 16, 4);
  ctx.fillStyle = c.fg;
  ctx.fillRect(boardX, y - BOARD_H, 5, BOARD_H + 8);

  // Badge 3 points si le panier est loin.
  if (x + RIM_W / 2 - HAND.x >= 250) {
    ctx.fillStyle = c.violet;
    ctx.font = "11px Silkscreen, monospace";
    ctx.textAlign = "center";
    ctx.fillText("3 PTS", boardX + 2, y - BOARD_H - 8);
  }

  // Filet : il ondule après un panier.
  const wave = fx.reduced ? 0 : fx.net;
  ctx.strokeStyle = c.muted;
  ctx.lineWidth = 1.2;
  const depth = 30 + wave * 8;
  for (let i = 0; i <= 4; i++) {
    const top = x + (RIM_W * i) / 4;
    const bottom = x + 8 + ((RIM_W - 16) * i) / 4 + Math.sin(i + wave * 12) * wave * 4;
    ctx.beginPath();
    ctx.moveTo(top, y);
    ctx.lineTo(bottom, y + depth);
    ctx.stroke();
  }
  for (let r = 1; r <= 2; r++) {
    const t = r / 3;
    ctx.beginPath();
    ctx.moveTo(x + 8 * t, y + depth * t);
    ctx.lineTo(x + RIM_W - 8 * t, y + depth * t);
    ctx.stroke();
  }

  // Cercle.
  ctx.strokeStyle = c.gold;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + RIM_W, y);
  ctx.stroke();
  ctx.fillStyle = c.gold;
  for (const kx of [x, x + RIM_W]) {
    ctx.beginPath();
    ctx.arc(kx, y, RIM_KNOT, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAim(ctx: CanvasRenderingContext2D, game: Game, c: Palette) {
  if (game.phase !== "playing" || game.ball.flying) return;
  const { angle, power } = game.aim;
  const path = predictPath(angle, power);
  ctx.fillStyle = c.gold;
  path.forEach((p, i) => {
    ctx.globalAlpha = 0.9 - i * 0.11;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3 - i * 0.25, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Jauge de puissance en arc autour de la main.
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = c.line;
  ctx.beginPath();
  ctx.arc(HAND.x, HAND.y, BALL_R + 9, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();
  ctx.strokeStyle = c.court;
  ctx.beginPath();
  ctx.arc(HAND.x, HAND.y, BALL_R + 9, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * power));
  ctx.stroke();
}

function drawBall(ctx: CanvasRenderingContext2D, game: Game, fx: Fx, c: Palette) {
  const b = game.ball;
  // Traînée (désactivée avec mouvements réduits).
  fx.trail.forEach((p, i) => {
    ctx.globalAlpha = ((i + 1) / fx.trail.length) * 0.28;
    ctx.fillStyle = c.ball;
    ctx.beginPath();
    ctx.arc(p.x, p.y, BALL_R * (0.5 + (i / fx.trail.length) * 0.5), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(fx.spin);
  ctx.fillStyle = c.ball;
  ctx.beginPath();
  ctx.arc(0, 0, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(40, 20, 10, 0.75)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-BALL_R, 0);
  ctx.lineTo(BALL_R, 0);
  ctx.moveTo(0, -BALL_R);
  ctx.lineTo(0, BALL_R);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-BALL_R * 1.25, 0, BALL_R * 0.95, -0.9, 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(BALL_R * 1.25, 0, BALL_R * 0.95, Math.PI - 0.9, Math.PI + 0.9);
  ctx.stroke();
  ctx.restore();
}
