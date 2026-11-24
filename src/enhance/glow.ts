// Halo lumineux qui suit la souris, avec un léger retard.
// Coût minimal : un seul élément déplacé par `transform` (pas de recalcul de mise en page),
// une boucle d'animation qui s'arrête dès que le halo a rejoint le pointeur.
// Désactivé sur écran tactile et si l'utilisateur demande moins d'animations.

const EASING = 0.14; // part de la distance parcourue à chaque image (0 à 1)
const REST = 0.5; // en dessous de cette distance (px), le halo est considéré arrivé

export function approach(current: number, target: number, easing = EASING): number {
  return current + (target - current) * easing;
}

export function initPointerGlow(): void {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!finePointer || reducedMotion) return;

  const glow = document.createElement("div");
  glow.className = "pointer-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.prepend(glow);

  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  let frame = 0;
  let started = false;

  const render = () => {
    x = approach(x, targetX);
    y = approach(y, targetY);
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const moving = Math.abs(targetX - x) + Math.abs(targetY - y) > REST;
    frame = moving ? requestAnimationFrame(render) : 0;
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!started) {
        // première apparition : directement sous le pointeur, sans glisser depuis le coin
        x = targetX;
        y = targetY;
        started = true;
      }
      glow.classList.add("is-visible");
      if (!frame) frame = requestAnimationFrame(render);
    },
    { passive: true },
  );

  document.documentElement.addEventListener("pointerleave", () => glow.classList.remove("is-visible"));
}
