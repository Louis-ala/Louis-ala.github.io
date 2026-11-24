import { m } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { EASE_SNAP, useIsomorphicLayoutEffect } from "../../lib/motion";

type Props = { children: ReactNode; className?: string; delay?: number; as?: "div" | "li" | "article" };

/**
 * Apparition au scroll. Le HTML pré-rendu est toujours visible (SEO, pas de JS = pas de trou).
 * Après hydratation, seuls les éléments situés SOUS l'écran sont « armés » avant le premier
 * affichage : ils apparaissent quand on les atteint. Ceux déjà visibles ne clignotent pas.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight) setArmed(true);
  }, []);

  const Tag = m[as];
  return (
    <Tag
      ref={ref as never}
      className={className}
      initial={armed ? { opacity: 0, y: 28 } : false}
      whileInView={armed ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.45, ease: EASE_SNAP, delay }}
    >
      {children}
    </Tag>
  );
}
