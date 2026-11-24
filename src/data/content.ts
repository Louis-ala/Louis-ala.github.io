// Tout le texte du portfolio est ici : modifier ce fichier suffit pour mettre le site à jour.

export const profile = {
  name: "Louis Alary",
  role: "Développeur web, en recherche d'alternance",
  pitch: [
    "Étudiant en 3e année de Bachelor développeur/concepteur à l'IPI Toulouse, je cherche une alternance pour construire des applications web utiles, de la maquette jusqu'au code testé.",
    "Trois années de double licence mathématiques et informatique m'ont donné le goût des problèmes bien posés et de l'algorithmique. Mon stage chez Celowen m'a appris à transformer une maquette Figma en interface React et TypeScript reliée à une vraie API.",
  ],
  location: "Basé à Toulouse, mobile dans toute la France",
  rhythm: "Rythme d'alternance : 3 semaines en entreprise, 1 semaine en cours",
  photoAlt: "Portrait de Louis Alary, souriant, en veste claire sur fond blanc",
} as const;

export type Contact = { label: string; value: string; href: string; external?: boolean };

export const contacts: Contact[] = [
  { label: "E-mail", value: "louisalary49@gmail.com", href: "mailto:louisalary49@gmail.com" },
  { label: "Téléphone", value: "06 72 83 11 22", href: "tel:+33672831122" },
  {
    label: "LinkedIn",
    value: "louis-alary28",
    href: "https://www.linkedin.com/in/louis-alary28/",
    external: true,
  },
  { label: "GitHub", value: "Louis-ala", href: "https://github.com/Louis-ala", external: true },
];

export type Step = {
  period: string;
  title: string;
  place: string;
  where: string;
  details?: string[];
};

export const experience: Step[] = [
  {
    period: "Mars – avril 2026",
    title: "Stage développeur frontend",
    place: "Celowen",
    where: "à distance",
    details: [
      "Prototype de l'application web conçu sur Figma",
      "Développement du frontend en TypeScript avec React",
      "Tests de la liaison entre le frontend et le backend",
    ],
  },
  {
    period: "Étés 2025 et 2026",
    title: "Employé commercial",
    place: "Leclerc Sapiac",
    where: "Montauban",
    details: ["Préparation de commandes", "Livraison drive"],
  },
  {
    period: "2019",
    title: "Stage d'observation de 3e",
    place: "3R, constructeur français de machines d'essai",
    where: "Montauban",
  },
];

export const education: Step[] = [
  {
    period: "2025 – aujourd'hui",
    title: "Bachelor développeur/concepteur",
    place: "IPI, Groupe Igensia",
    where: "Toulouse",
  },
  {
    period: "2022 – 2025",
    title: "Double licence mathématiques et informatique",
    place: "Université Toulouse III – Paul Sabatier",
    where: "Toulouse",
  },
];

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Langages",
    items: ["TypeScript", "JavaScript", "HTML", "CSS", "PHP", "Python", "Java", "C", "C++", "SQL / MySQL"],
  },
  { group: "Frameworks", items: ["React", "Angular", "Laravel", "Tailwind CSS"] },
  {
    group: "Méthodes",
    items: ["Design UI/UX", "Sécurité des développements", "Bases DevOps", "Algorithmique", "Logique formelle", "Algèbre linéaire"],
  },
  { group: "Langues", items: ["Français, langue maternelle", "Anglais courant"] },
];

// Valeurs réelles recalculées à partir de data/potions-craft.xlsx avec la logique de
// src/histogram/rentability.py (prix de vente moins coût des ingrédients et du diluant).
export type MagicType = "Noire" | "Rouge" | "Blanche" | "Verte" | "Bleue" | "Pourpre";

export const potionProject = {
  name: "Potion Craft",
  repo: "https://github.com/Louis-ala/py-potion-craft-cescosse-alary-sicre-main",
  team: "Projet à trois : Cescosse, Alary et Sicre",
  summary:
    "Un tableau de bord Streamlit qui explore un grimoire de 60 potions stocké dans un classeur Excel : ingrédients, diluants, prix de vente, inventeurs et types de magie. Quatre visualisations répondent chacune à une question : quelles potions rapportent le plus, comment se répartissent compétences et types de magie (sunburst), combien de potions par compétence (Kiviat) et qui a inventé quoi (réseau).",
  contributionTitle: "Ma partie : l'histogramme de rentabilité",
  contribution: [
    "Conversion de toutes les quantités d'ingrédients vers une unité commune, la pincée (souffle, nuage, poignée, once).",
    "Calcul du coût de production de chaque potion à partir des feuilles de prix des ingrédients et des diluants.",
    "Rentabilité = prix de vente − coût de production, puis sélection des 10 potions les plus rentables.",
    "Affichage en barres horizontales avec Plotly, colorées selon le type de magie.",
  ],
  stack: ["Python", "pandas", "Plotly", "Streamlit", "openpyxl"],
  chartCaption:
    "Les 10 potions les plus rentables (prix de vente moins coût de production). Valeurs recalculées avec mon module sur les données du projet.",
  top10: [
    { potion: "Potion de détection faussée", value: 2298, type: "Noire" },
    { potion: "Potion de protection contre les projectiles", value: 2276, type: "Noire" },
    { potion: "Potion de protection contre le chaos", value: 2044, type: "Rouge" },
    { potion: "Huile de ténèbres", value: 1686, type: "Blanche" },
    { potion: "Potion de pacte infernal", value: 1457, type: "Rouge" },
    { potion: "Potion de soins légers", value: 1427, type: "Verte" },
    { potion: "Potion d'invocation mineure", value: 1358, type: "Rouge" },
    { potion: "Potion d'armure de mage", value: 1225, type: "Blanche" },
    { potion: "Potion de résistances aux énergies destructives", value: 1164, type: "Bleue" },
    { potion: "Potion de bouclier de la foi", value: 1126, type: "Rouge" },
  ] satisfies { potion: string; value: number; type: MagicType }[],
};
