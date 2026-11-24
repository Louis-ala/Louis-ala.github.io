import { AnimatePresence, m, useScroll, useSpring } from "motion/react";
import { useId, useRef, useState } from "react";
import { journey, nextQuest, type JourneyStep } from "../data/content";
import { Chapter } from "../components/ui/Chapter";
import { Reveal } from "../components/ui/Reveal";
import { EASE_SNAP } from "../lib/motion";

function Step({ step, open, onToggle }: { step: JourneyStep; open: boolean; onToggle: () => void }) {
  const panelId = useId();
  const formation = step.kind === "Formation";
  return (
    <Reveal as="li" className="relative pl-12 md:pl-16">
      {/* Jalon sur la ligne du temps */}
      <span
        aria-hidden="true"
        className={`absolute top-3 left-[9px] grid size-6 place-items-center rounded-full border-2 bg-ink md:left-[17px] ${formation ? "border-violet" : "border-court"}`}
      >
        <span className={`size-2 rounded-full transition-transform duration-300 ease-snap ${open ? "scale-150" : ""} ${formation ? "bg-violet" : "bg-court"}`} />
      </span>

      <div className={`rounded-2xl border bg-surface transition-colors duration-300 ${open ? "border-violet/70" : "border-line"}`}>
        <h3>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
            className="flex w-full items-start justify-between gap-4 p-5 text-left md:p-6"
          >
            <span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-pixel text-xs">
                <span className="text-gold">{step.period}</span>
                <span className={formation ? "text-violet" : "text-court"}>{step.kind}</span>
              </span>
              <span className="mt-2 block font-display text-xl font-extrabold md:text-2xl">{step.title}</span>
              <span className="mt-1 block font-serif text-base font-normal text-muted">
                {step.place}, {step.where}
              </span>
            </span>
            <m.span
              aria-hidden="true"
              className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-line font-display text-lg"
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ duration: 0.25, ease: EASE_SNAP }}
            >
              +
            </m.span>
          </button>
        </h3>

        <AnimatePresence initial={false}>
          {open && (
            <m.div
              id={panelId}
              key="panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_SNAP }}
              className="overflow-hidden"
            >
              <div className="grid gap-5 border-t border-line p-5 md:grid-cols-3 md:p-6">
                <div>
                  <p className="font-display text-sm font-bold text-gold">Le défi</p>
                  <p className="mt-1">{step.challenge}</p>
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-gold">Ce que j'ai fait</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 marker:text-violet">
                    {step.actions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-gold">Ce que j'en retire</p>
                  <p className="mt-1 italic">{step.takeaway}</p>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

export function Journey() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  // La dernière étape (la plus récente) est ouverte par défaut.
  const [open, setOpen] = useState<string | null>(journey[journey.length - 1].id);

  return (
    <Chapter
      id="parcours"
      title="La carte du parcours"
      intro="De la première visite en entreprise jusqu'au stage frontend : chaque étape, le défi qu'elle posait et ce qu'elle m'a appris. Clique sur une étape pour l'ouvrir."
    >
      <div className="relative">
        {/* Ligne du temps : elle se trace au fil du scroll */}
        <span aria-hidden="true" className="absolute top-0 bottom-0 left-[20px] w-0.5 bg-line md:left-[28px]" />
        <m.span
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-[20px] w-0.5 origin-top bg-gradient-to-b from-violet via-gold to-court md:left-[28px]"
          style={{ scaleY: progress }}
        />

        <ol ref={listRef} className="relative space-y-5">
          {journey.map((step) => (
            <Step key={step.id} step={step} open={open === step.id} onToggle={() => setOpen(open === step.id ? null : step.id)} />
          ))}

          <Reveal as="li" className="relative pl-12 md:pl-16">
            <span aria-hidden="true" className="absolute top-4 left-[7px] grid size-7 place-items-center rounded-full bg-gold font-pixel text-xs text-on-accent md:left-[15px]">
              ?
            </span>
            <div className="rounded-2xl border-2 border-dashed border-gold/70 p-5 md:p-6">
              <h3 className="font-display text-xl font-extrabold md:text-2xl">{nextQuest.title}</h3>
              <p className="mt-2 max-w-2xl">{nextQuest.text}</p>
              <a href="#contact" className="mt-4 inline-flex min-h-12 items-center rounded-full bg-gold px-5 font-display font-bold text-on-accent transition-transform duration-200 ease-snap hover:-translate-y-0.5">
                Proposer cette quête
              </a>
            </div>
          </Reveal>
        </ol>
      </div>
    </Chapter>
  );
}
