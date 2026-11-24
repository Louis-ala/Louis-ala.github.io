import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dépôt Louis-ala.github.io : le site est servi à la racine du domaine.
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    // La police et les images doivent rester des fichiers séparés (cache, préchargement).
    assetsInlineLimit: 0,
  },
});
