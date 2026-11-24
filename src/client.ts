// Point d'entrée du navigateur.
// - En production : la page est déjà pré-rendue en HTML ; on n'ajoute que le bouton de thème
//   et le halo (quelques Ko de JS, React n'est pas livré).
// - En développement (`npm run dev`) : React affiche la page via main.tsx.
import "./styles.css";
import { initPointerGlow } from "./enhance/glow";
import { initThemeToggle } from "./enhance/theme";

function enhance() {
  initThemeToggle();
  initPointerGlow();
}

if (import.meta.env.DEV) {
  import("./main").then(() => requestAnimationFrame(enhance));
} else {
  enhance();
}
