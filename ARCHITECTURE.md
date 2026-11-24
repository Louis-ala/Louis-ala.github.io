# Architecture du portfolio, « La Quête »

Le portfolio est un livre d'aventure interactif d'une seule page, écrit en **React + TypeScript** avec **Vite**, **Tailwind CSS v4** et **Motion** (Framer Motion). Il est hébergé sur **GitHub Pages**.

Le principe :
1. **Au build**, la page est **pré-rendue en HTML**, avec les dépôts GitHub déjà récupérés : elle est lisible immédiatement et indexable.
2. **Dans le navigateur**, React **hydrate** ce HTML pour activer les animations, le mini-jeu, le changer le thème et le rafraîchissement des projets.

## Arborescence

```
src/
├── data/content.ts          TOUS les textes : profil, passions, parcours, inventaire, traits, enrichissements de dépôts
├── App.tsx                  Assemble l'interface fixe (HUD, marque-pages, curseur) et les chapitres
├── sections/                Un chapitre par fichier
│   ├── Prologue.tsx         Accroche, carte de personnage, emplacement du mini-jeu
│   ├── Passions.tsx         Bento grid : sport, jeux vidéo, lecture (illustrations animées)
│   ├── Quests.tsx           Projets GitHub + graphique de rentabilité Potion Craft
│   ├── Journey.tsx          Timeline interactive (défi / actions / enseignement)
│   ├── CharacterSheet.tsx   Inventaire des hard skills, traits (soft skills), langues
│   └── Epilogue.tsx         Appel à l'action et contacts
├── components/ui/           Briques du design system
│   ├── HudBar.tsx           Barre du haut : jauge d'XP liée au scroll, chapitre courant
│   ├── Bookmarks.tsx        Marque-pages : rubans à droite (desktop), barre en bas (mobile)
│   ├── Cursor.tsx           Réticule de visée (desktop uniquement)
│   ├── ThemeToggle.tsx      Bouton « Changer le thème »
│   ├── Chapter.tsx          En-tête de chapitre (numéro, titre, chapeau)
│   ├── Reveal.tsx           Apparition au scroll, sans casser le HTML pré-rendu
│   └── Tag.tsx
├── game/                    Mini-jeu « Buzzer Beater »
│   ├── engine.ts            Physique et règles, sans dessin (testé)
│   ├── render.ts            Dessin Canvas
│   └── BuzzerBeater.tsx     Boucle, commandes, HUD, accessibilité
├── lib/
│   ├── github.ts            API GitHub : récupération, filtres, langages, cache
│   ├── theme.ts             Thème nuit / lecture
│   ├── motion.ts            Courbe « nerveuse », media queries
│   └── useActiveChapter.ts  Chapitre en cours de lecture
├── main.tsx                 Navigateur : hydratation
├── entry-server.tsx         Build : rendu HTML (render) + fetchRepos pour le pré-rendu
└── styles.css               Tailwind, jetons (@theme), polices
scripts/prerender.mjs        Assemble dist/index.html
```

## Build et pré-rendu

`npm run build` enchaîne quatre étapes : `tsc -b`, puis `vite build` (client), puis `vite build --ssr` (serveur), puis `node scripts/prerender.mjs`.

Le script `prerender.mjs` :
1. récupère les dépôts via `fetchRepos` (avec `GITHUB_TOKEN` en CI) ; si GitHub ne répond pas, le build continue quand même ;
2. remplace `<!--app-outlet-->` par `render(repos)` (**c'est le pré-rendu**) et injecte les dépôts en JSON (`#quests-data`), pour que l'hydratation parte des mêmes données ;
3. intègre le CSS dans la page et précharge les polices Bricolage et Literata.

## Design system

- **Jetons** (`styles.css`, bloc `@theme`) : chaque couleur est écrite `light-dark(changer le thème, mode nuit)`. Tailwind les expose en classes (`bg-ink`, `text-violet`, `text-gold`…). Tous les couples texte/fond ont un contraste d'au moins 5:1.
- **Thème** : nuit par défaut. « Changer le thème » pose `<html data-theme="light">`, et un mini-script dans `index.html` applique le choix avant l'affichage.
- **Polices** :
  - Bricolage Grotesque pour les titres (énergie) ;
  - Literata pour le récit (lecture) ;
  - Silkscreen pour l'interface de jeu (score, stats).
- **Mouvement** : courbe `EASE_SNAP` (départ explosif, arrivée amortie), uniquement `transform` et `opacity`. `MotionConfig reducedMotion="user"` coupe les mouvements si le système le demande. Dans ce cas, le curseur personnalisé et les effets du jeu sont désactivés.
- **`LazyMotion` + `m`** : seules les fonctions d'animation utilisées sont incluses.
- **`Reveal`** : le HTML pré-rendu reste visible. Seuls les éléments situés sous l'écran sont masqués avant d'apparaître, donc rien ne clignote.

## Mini-jeu « Buzzer Beater »

- **Moteur** (`engine.ts`) : un terrain virtuel de 480 × 320 et une gravité. Le cercle a deux points de collision, la planche une surface de rebond, et le sol fait rebondir la balle. Un panier est compté quand le centre de la balle traverse le cercle vers le bas.
- **Points** : 2 ou 3 selon la distance, +1 pour un « swish » (sans toucher le cercle), et un bonus de combo pour les paniers d'affilée. Un tir lancé avant la sirène compte encore (« buzzer beater »).
- **Rendu** (`render.ts`) : traînée, filet qui ondule, secousse, textes « +3 ». Les couleurs viennent des jetons du thème.
- **Commandes** :
  - souris ou doigt : glisser façon lance-pierre ;
  - clavier : flèches pour l'angle et la puissance, Espace pour tirer, Échap pour la pause.
- **Accessibilité** : les annonces passent par `aria-live`.
- **Performance** :
  - le jeu est chargé à la demande (`React.lazy`) ;
  - la boucle `requestAnimationFrame` s'arrête dès que rien ne bouge ;
  - la partie se met en pause si le jeu sort de l'écran ou si l'onglet est caché.

## Projets GitHub (`lib/github.ts`)

- **Filtres** : sont exclus les forks, les dépôts archivés et la liste `EXCLUDED_REPOS` (portfolio, profil, examens et cours), ainsi que les noms contenant `exam`, `cours`, `tp`…
- **Tri** : étoiles d'abord, puis activité récente.
- **Enrichissement** : `repoExtras` (dans `content.ts`) ajoute un titre, un résumé, « ma contribution » et un graphique pour un dépôt donné.
- **Navigateur** : les dépôts sont rafraîchis avec un cache d'une heure (`sessionStorage`) ; en cas d'échec, les données du build restent affichées.

## Qualité et CI/CD

`npm run lint`, `npm run typecheck`, `npm test` (Vitest) :
- moteur du jeu : chaque position de panier est atteignable, combos, sirène ;
- filtres GitHub ;
- contenu : aucune donnée privée, aucun chiffre inventé ;
- rendu pré-calculé.

Le workflow `.github/workflows/ci.yml` lance lint, types, tests et build sur chaque PR, puis le déploiement Pages sur `main`. `main` est protégée : on passe par une PR.

## Recettes rapides

- **Changer un texte** : modifier `src/data/content.ts`.
- **Mettre en avant un nouveau dépôt** : ajouter une entrée dans `repoExtras`. Sans entrée, la carte utilise la description GitHub.
- **Exclure un dépôt** : l'ajouter à `EXCLUDED_REPOS` dans `src/lib/github.ts`.
- **Changer une couleur** : modifier la paire `light-dark()` dans le bloc `@theme` de `styles.css`.
- **Régler la difficulté du jeu** : modifier les constantes en haut de `src/game/engine.ts`. Le test « chaque position de panier peut être marquée » garantit que le jeu reste jouable.
