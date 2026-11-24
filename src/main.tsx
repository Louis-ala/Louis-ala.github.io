import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// En production, la page est pré-rendue en HTML statique (scripts/prerender.mjs) et ce
// script n'est pas livré. Il sert au serveur de développement (`npm run dev`), et
// hydraterait le HTML pré-rendu si l'étape « zéro JS » du pré-rendu était retirée.
const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (root.hasChildNodes() && root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
