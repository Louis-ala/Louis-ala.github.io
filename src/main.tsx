import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import type { Repo } from "./lib/github";
import "./styles.css";

// Dépôts GitHub récupérés au build et injectés par scripts/prerender.mjs (vide en développement).
function readInitialRepos(): Repo[] {
  try {
    return JSON.parse(document.getElementById("quests-data")?.textContent ?? "[]") as Repo[];
  } catch {
    return [];
  }
}

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App initialRepos={readInitialRepos()} />
  </StrictMode>
);

if (root.hasChildNodes() && root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
