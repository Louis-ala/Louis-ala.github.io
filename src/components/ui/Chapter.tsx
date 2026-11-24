import type { ReactNode } from "react";
import { chapters, type ChapterId } from "../../data/content";
import { Reveal } from "./Reveal";

type Props = { id: ChapterId; title: string; intro?: string; children: ReactNode };

/** Une section = un chapitre du livre : numéro romain, titre, chapeau en serif. */
export function Chapter({ id, title, intro, children }: Props) {
  const chapter = chapters.find((c) => c.id === id)!;
  const headingId = `${id}-titre`;
  return (
    <section id={id} aria-labelledby={headingId} className="relative py-24 md:py-32">
      <Reveal className="mb-12 max-w-3xl md:mb-16">
        <p className="font-serif text-lg text-violet italic">
          {chapter.numeral ? `Chapitre ${chapter.numeral}` : chapter.label}
        </p>
        <h2 id={headingId} className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl">
          {title}
        </h2>
        {intro && <p className="mt-5 max-w-2xl text-lg text-muted md:text-xl">{intro}</p>}
      </Reveal>
      {children}
    </section>
  );
}
