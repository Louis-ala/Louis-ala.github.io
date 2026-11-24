import { m, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { FINE_POINTER, REDUCED_MOTION, useMediaQuery } from "../../lib/motion";

const INTERACTIVE = "a, button, [role='button'], canvas, summary, label";

/**
 * Réticule de visée (desktop) : un point qui suit exactement la souris, un anneau qui le rattrape
 * avec un ressort. Sur un élément cliquable, l'anneau s'élargit. Absent sur tactile et
 * avec « mouvements réduits » : le curseur natif reste alors en place.
 */
export function Cursor() {
  const fine = useMediaQuery(FINE_POINTER);
  const reduced = useMediaQuery(REDUCED_MOTION);
  const enabled = fine && !reduced;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 700, damping: 40, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 700, damping: 40, mass: 0.5 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-reticle");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      setHovering(!!(e.target as Element | null)?.closest?.(INTERACTIVE));
    };
    const leave = () => setVisible(false);
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    root.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("has-reticle");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      root.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className={`pointer-events-none fixed inset-0 z-[60] transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}>
      <m.div
        className="absolute top-0 left-0 rounded-full border-2 border-gold"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: hovering ? 46 : 30, height: hovering ? 46 : 30, scale: pressed ? 0.8 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        {/* Repères de visée */}
        {[0, 90, 180, 270].map((deg) => (
          <span
            key={deg}
            className="absolute top-1/2 left-1/2 h-0.5 w-2 bg-gold"
            style={{ transform: `translate(-50%, -50%) rotate(${deg}deg) translateX(calc(50% + ${hovering ? 26 : 18}px))` }}
          />
        ))}
      </m.div>
      <m.div className="absolute top-0 left-0 size-1.5 rounded-full bg-gold" style={{ x, y, translateX: "-50%", translateY: "-50%" }} />
    </div>
  );
}
