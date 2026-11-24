import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dépôt Louis-ala.github.io : le site est servi à la racine du domaine.
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: {
    // Polices et images restent des fichiers séparés (cache, préchargement).
    assetsInlineLimit: 0,
    // Les images sont aussi importées par le build serveur ; scripts/prerender.mjs les recopie.
    ssrEmitAssets: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
