import { m } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import photo160avif from "../assets/photo-160.avif";
import photo320avif from "../assets/photo-320.avif";
import photo160webp from "../assets/photo-160.webp";
import photo320webp from "../assets/photo-320.webp";
import { EMAIL, profile } from "../data/content";
import { EASE_SNAP } from "../lib/motion";

// Le jeu n'est téléchargé qu'à la demande (clic sur « Jouer », ou Hero visible sur grand écran).
const BuzzerBeater = lazy(() => import("../game/BuzzerBeater"));

function CourtPoster({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface">
      <svg viewBox="0 0 480 320" className="block w-full" aria-hidden="true">
        <line x1="0" y1="296" x2="480" y2="296" stroke="var(--color-line)" strokeWidth="2" />
        <rect x="382" y="78" width="5" height="80" fill="var(--color-fg)" />
        <line x1="330" y1="150" x2="376" y2="150" stroke="var(--color-gold)" strokeWidth="4" strokeLinecap="round" />
        <path d="M330 150 L338 180 M341 150 L344 180 M353 150 L353 180 M364 150 L362 180 M376 150 L368 180" stroke="var(--color-muted)" strokeWidth="1.2" />
        <path d="M78 206 Q 210 20 352 140" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round" />
        <circle cx="78" cy="206" r="11" fill="var(--color-ball)" />
      </svg>
      <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-ink/80 via-ink/20 to-transparent p-4">
        <div className="text-center">
          <p className="font-display text-3xl font-extrabold">Buzzer Beater</p>
          <p className="mt-1 text-sm text-muted">Mini-jeu : 30 secondes, un maximum de paniers.</p>
          <button
            type="button"
            onClick={onPlay}
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-court px-6 font-display font-bold text-on-accent transition-transform duration-200 ease-snap hover:scale-105 active:scale-95"
          >
            <span aria-hidden="true">▶</span> Jouer
          </button>
        </div>
      </div>
    </div>
  );
}

function GameSlot() {
  const [mode, setMode] = useState<"poster" | "loaded" | "playing">("poster");

  // Sur grand écran, on charge le jeu quand le navigateur est au repos (sans lancer la partie).
  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px) and (hover: hover)").matches) return;
    const load = () => setMode((current) => (current === "poster" ? "loaded" : current));
    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(load, { timeout: 2500 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(load, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {mode === "poster" ? (
        <CourtPoster onPlay={() => setMode("playing")} />
      ) : (
        <Suspense fallback={<CourtPoster onPlay={() => setMode("playing")} />}>
          <BuzzerBeater autoStart={mode === "playing"} />
        </Suspense>
      )}
    </div>
  );
}

export function Prologue() {
  return (
    <section id="prologue" aria-labelledby="prologue-titre" className="grid items-center gap-12 pt-28 pb-16 md:pt-36 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      <div>
        <p className="font-serif text-lg text-violet italic">Prologue</p>
        <h1 id="prologue-titre" className="mt-2 font-display text-6xl leading-[0.9] font-extrabold tracking-tight sm:text-7xl xl:text-8xl">
          Louis
          <br />
          <span className="text-violet">Alary</span>
        </h1>
        <p className="mt-6 font-display text-2xl font-semibold md:text-3xl">{profile.tagline}</p>
        <p className="mt-4 max-w-xl text-lg text-muted md:text-xl">{profile.hook}</p>

        {/* Carte de personnage */}
        <m.div
          className="mt-8 flex max-w-xl items-center gap-5 rounded-2xl border border-line bg-surface p-4"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25, ease: EASE_SNAP }}
        >
          <picture className="shrink-0">
            <source type="image/avif" srcSet={`${photo160avif} 160w, ${photo320avif} 320w`} sizes="88px" />
            <img
              src={photo160webp}
              srcSet={`${photo160webp} 160w, ${photo320webp} 320w`}
              sizes="88px"
              width={88}
              height={117}
              alt={profile.photoAlt}
              fetchPriority="high"
              className="h-[117px] w-[88px] rounded-xl object-cover ring-2 ring-gold/60"
            />
          </picture>
          <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2">
            {profile.stats.map((s) => (
              <div key={s.label}>
                <dt className="font-pixel text-[0.7rem] text-gold">{s.label}</dt>
                <dd className="font-display text-sm leading-tight font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </m.div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex min-h-12 items-center rounded-full bg-violet px-6 font-display font-bold text-on-accent transition-transform duration-200 ease-snap hover:-translate-y-0.5"
          >
            Me proposer une alternance
          </a>
          <a
            href="#quetes"
            className="inline-flex min-h-12 items-center rounded-full border-2 border-line px-6 font-display font-bold transition-colors duration-200 hover:border-violet"
          >
            Voir mes quêtes
          </a>
        </div>
      </div>

      <GameSlot />
    </section>
  );
}
