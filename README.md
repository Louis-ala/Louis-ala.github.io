# Louis-ala.github.io

Portfolio de Louis Alary, en ligne sur https://louis-ala.github.io/

Construit avec React, TypeScript et Vite. La page est **pré-rendue en HTML statique au build** et ne livre aucun JavaScript au navigateur. React ne sert qu'à la générer.

## Développement

```bash
npm install
npm run dev       # serveur de développement sur http://localhost:5173
npm run build     # build + pré-rendu dans dist/
npm run preview   # aperçu du build
```

## Modifier le contenu

Tous les textes (pitch, parcours, compétences, projet, contacts) se trouvent dans `src/data/content.ts`.

Pour changer la photo, remplace `ressources/photo pro.jpg` (dossier non versionné), puis lance `python scripts/optimize-photo.py`. Le script régénère `src/assets/photo-*.avif|webp`.

## Déploiement

Chaque push sur `main` lance `.github/workflows/deploy.yml`, qui construit le site et le publie sur GitHub Pages.

Prérequis, à faire une seule fois : dans Settings → Pages, choisir la source **GitHub Actions**.
