// Pré-rendu statique : injecte le HTML de <App/> dans dist/index.html,
// intègre la feuille de style en ligne et précharge la police des titres.
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

const { render } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
let html = await readFile(path.join(dist, "index.html"), "utf8");

// 1. Contenu pré-rendu.
html = html.replace("<!--app-outlet-->", render());

// 2. CSS en ligne : supprime une requête bloquante pour le rendu.
const cssLink = html.match(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/);
if (cssLink) {
  const css = await readFile(path.join(dist, cssLink[1]), "utf8");
  // Les url() relatives du CSS deviennent relatives à la racine.
  const inlined = css.replace(/url\((?:\.\/|\/)?(assets\/|)([^)"']+\.woff2)\)/g, "url(/assets/$2)");
  html = html.replace(cssLink[0], `<style>${inlined}</style>`);
}

// 3. Zéro JavaScript côté client : la page est entièrement statique, React ne sert qu'au build.
//    (Supprimer cette étape le jour où la page aura besoin d'interactivité : main.tsx hydratera.)
html = html.replace(/\s*<script type="module"[^>]*><\/script>/g, "");
html = html.replace(/\s*<link rel="modulepreload"[^>]*>/g, "");
let assets = await readdir(path.join(dist, "assets"));
for (const js of assets.filter((f) => f.endsWith(".js") || f.endsWith(".css"))) {
  await rm(path.join(dist, "assets", js));
}
assets = await readdir(path.join(dist, "assets"));

// 4. Préchargement de la police des titres.
const font = assets.find((f) => f.startsWith("bricolage-grotesque-latin-wght") && f.endsWith(".woff2"));
const preload = font
  ? `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin>`
  : "";
html = html.replace("<!--head-outlet-->", preload);

await writeFile(path.join(dist, "index.html"), html);
await rm(ssrDir, { recursive: true, force: true });
console.log(`Pré-rendu OK (${(Buffer.byteLength(html) / 1024).toFixed(1)} Ko)${font ? `, police préchargée : ${font}` : ""}`);
