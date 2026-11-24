import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import { Bookmarks } from "./components/ui/Bookmarks";
import { Cursor } from "./components/ui/Cursor";
import { HudBar } from "./components/ui/HudBar";
import type { Repo } from "./lib/github";
import { useActiveChapter } from "./lib/useActiveChapter";
import { CharacterSheet } from "./sections/CharacterSheet";
import { Epilogue } from "./sections/Epilogue";
import { Journey } from "./sections/Journey";
import { Passions } from "./sections/Passions";
import { Prologue } from "./sections/Prologue";
import { Quests } from "./sections/Quests";

export function App({ initialRepos = [] }: { initialRepos?: Repo[] }) {
  const active = useActiveChapter();

  return (
    // LazyMotion + `m` : seules les fonctionnalités d'animation utilisées sont chargées.
    // reducedMotion="user" : Motion coupe les transformations si le système le demande.
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <a
          href="#contenu"
          className="fixed top-2 left-2 z-50 -translate-y-24 rounded-xl bg-gold px-4 py-3 font-display font-bold text-on-accent focus:translate-y-0"
        >
          Aller au contenu
        </a>
        <HudBar active={active} />
        <Bookmarks active={active} />
        <Cursor />

        <main id="contenu" tabIndex={-1} className="mx-auto max-w-7xl px-4 pb-20 md:px-8 lg:pr-24 lg:pb-0">
          <Prologue />
          <Passions />
          <Quests initialRepos={initialRepos} />
          <Journey />
          <CharacterSheet />
          <Epilogue />
        </main>
      </MotionConfig>
    </LazyMotion>
  );
}
