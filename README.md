# Louis-ala.github.io

Portfolio de Louis Alary, en ligne sur https://louis-ala.github.io/

Construit avec React, TypeScript et Vite. La page est **pré-rendue en HTML statique au build**. Le navigateur ne reçoit qu'un script d'environ 1 Ko, pour le bouton de thème et le halo de la souris. Le fonctionnement est expliqué dans [ARCHITECTURE.md](ARCHITECTURE.md).

## Développement

```bash
npm install
npm run dev       # serveur de développement sur http://localhost:5173
npm run lint      # ESLint
npm run typecheck # vérification des types TypeScript
npm test          # tests unitaires (Vitest)
npm run build     # build + pré-rendu dans dist/
npm run preview   # aperçu du build
```

## Modifier le contenu

Tous les textes (pitch, parcours, compétences, projet, contacts) se trouvent dans `src/data/content.ts`.

Pour changer la photo, remplace `ressources/photo pro.jpg` (dossier non versionné), puis lance `python scripts/optimize-photo.py`. Le script régénère `src/assets/photo-*.avif|webp`.

## CI/CD

Le workflow `.github/workflows/ci.yml` fonctionne en deux temps :

- **CI**, sur chaque pull request et chaque push sur `main` : lint, vérification des types, tests et build.
- **CD**, uniquement sur `main` et seulement si la CI passe : déploiement sur GitHub Pages.

La branche `main` est protégée, donc toute modification passe par une pull request. Une PR ne peut être fusionnée que si la CI est verte.

```bash
git switch -c ma-modif
# ... modifications, commits ...
git push -u origin ma-modif
gh pr create --fill          # ouvre la PR
gh pr checks --watch         # suit la CI
gh pr merge --squash --delete-branch
```
