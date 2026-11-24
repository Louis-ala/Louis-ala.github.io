import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Dépôt Louis-ala.github.io : le site est servi à la racine du domaine.
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    // La police et les images doivent rester des fichiers séparés (cache, préchargement).
    assetsInlineLimit: 0,
    // Les images ne sont importées que par les composants, donc par le build serveur :
    // il doit les émettre pour que scripts/prerender.mjs les copie dans dist/.
    ssrEmitAssets: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
