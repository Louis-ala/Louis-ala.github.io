import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { contacts, EMAIL, profile } from "../data/content";
import { Reveal } from "../components/ui/Reveal";
import { EASE_SNAP } from "../lib/motion";

export function Epilogue() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <footer id="contact" aria-labelledby="contact-titre" className="py-24 md:py-32">
      <Reveal className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-8 md:p-14">
        <p className="font-serif text-lg text-violet italic">Épilogue</p>
        <h2 id="contact-titre" className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
          Il reste une place dans votre équipe ?
        </h2>
        <p className="mt-5 max-w-2xl text-lg md:text-xl">
          Je cherche une alternance en développement web : 3 semaines chez vous, 1 semaine en cours. Basé à Toulouse, mobile dans toute la France.
          Envoyez-moi la passe, je m'occupe du reste.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex min-h-14 items-center rounded-full bg-violet px-7 font-display text-lg font-bold text-on-accent transition-transform duration-200 ease-snap hover:-translate-y-0.5"
          >
            Écrire à {EMAIL}
          </a>
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-14 items-center rounded-full border-2 border-line px-6 font-display font-bold transition-colors duration-200 hover:border-violet"
          >
            Copier l'adresse
          </button>
          <span aria-live="polite" className="font-pixel text-xs text-court">
            <AnimatePresence>
              {copied && (
                <m.span
                  className="inline-block"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE_SNAP }}
                >
                  Adresse copiée !
                </m.span>
              )}
            </AnimatePresence>
          </span>
        </div>

        <dl className="mt-12 grid gap-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {contacts.map((c) => (
            <div key={c.label}>
              <dt className="font-pixel text-xs text-gold">{c.label}</dt>
              <dd>
                <a
                  href={c.href}
                  className="inline-block py-2 font-display text-lg font-semibold break-all underline decoration-line decoration-2 underline-offset-4 transition-colors hover:decoration-violet"
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {c.value}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <p className="mt-10 text-center text-sm text-muted">
        {profile.name}, Toulouse. Écrit en React, TypeScript, Tailwind CSS et Motion. Fin du livre, merci de l'avoir lu.
      </p>
    </footer>
  );
}
