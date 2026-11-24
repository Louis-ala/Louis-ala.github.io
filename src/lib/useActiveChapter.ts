import { useEffect, useState } from "react";
import { chapters, type ChapterId } from "../data/content";

/** Chapitre actuellement lu : le dernier dont le haut a franchi le tiers de l'écran. */
export function useActiveChapter(): ChapterId {
  const [active, setActive] = useState<ChapterId>(chapters[0].id);

  useEffect(() => {
    const update = () => {
      const line = window.innerHeight / 3;
      let current: ChapterId = chapters[0].id;
      for (const c of chapters) {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top <= line) current = c.id;
      }
      // En bas de page, le dernier chapitre est forcément le bon.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = chapters[chapters.length - 1].id;
      }
      setActive(current);
    };
    let frame = 0;
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), update()));
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return active;
}
