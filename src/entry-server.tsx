import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App";
import type { Repo } from "./lib/github";

export { fetchRepos } from "./lib/github";
export { GITHUB_USER } from "./data/content";

/** Pré-rendu : la page complète en HTML, avec les dépôts GitHub récupérés au build. */
export function render(repos: Repo[] = []): string {
  return renderToString(
    <StrictMode>
      <App initialRepos={repos} />
    </StrictMode>,
  );
}
