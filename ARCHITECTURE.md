# Architecture du portfolio

Le portfolio tient sur une seule page, écrite en **React + TypeScript**, compilée avec **Vite** et hébergée sur **GitHub Pages**.

Son point clé : la page est **pré-rendue en HTML au moment du build**. Le navigateur reçoit du HTML et du CSS prêts à afficher, plus un **petit script d'1 Ko** qui gère le bouton de thème et le halo de la souris.

React sert seulement à générer la page : il n'est **pas** envoyé au navigateur.

## Arborescence

```
├── index.html                 Gabarit HTML : <head>, SEO, script de thème, emplacements à remplir
├── src/
│   ├── data/content.ts        TOUS les textes du site (pitch, parcours, projet, contacts…)
│   ├── App.tsx                Assemble les sections de la page
│   ├── components/            Une section par fichier
│   │   ├── ThemeToggle.tsx    Bouton clair / sombre (balisage seulement)
│   │   ├── Hero.tsx           Nom, pitch, disponibilité, photo, boutons de contact
│   │   ├── Project.tsx        Potion Craft + graphique de rentabilité
│   │   ├── Journey.tsx        Parcours : expérience et formation
│   │   ├── Skills.tsx         Compétences
│   │   └── Contact.tsx        Pied de page avec les contacts
│   ├── enhance/               Comportements côté navigateur, en TypeScript simple, sans React
│   │   ├── theme.ts           Bascule clair / sombre, mémorisée dans localStorage
│   │   └── glow.ts            Halo qui suit la souris
│   ├── client.ts              Point d'entrée navigateur : branche enhance/ (et main.tsx en dev)
│   ├── main.tsx               Affiche la page avec React (développement uniquement)
│   ├── entry-server.tsx       Transforme <App/> en chaîne HTML (utilisé au build)
│   ├── styles.css             Tout le style (couleurs, thèmes, responsive)
│   ├── assets/                Photo optimisée (AVIF / WebP, 3 tailles)
│   └── **/*.test.ts(x)        Tests Vitest
├── scripts/
│   ├── prerender.mjs          Injecte le HTML dans dist/index.html, puis l'optimise
│   └── optimize-photo.py      Génère les variantes de la photo
├── public/                    Copié tel quel : favicon, robots.txt, llms.txt
└── .github/workflows/ci.yml   CI/CD
```

## Le build, étape par étape

`npm run build` enchaîne quatre commandes :

```
tsc -b                 1. Vérifie les types
vite build             2. Bundle client → dist/ (client.ts + CSS + police)
vite build --ssr …     3. Bundle serveur → dist-ssr/ (entry-server.js + images)
node prerender.mjs     4. Assemble la page finale
```

`scripts/prerender.mjs` fait ceci :

1. Il appelle `render()` et place le HTML obtenu à la place de `<!--app-outlet-->` (**c'est le pré-rendu**, ligne `html.replace("<!--app-outlet-->", render())`).
2. Il **intègre le CSS dans la page** (`<style>`), ce qui économise une requête bloquante.
3. Il **copie les images** émises par le build serveur dans `dist/assets/`.
4. Il supprime le fichier CSS devenu inutile.
5. Il **précharge la police** des titres et supprime `dist-ssr/`.

> **Pourquoi pas React dans le navigateur ?** La page n'a besoin que de deux petites interactions. Avec React (hydratation, environ 70 Ko), Lighthouse Performance en mobile plafonnait à 99. Avec 1 Ko de TypeScript simple, on reste à 100.
> Si la page devient plus interactive, on peut revenir à React : il suffit que `client.ts` appelle `hydrateRoot` comme le fait `main.tsx`.

## Données et composants

- **Le contenu est séparé de la présentation.** Pour modifier un texte, on ne touche qu'à `src/data/content.ts`. Les composants se contentent de parcourir ces données.
- **Le graphique de rentabilité** (`Project.tsx`) est en HTML/CSS pur. Chaque barre est un `<span>` dont la largeur vaut `valeur / max × 100 %`, et sa couleur dépend de l'attribut `data-type` (le type de magie).
- **L'accessibilité** passe par :
  - un seul `<h1>` et une hiérarchie `h2 > h3 > h4` ;
  - un lien « Aller au contenu » ;
  - un texte alternatif sur la photo ;
  - un texte masqué qui annonce le type de magie aux lecteurs d'écran ;
  - un bouton de thème avec `aria-pressed`.

## Thème clair / sombre

- **Couleurs** : dans `styles.css`, chaque couleur est écrite `light-dark(valeur claire, valeur sombre)`. Le navigateur choisit la valeur selon `color-scheme`.
- **Sans choix de l'utilisateur** : le site suit le réglage du système (`color-scheme: light dark`).
- **Clic sur le bouton** : `theme.ts` pose `<html data-theme="dark">` (ou `light`), ce qui force `color-scheme`. Il enregistre aussi le choix dans `localStorage`.
- **Pas de flash au chargement** : un mini-script dans le `<head>` de `index.html` applique le thème enregistré **avant** le premier affichage.
- **Sans JavaScript** : le bouton reste caché (`visibility: hidden` tant que `data-ready` est absent), puisqu'il ne servirait à rien.

## Halo de la souris (`glow.ts`)

- Un disque flou (`radial-gradient`) est placé derrière le contenu (`.page` a `z-index: 1`).
- À chaque mouvement, on mémorise la position du pointeur. Une boucle `requestAnimationFrame` rapproche le halo de 14 % de la distance restante à chaque image, d'où l'effet de léger retard. La boucle **s'arrête** dès que le halo est arrivé.
- Le halo est déplacé uniquement par `transform`, ce qui évite tout recalcul de mise en page.
- Il est **désactivé** sur écran tactile et quand l'utilisateur demande moins d'animations (`prefers-reduced-motion`).
- Pour régler l'intensité, modifie `--glow` dans `styles.css`.

## Photo

`scripts/optimize-photo.py` recadre `ressources/photo pro.jpg` (non versionné) en 3:4. Il l'exporte ensuite en AVIF et en WebP aux largeurs 160, 320 et 480 px, soit 4 à 18 Ko au lieu de 3,2 Mo.

Dans `Hero.tsx`, la balise `<picture>` laisse le navigateur choisir le format et la taille adaptés.

## Qualité : lint et tests

| Commande | Rôle |
|---|---|
| `npm run lint` | ESLint (règles JS, TypeScript et hooks React) |
| `npm run typecheck` | Vérification des types TypeScript |
| `npm test` | 19 tests Vitest |

- `content.test.ts` vérifie les données : aucune donnée privée du CV, liens de contact valides, top 10 trié.
- `App.test.tsx` vérifie le rendu HTML : un seul `h1`, ordre des sections, liens, photo, bouton de thème accessible.
- `enhance.test.ts` vérifie la logique du thème (valeurs acceptées, bascule) et du halo (le halo converge vers le pointeur).

## CI/CD (`.github/workflows/ci.yml`)

```
Pull request ──► CI : npm ci → lint → types → tests → build
Push sur main ─► CI ──(si verte)──► Déploiement GitHub Pages
```

`main` est protégée :

- les modifications passent obligatoirement par une pull request ;
- une PR ne se fusionne que si la CI est verte.

Flux de travail :

```bash
git switch -c ma-modif
git push -u origin ma-modif
gh pr create --fill
gh pr checks --watch
gh pr merge --squash --delete-branch
```

## Recettes rapides

- **Changer un texte** : modifier `src/data/content.ts`.
- **Changer une couleur** : modifier la paire `light-dark(clair, sombre)` en haut de `styles.css`.
- **Changer l'intensité du halo** : modifier la variable `--glow` dans `styles.css`.
- **Changer la photo** : remplacer `ressources/photo pro.jpg`, puis lancer `python scripts/optimize-photo.py`.
