import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { inventory, languages, traits } from "../data/content";
import { Chapter } from "../components/ui/Chapter";
import { Reveal } from "../components/ui/Reveal";
import { EASE_SNAP } from "../lib/motion";

const all = inventory.flatMap((d) => d.items.map((item) => ({ ...item, domain: d.domain, glyph: d.glyph })));

export function CharacterSheet() {
  const [selected, setSelected] = useState(all[0].name);
  const current = all.find((s) => s.name === selected)!;

  return (
    <Chapter
      id="fiche"
      title="Fiche personnage"
      intro="Pas de jauges en pourcentage : un inventaire d'outils réellement utilisés, et les traits qui me décrivent sur le terrain comme au clavier."
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Inventaire */}
        <Reveal className="rounded-3xl border border-line bg-surface p-5 md:p-7">
          <h3 className="flex items-baseline justify-between gap-3 text-2xl font-extrabold">
            Inventaire
            <span className="font-pixel text-xs font-normal text-muted">{all.length} objets</span>
          </h3>
          <p className="mt-1 text-sm text-muted">Sélectionne un objet pour voir où je l'ai utilisé.</p>

          <div className="mt-6 space-y-5">
            {inventory.map((d) => (
              <div key={d.domain}>
                <h4 className="flex items-center gap-2 font-pixel text-xs text-gold">
                  <span aria-hidden="true">{d.glyph}</span>
                  {d.domain}
                </h4>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {d.items.map((item) => {
                    const active = item.name === selected;
                    return (
                      <li key={item.name}>
                        <m.button
                          type="button"
                          aria-pressed={active}
                          aria-controls="objet-detail"
                          onClick={() => setSelected(item.name)}
                          whileTap={{ scale: 0.94 }}
                          className={`min-h-11 rounded-xl border-2 px-3.5 font-display text-sm font-semibold transition-colors duration-200 ${
                            active ? "border-gold bg-gold text-on-accent" : "border-line bg-raised hover:border-violet"
                          }`}
                        >
                          {item.name}
                        </m.button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div id="objet-detail" aria-live="polite" className="mt-6 min-h-24 rounded-2xl border border-line bg-ink/40 p-4">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={current.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: EASE_SNAP }}
              >
                <p className="font-pixel text-xs text-gold">
                  {current.domain}
                </p>
                <p className="mt-1 font-display text-xl font-extrabold">{current.name}</p>
                <p className="mt-1">
                  <span className="text-muted">Utilisé dans : </span>
                  {current.usedIn}
                </p>
              </m.div>
            </AnimatePresence>
          </div>
        </Reveal>

        {/* Traits */}
        <div className="space-y-6">
          <Reveal className="rounded-3xl border border-line bg-surface p-5 md:p-7">
            <h3 className="text-2xl font-extrabold">Traits</h3>
            <ul className="mt-5 grid gap-3">
              {traits.map((t) => (
                <m.li
                  key={t.name}
                  className="rounded-2xl border border-line bg-raised/60 p-4"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2, ease: EASE_SNAP }}
                >
                  <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-display text-lg font-bold">{t.name}</span>
                    <span className="font-pixel text-[0.7rem] text-court">{t.source}</span>
                  </p>
                  <p className="mt-1 text-sm">{t.text}</p>
                </m.li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="rounded-3xl border border-line bg-surface p-5 md:p-7">
            <h3 className="text-2xl font-extrabold">Langues</h3>
            <ul className="mt-3 space-y-1">
              {languages.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Chapter>
  );
}
