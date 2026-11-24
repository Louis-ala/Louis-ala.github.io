// Pré-rendu statique : récupère les dépôts GitHub, injecte le HTML de <App/> dans
// dist/index.html, intègre la feuille de style en ligne et précharge les polices.
// React hydrate ensuite ce HTML dans le navigateur (src/main.tsx).
import { cp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

const { render, fetchRepos, GITHUB_USER } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
let html = await readFile(path.join(dist, "index.html"), "utf8");

// 1. Dépôts GitHub au moment du build (jeton facultatif : GITHUB_TOKEN en CI, quota plus large).
//    En cas d'échec, la page se construit quand même et le navigateur réessaiera.
let repos = [];
try {
  repos = await fetchRepos(GITHUB_USER, fetch, process.env.GITHUB_TOKEN);
  console.log(`Dépôts GitHub : ${repos.map((r) => r.name).join(", ") || "aucun"}`);
} catch (error) {
  console.warn(`Dépôts GitHub indisponibles au build (${error.message}) : ils seront chargés dans le navigateur.`);
}

// 2. Contenu pré-rendu + données pour l'hydratation (mêmes dépôts côté serveur et navigateur).
html = html.replace("<!--app-outlet-->", render(repos));
const json = JSON.stringify(repos).replace(/</g, "\\u003c");
html = html.replace("<!--data-outlet-->", `<script id="quests-data" type="application/json">${json}</script>`);

// 3. CSS en ligne : supprime une requête bloquante pour le rendu.
const cssLink = html.match(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/);
if (cssLink) {
  const css = await readFile(path.join(dist, cssLink[1]), "utf8");
  const inlined = css.replace(/url\((?:\.\/|\/)?(assets\/|)([^)"']+\.woff2)\)/g, "url(/assets/$2)");
  html = html.replace(cssLink[0], `<style>${inlined}</style>`);
  await rm(path.join(dist, cssLink[1]));
}

// 4. Images importées par les composants : émises aussi par le build serveur, recopiées si absentes.
const ssrAssets = path.join(ssrDir, "assets");
for (const file of await readdir(ssrAssets).catch(() => [])) {
  if (/\.(avif|webp|png|jpe?g|svg|woff2)$/.test(file)) await cp(path.join(ssrAssets, file), path.join(dist, "assets", file));
}

// 5. Préchargement des polices visibles dès l'arrivée (titres et texte). Silkscreen se charge à la demande.
const assets = await readdir(path.join(dist, "assets"));
const fonts = assets.filter((f) => /^(bricolage-grotesque|literata)-latin-wght/.test(f) && f.endsWith(".woff2"));
const preload = fonts
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`)
  .join("");
html = html.replace("<!--head-outlet-->", preload);

await writeFile(path.join(dist, "index.html"), html);
await rm(ssrDir, { recursive: true, force: true });
console.log(`Pré-rendu OK (${(Buffer.byteLength(html) / 1024).toFixed(1)} Ko), polices préchargées : ${fonts.length}`);
