import { AnimatePresence, m } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EASE_SNAP } from "../lib/motion";
import {
  GAME_TIME,
  H,
  MAX_ANGLE,
  MIN_ANGLE,
  W,
  aimFromDrag,
  clamp,
  createGame,
  drainEvents,
  shoot,
  start,
  step,
  type Game,
  type Phase,
} from "./engine";
import { createFx, draw, readPalette, updateFx, type Fx, type Palette } from "./render";

const BEST_KEY = "buzzer-beater-best";

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(best: number) {
  try {
    localStorage.setItem(BEST_KEY, String(best));
  } catch {
    // record non mémorisé
  }
}

type Hud = { score: number; streak: number; time: number; best: number; phase: Phase; made: number; shots: number };

/** Mini-jeu « Buzzer Beater » : 30 secondes pour marquer un maximum de paniers. */
export default function BuzzerBeater({ autoStart = false }: { autoStart?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Composant chargé uniquement dans le navigateur : on peut lire le record dès le premier rendu.
  const [initialBest] = useState(readBest);
  const gameRef = useRef<Game>(createGame(initialBest));
  const fxRef = useRef<Fx>(createFx(false));
  const paletteRef = useRef<Palette | null>(null);
  const sizeRef = useRef({ scale: 1, dpr: 1 });
  const keysRef = useRef(new Set<string>());
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const frameRef = useRef(0);
  const lastRef = useRef(0);
  const visibleRef = useRef(true);

  const [hud, setHud] = useState<Hud>({ score: 0, streak: 0, time: GAME_TIME, best: initialBest, phase: "ready", made: 0, shots: 0 });
  const [announce, setAnnounce] = useState("");
  const [flash, setFlash] = useState<{ id: number; text: string } | null>(null);

  const syncHud = useCallback(() => {
    const g = gameRef.current;
    setHud((h) => {
      const next = { score: g.score, streak: g.streak, time: Math.ceil(g.timeLeft), best: g.best, phase: g.phase, made: g.made, shots: g.shots };
      return Object.keys(next).some((k) => next[k as keyof Hud] !== h[k as keyof Hud]) ? next : h;
    });
  }, []);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !paletteRef.current) return;
    draw(ctx, gameRef.current, fxRef.current, paletteRef.current, sizeRef.current.scale, sizeRef.current.dpr);
  }, []);

  const handleEvents = useCallback(() => {
    const g = gameRef.current;
    const fx = fxRef.current;
    const pal = paletteRef.current;
    for (const e of drainEvents(g)) {
      if (e.type === "score") {
        const label = e.buzzer ? "Buzzer beater !" : e.swish ? "Swish !" : e.three ? "À 3 points !" : "Panier !";
        fx.particles.push({ x: g.hoop.x + 23, y: g.hoop.y - 24, text: `+${e.points}`, age: 0, color: pal?.gold ?? "#e9b949" });
        fx.particles.push({ x: g.hoop.x + 23, y: g.hoop.y - 48, text: label, age: 0, color: pal?.court ?? "#2dd4bf" });
        fx.net = 1;
        fx.shake = e.swish ? 3 : 5;
        setFlash({ id: Date.now(), text: e.streak > 1 ? `Combo x${e.streak}` : label });
        setAnnounce(`${label} Plus ${e.points} points. Score : ${g.score}.`);
      } else if (e.type === "rim") {
        fx.shake = Math.max(fx.shake, 2);
      } else if (e.type === "over") {
        if (e.newBest) saveBest(e.best);
        setAnnounce(`Fin du match. Score : ${e.score}. ${e.newBest ? "Nouveau record !" : `Record : ${e.best}.`}`);
      }
    }
  }, []);

  // Une image de la boucle de jeu. Elle se reprogramme via loopRef (fonction récursive stable).
  const loopRef = useRef<FrameRequestCallback>(() => {});
  const frame = useCallback(
    (now: number) => {
      const g = gameRef.current;
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;

      // Visée au clavier : flèches maintenues.
      const keys = keysRef.current;
      if (g.phase === "playing" && !g.ball.flying) {
        if (keys.has("ArrowUp")) g.aim.angle = clamp(g.aim.angle + dt * 1.1, MIN_ANGLE, MAX_ANGLE);
        if (keys.has("ArrowDown")) g.aim.angle = clamp(g.aim.angle - dt * 1.1, MIN_ANGLE, MAX_ANGLE);
        if (keys.has("ArrowRight")) g.aim.power = clamp(g.aim.power + dt * 0.7, 0, 1);
        if (keys.has("ArrowLeft")) g.aim.power = clamp(g.aim.power - dt * 0.7, 0, 1);
      }

      step(g, dt);
      handleEvents();
      const animating = updateFx(fxRef.current, g, dt);
      render();
      syncHud();

      if (visibleRef.current && (g.phase === "playing" || animating)) frameRef.current = requestAnimationFrame(loopRef.current);
      else frameRef.current = 0;
    },
    [handleEvents, render, syncHud],
  );
  useEffect(() => {
    loopRef.current = frame;
  }, [frame]);

  const kick = useCallback(() => {
    if (!frameRef.current) {
      lastRef.current = 0;
      frameRef.current = requestAnimationFrame((t) => loopRef.current(t));
    }
  }, []);

  const startGame = useCallback(() => {
    start(gameRef.current);
    fxRef.current.particles = [];
    setAnnounce("Coup d'envoi ! 30 secondes.");
    syncHud();
    kick();
    canvasRef.current?.focus();
  }, [kick, syncHud]);

  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (g.phase === "playing") g.phase = "paused";
    else if (g.phase === "paused") g.phase = "playing";
    else return;
    setAnnounce(g.phase === "paused" ? "Pause." : "Reprise.");
    syncHud();
    kick();
    render();
  }, [kick, render, syncHud]);

  // Mise en place : record, palette, taille, mouvements réduits.
  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const g = gameRef.current;
    fxRef.current.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    paletteRef.current = readPalette(wrap);

    const resize = () => {
      const width = wrap.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(((width * H) / W) * dpr);
      sizeRef.current = { scale: width / W, dpr };
      render();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Couleurs du thème : relues quand on bascule le mode lecture.
    const mo = new MutationObserver(() => {
      paletteRef.current = readPalette(wrap);
      render();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Hors écran ou onglet caché : la boucle s'arrête, la partie se met en pause.
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (!entry.isIntersecting && g.phase === "playing") togglePause();
    });
    io.observe(wrap);
    const onHidden = () => document.hidden && g.phase === "playing" && togglePause();
    document.addEventListener("visibilitychange", onHidden);

    resize();
    // Lancement au clic sur « Jouer » : à l'image suivante, une fois le canvas dimensionné.
    const startFrame = autoStart ? requestAnimationFrame(startGame) : 0;
    return () => {
      cancelAnimationFrame(startFrame);
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onHidden);
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [autoStart, render, startGame, togglePause]);

  // Coordonnées écran → unités du terrain.
  const toWorld = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const g = gameRef.current;
    if (g.phase !== "playing" || g.ball.flying) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = toWorld(e);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const origin = dragRef.current;
    if (!origin) return;
    const p = toWorld(e);
    gameRef.current.aim = aimFromDrag(p.x - origin.x, p.y - origin.y);
    render();
  };
  const onPointerUp = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (gameRef.current.aim.power > 0.05 && shoot(gameRef.current)) kick();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const g = gameRef.current;
    if (e.key === "Escape" || e.key === "p" || e.key === "P") {
      e.preventDefault();
      togglePause();
      return;
    }
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (g.phase === "ready" || g.phase === "over") startGame();
      else if (shoot(g)) kick();
      return;
    }
    if (e.key.startsWith("Arrow")) {
      e.preventDefault();
      keysRef.current.add(e.key);
      kick();
    }
  };
  const onKeyUp = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    keysRef.current.delete(e.key);
  };

  const accuracy = hud.shots ? Math.round((hud.made / hud.shots) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_30px_80px_-40px] shadow-violet/40">
      {/* HUD */}
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5 font-pixel text-xs sm:text-sm">
        <span>
          Score <span className="text-gold">{hud.score}</span>
        </span>
        <span className={hud.streak > 1 ? "text-court" : "text-muted"}>Combo x{Math.max(1, hud.streak)}</span>
        <span className={hud.time <= 5 && hud.phase === "playing" ? "text-violet" : ""}>
          <span aria-hidden="true">⏱ </span>
          {hud.time}s
        </span>
        <span className="text-muted">Record {hud.best}</span>
      </div>

      <div ref={wrapRef} className="relative">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Terrain de Buzzer Beater. Glissez depuis la balle vers l'arrière puis relâchez pour tirer. Au clavier : flèches haut et bas pour l'angle, gauche et droite pour la puissance, Espace pour tirer, Échap pour la pause."
          className="block w-full touch-none select-none focus-visible:outline-offset-[-3px]"
          style={{ aspectRatio: `${W} / ${H}` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onBlur={() => keysRef.current.clear()}
        />

        {/* Annonce visuelle courte (combo, swish) */}
        <AnimatePresence>
          {flash && hud.phase === "playing" && (
            <m.p
              key={flash.id}
              aria-hidden="true"
              className="pointer-events-none absolute top-3 left-1/2 font-pixel text-lg text-court"
              initial={{ opacity: 0, y: 10, x: "-50%", scale: 0.8 }}
              animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
              exit={{ opacity: 0, y: -10, x: "-50%" }}
              transition={{ duration: 0.25, ease: EASE_SNAP }}
              onAnimationComplete={() => setTimeout(() => setFlash((f) => (f?.id === flash.id ? null : f)), 500)}
            >
              {flash.text}
            </m.p>
          )}
        </AnimatePresence>

        {/* Écrans : départ, pause, fin */}
        <AnimatePresence>
          {hud.phase !== "playing" && (
            <m.div
              className="absolute inset-0 grid place-items-center bg-ink/75 p-4 text-center backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="max-w-xs">
                {hud.phase === "ready" && (
                  <>
                    <p className="font-display text-2xl font-extrabold">Buzzer Beater</p>
                    <p className="mt-2 text-sm text-muted">30 secondes. Glisse depuis la balle et relâche pour tirer. Les paniers d'affilée font monter le combo.</p>
                  </>
                )}
                {hud.phase === "paused" && <p className="font-display text-2xl font-extrabold">Temps mort</p>}
                {hud.phase === "over" && (
                  <>
                    <p className="font-pixel text-sm text-gold">Fin du match</p>
                    <p className="mt-1 font-display text-4xl font-extrabold">{hud.score} pts</p>
                    <p className="mt-1 text-sm text-muted">
                      {hud.made} paniers sur {hud.shots} tirs ({accuracy} %). Record : {hud.best}.
                    </p>
                  </>
                )}
                <button
                  type="button"
                  onClick={hud.phase === "paused" ? togglePause : startGame}
                  className="mt-4 inline-flex min-h-12 items-center rounded-full bg-court px-6 font-display font-bold text-on-accent transition-transform duration-200 ease-snap hover:scale-105 active:scale-95"
                >
                  {hud.phase === "ready" ? "Coup d'envoi" : hud.phase === "paused" ? "Reprendre" : "Rejouer"}
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2 text-xs text-muted">
        <span>Souris ou doigt : glisser puis relâcher. Clavier : flèches, Espace, Échap.</span>
        {hud.phase === "playing" && (
          <button type="button" onClick={togglePause} className="min-h-11 rounded-full px-3 font-display font-semibold text-fg underline-offset-4 hover:underline">
            Pause
          </button>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
