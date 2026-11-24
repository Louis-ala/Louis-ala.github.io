import { m, useInView, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { passions } from "../data/content";
import { Chapter } from "../components/ui/Chapter";
import { Reveal } from "../components/ui/Reveal";
import { EASE_SNAP } from "../lib/motion";

type ArtProps = { play: boolean; loop: boolean };

/**
 * Carte du bento : l'illustration s'anime une fois quand la carte entre à l'écran
 * (utile sur mobile), puis en boucle tant qu'on la survole.
 */
function BentoCard({
  className = "",
  art,
  children,
}: {
  className?: string;
  art?: (p: ArtProps) => ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [hover, setHover] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const intro = inView && !introDone;

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setIntroDone(true), 2400);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <Reveal as="article" className={`group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-colors duration-300 hover:border-violet/60 ${className}`}>
      <m.div
        ref={ref as never}
        className="flex h-full flex-col"
        onHoverStart={() => setHover(true)}
        onHoverEnd={() => setHover(false)}
      >
        {art && <div className="relative overflow-hidden border-b border-line bg-raised/50">{art({ play: hover || intro, loop: hover })}</div>}
        <div className="flex flex-1 flex-col p-6">{children}</div>
      </m.div>
    </Reveal>
  );
}

const repeat = (loop: boolean) => (loop ? Infinity : 0);

/* ---------- Illustrations ---------- */

function SportArt({ play, loop }: ArtProps) {
  return (
    <svg viewBox="0 0 400 170" className="block h-44 w-full md:h-56" aria-hidden="true">
      <line x1="0" y1="152" x2="400" y2="152" stroke="var(--color-line)" strokeWidth="2" />
      {/* Panier */}
      <rect x="352" y="40" width="5" height="62" fill="var(--color-fg)" />
      <line x1="306" y1="78" x2="346" y2="78" stroke="var(--color-gold)" strokeWidth="4" strokeLinecap="round" />
      <path d="M306 78 L314 104 M326 78 L326 104 M346 78 L338 104" stroke="var(--color-muted)" strokeWidth="1.2" />
      {/* Trajectoire */}
      <m.path
        d="M40 128 Q 180 -40 326 74"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="2.5"
        strokeDasharray="3 9"
        strokeLinecap="round"
        initial={{ pathLength: 0.15, opacity: 0.4 }}
        animate={play ? { pathLength: 1, opacity: 1 } : { pathLength: 0.15, opacity: 0.4 }}
        transition={{ duration: 0.8, ease: EASE_SNAP }}
      />
      {/* Ballon de basket : tir, rebond dans le filet */}
      <m.circle
        r="11"
        fill="var(--color-ball)"
        initial={{ cx: 40, cy: 128 }}
        animate={play ? { cx: [40, 120, 210, 300, 326, 326], cy: [128, 40, 18, 52, 90, 140] } : { cx: 40, cy: 128 }}
        transition={{ duration: 1.1, ease: "easeOut", times: [0, 0.25, 0.5, 0.75, 0.88, 1], repeat: repeat(loop), repeatDelay: 0.4 }}
      />
      {/* Ballon de rugby qui tourne */}
      <m.ellipse
        cx="120"
        cy="138"
        rx="17"
        ry="10"
        fill="none"
        stroke="var(--color-court)"
        strokeWidth="2.5"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={play ? { rotate: [0, -25, 340], y: [0, -26, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 1.1, ease: EASE_SNAP, repeat: repeat(loop), repeatDelay: 0.4 }}
      />
    </svg>
  );
}

const shapes = ["M0 -9 L9 7 L-9 7Z", "M0 -9 A9 9 0 1 1 0 9 A9 9 0 1 1 0 -9", "M0 -10 L10 0 L0 10 L-10 0Z"];
const solution = [0, 4, 8, 2, 6]; // ordre d'allumage des runes

function GamesArt({ play, loop }: ArtProps) {
  return (
    <div className="flex h-44 items-center justify-center gap-8 md:h-56" aria-hidden="true">
      <svg viewBox="0 0 120 120" className="h-28 w-28 md:h-36 md:w-36">
        {Array.from({ length: 9 }, (_, i) => {
          const x = 20 + (i % 3) * 40;
          const y = 20 + Math.floor(i / 3) * 40;
          const order = solution.indexOf(i);
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect x="-16" y="-16" width="32" height="32" rx="7" fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth="1.5" />
              <m.path
                d={shapes[i % 3]}
                fill="var(--color-violet)"
                initial={{ opacity: 0.18, scale: 0.85 }}
                animate={play && order >= 0 ? { opacity: [0.18, 1, 1], scale: [0.85, 1.15, 1] } : { opacity: 0.18, scale: 0.85 }}
                transition={{ duration: 0.35, delay: order * 0.18, ease: EASE_SNAP, repeat: repeat(loop), repeatDelay: 1.6 }}
              />
            </g>
          );
        })}
      </svg>
      {/* Jauge de vie qui se remplit (persévérance) */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <m.span
            key={i}
            className="block h-5 w-5 rounded-full border-2 border-gold"
            initial={{ backgroundColor: "rgba(0,0,0,0)" }}
            animate={play ? { backgroundColor: ["rgba(0,0,0,0)", "var(--color-gold)"] } : { backgroundColor: "rgba(0,0,0,0)" }}
            transition={{ duration: 0.2, delay: 0.9 + (4 - i) * 0.12, repeat: repeat(loop), repeatDelay: 2 }}
          />
        ))}
      </div>
    </div>
  );
}

function ReadingArt({ play }: ArtProps) {
  return (
    <div className="flex h-44 items-center justify-center md:h-48" aria-hidden="true" style={{ perspective: 900 }}>
      <div className="relative flex h-28 w-60">
        {/* Page de gauche : la carte d'un monde */}
        <div className="h-full w-1/2 rounded-l-md border border-line bg-surface p-2">
          <svg viewBox="0 0 100 90" className="h-full w-full">
            <path d="M10 70 L22 48 L34 70Z M28 70 L42 40 L56 70Z" fill="none" stroke="var(--color-muted)" strokeWidth="1.5" />
            <m.path
              d="M12 80 C 30 60, 50 85, 62 55 S 85 30, 90 15"
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="2"
              strokeDasharray="3 4"
              initial={{ pathLength: 0.1 }}
              animate={{ pathLength: play ? 1 : 0.1 }}
              transition={{ duration: 1.2, ease: EASE_SNAP, delay: 0.3 }}
            />
            <circle cx="90" cy="15" r="3.5" fill="var(--color-violet)" />
          </svg>
        </div>
        {/* Page de droite : elle se tourne */}
        <div className="relative h-full w-1/2 rounded-r-md border border-line bg-surface">
          <div className="space-y-2 p-3">
            {[90, 75, 85, 60].map((w, i) => (
              <span key={i} className="block h-1.5 rounded bg-line" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        <m.div
          className="absolute top-0 right-0 h-full w-1/2 origin-left rounded-r-md border border-line bg-raised"
          style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: play ? -178 : 0 }}
          transition={{ duration: 0.9, ease: EASE_SNAP }}
        />
      </div>
    </div>
  );
}

function BaseArt({ play }: ArtProps) {
  return (
    <div className="relative grid h-32 place-items-center" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <m.span
          key={i}
          className="absolute size-10 rounded-full border-2 border-court"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={play ? { scale: [0.6, 2.6], opacity: [0.8, 0] } : { scale: 0.6, opacity: 0 }}
          transition={{ duration: 1.6, delay: i * 0.4, ease: "easeOut" }}
        />
      ))}
      <svg viewBox="0 0 24 24" className="relative size-10 text-violet">
        <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor" />
      </svg>
    </div>
  );
}

const weeks: Variants = {
  rest: { scaleY: 0.25 },
  play: (i: number) => ({ scaleY: 1, transition: { delay: i * 0.15, duration: 0.35, ease: EASE_SNAP } }),
};

function RhythmArt({ play }: ArtProps) {
  return (
    <div className="flex h-32 items-end justify-center gap-2 pb-6" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <m.span
          key={i}
          custom={i}
          variants={weeks}
          initial="rest"
          animate={play ? "play" : "rest"}
          className={`block h-16 w-8 origin-bottom rounded-md ${i < 3 ? "bg-court" : "bg-violet"}`}
        />
      ))}
    </div>
  );
}

/* ---------- Section ---------- */

function InCode({ children }: { children: ReactNode }) {
  return (
    <p className="mt-auto border-t border-line pt-4 text-fg">
      <span className="font-display font-bold text-gold">En code : </span>
      {children}
    </p>
  );
}

export function Passions() {
  const { sport, games, reading, base, rhythm } = passions;
  return (
    <Chapter
      id="passions"
      title="Ce qui me fait avancer"
      intro="Trois passions, trois façons de voir le code. Chaque carte a sa propre animation : elle se joue quand la carte apparaît, puis en boucle au survol."
    >
      <div className="grid gap-4 md:grid-cols-6 md:gap-5">
        <BentoCard className="md:col-span-4 md:row-span-2" art={(p) => <SportArt {...p} />}>
          <h3 className="text-3xl font-extrabold">{sport.title}</h3>
          <p className="mt-1 text-sm text-muted italic">{sport.also}</p>
          <p className="mt-4 mb-6 text-lg">{sport.story}</p>
          <InCode>{sport.inCode}</InCode>
        </BentoCard>

        <BentoCard className="md:col-span-2 md:row-span-2" art={(p) => <GamesArt {...p} />}>
          <h3 className="text-2xl font-extrabold">{games.title}</h3>
          <p className="mt-4 mb-6">{games.story}</p>
          <InCode>{games.inCode}</InCode>
        </BentoCard>

        <BentoCard className="md:col-span-4" art={(p) => <ReadingArt {...p} />}>
          <h3 className="text-2xl font-extrabold">{reading.title}</h3>
          <p className="mt-3 mb-6">{reading.story}</p>
          <InCode>{reading.inCode}</InCode>
        </BentoCard>

        <div className="grid gap-4 sm:grid-cols-2 md:col-span-2 md:grid-cols-1 md:gap-5">
          <BentoCard art={(p) => <BaseArt {...p} />}>
            <h3 className="text-xl font-extrabold">{base.title}</h3>
            <p className="mt-1 text-muted">{base.detail}</p>
          </BentoCard>
          <BentoCard art={(p) => <RhythmArt {...p} />}>
            <h3 className="text-xl font-extrabold">{rhythm.title}</h3>
            <p className="mt-1 text-muted">{rhythm.detail}</p>
          </BentoCard>
        </div>
      </div>
    </Chapter>
  );
}
