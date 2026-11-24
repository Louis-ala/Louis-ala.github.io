// Pré-rendu statique : injecte le HTML de <App/> dans dist/index.html,
// intègre la feuille de style en ligne et précharge la police des titres.
import { cp, readFile, readdir, rm, writeFile } from "node:fs/promises";
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

// 3. Images importées par les composants : émises par le build serveur, copiées dans dist/.
const ssrAssets = path.join(ssrDir, "assets");
for (const file of await readdir(ssrAssets).catch(() => [])) {
  if (/\.(avif|webp|png|jpe?g|svg|woff2)$/.test(file)) await cp(path.join(ssrAssets, file), path.join(dist, "assets", file));
}

// 4. La feuille CSS, désormais en ligne, n'a plus besoin d'être publiée.
//    Le script client (src/client.ts : thème + halo, sans React) est conservé.
let assets = await readdir(path.join(dist, "assets"));
for (const css of assets.filter((f) => f.endsWith(".css"))) {
  await rm(path.join(dist, "assets", css));
}
assets = await readdir(path.join(dist, "assets"));

// 5. Préchargement de la police des titres.
const font = assets.find((f) => f.startsWith("bricolage-grotesque-latin-wght") && f.endsWith(".woff2"));
const preload = font
  ? `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin>`
  : "";
html = html.replace("<!--head-outlet-->", preload);

await writeFile(path.join(dist, "index.html"), html);
await rm(ssrDir, { recursive: true, force: true });
console.log(`Pré-rendu OK (${(Buffer.byteLength(html) / 1024).toFixed(1)} Ko)${font ? `, police préchargée : ${font}` : ""}`);
