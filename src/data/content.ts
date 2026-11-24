// Tout le texte du portfolio est ici : modifier ce fichier suffit pour mettre le site à jour.
// Règle : uniquement des faits (CV, projets réels). Aucun chiffre d'impact inventé.

export const GITHUB_USER = "Louis-ala";

export const profile = {
  name: "Louis Alary",
  tagline: "Développeur web en quête d'alternance.",
  hook: "Je code comme je joue au basket : vite, en équipe, et en visant juste. De la maquette Figma au composant React testé, j'aime les interfaces où chaque détail a une raison d'être.",
  photoAlt: "Portrait de Louis Alary, souriant, en veste claire sur fond blanc",
  stats: [
    { label: "Classe", value: "Développeur web" },
    { label: "Niveau", value: "Bachelor, 3e année" },
    { label: "Base", value: "Toulouse" },
    { label: "Portée", value: "Toute la France" },
  ],
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
  { label: "GitHub", value: GITHUB_USER, href: `https://github.com/${GITHUB_USER}`, external: true },
];

export const EMAIL = contacts[0].value;

/* ---------- Chapitres (navigation par marque-pages) ---------- */

export const chapters = [
  { id: "prologue", numeral: "", label: "Prologue" },
  { id: "passions", numeral: "I", label: "Passions" },
  { id: "quetes", numeral: "II", label: "Quêtes" },
  { id: "parcours", numeral: "III", label: "Parcours" },
  { id: "fiche", numeral: "IV", label: "Fiche personnage" },
  { id: "contact", numeral: "", label: "Épilogue" },
] as const;

export type ChapterId = (typeof chapters)[number]["id"];

/* ---------- Chapitre I : passions ---------- */

export const passions = {
  sport: {
    title: "Basket et rugby",
    also: "Et aussi le foot et le volley, dès qu'il y a un ballon.",
    story:
      "Sur un terrain, on lit le jeu, on décide en une fraction de seconde et on joue pour l'équipe, pas pour soi.",
    inCode: "c'est la même chose. Comprendre vite le contexte, livrer au bon moment, faire briller le collectif.",
  },
  games: {
    title: "Zelda, Hollow Knight et jeux d'énigme",
    story: "J'aime les mondes qu'on déchiffre pièce par pièce, et les boss qu'on finit par battre à force d'essais.",
    inCode: "Un bug, c'est un boss : on observe ses patterns, on découpe le problème, on recommence jusqu'à trouver l'ouverture.",
  },
  reading: {
    title: "Fantasy à la Tolkien",
    story: "Des cartes, des langues inventées, des univers cohérents jusque dans les détails.",
    inCode: "C'est ce que je cherche dans une interface : une histoire claire et un système de design où tout tient ensemble.",
  },
  base: { title: "Basé à Toulouse", detail: "Mobile dans toute la France" },
  rhythm: { title: "Rythme d'alternance", detail: "3 semaines en entreprise, 1 semaine en cours" },
} as const;

/* ---------- Chapitre III : parcours (ordre chronologique, récit) ---------- */

export type JourneyStep = {
  id: string;
  period: string;
  kind: "Formation" | "Expérience";
  title: string;
  place: string;
  where: string;
  challenge: string;
  actions: string[];
  takeaway: string;
};

export const journey: JourneyStep[] = [
  {
    id: "3r",
    period: "2019",
    kind: "Expérience",
    title: "Stage d'observation de 3e",
    place: "3R, constructeur français de machines d'essai",
    where: "Montauban",
    challenge: "Premier pas dans une entreprise industrielle.",
    actions: ["Découverte de la conception et de la fabrication de machines d'essai"],
    takeaway: "Un produit qui sert à mesurer ne tolère pas l'approximation. J'ai gardé ce goût de la précision.",
  },
  {
    id: "ups",
    period: "2022 – 2025",
    kind: "Formation",
    title: "Double licence mathématiques et informatique",
    place: "Université Toulouse III – Paul Sabatier",
    where: "Toulouse",
    challenge: "Mener de front deux disciplines exigeantes pendant trois ans.",
    actions: [
      "Algorithmique, algèbre linéaire, théorie des ensembles",
      "Logique des prédicats et logique propositionnelle",
      "Programmation en C, C++, Python et Java",
    ],
    takeaway: "Je sais poser un problème proprement avant de l'attaquer : c'est la moitié du travail.",
  },
  {
    id: "leclerc",
    period: "Étés 2025 et 2026",
    kind: "Expérience",
    title: "Employé commercial",
    place: "Leclerc Sapiac",
    where: "Montauban",
    challenge: "Tenir le rythme quand des clients attendent leur commande à l'heure.",
    actions: ["Préparation de commandes", "Livraison drive"],
    takeaway: "Fiabilité et sens du délai : une commande en retard, c'est un utilisateur déçu.",
  },
  {
    id: "ipi",
    period: "2025 – aujourd'hui",
    kind: "Formation",
    title: "Bachelor développeur/concepteur",
    place: "IPI, Groupe Igensia",
    where: "Toulouse",
    challenge: "Passer de la théorie à la construction d'applications web complètes.",
    actions: [
      "Front : React, Angular, TypeScript, Tailwind CSS",
      "Back : PHP, Laravel, MySQL",
      "Sécurité des développements, bases DevOps, design UI/UX",
    ],
    takeaway: "Je vois maintenant toute la chaîne, de la base de données jusqu'au pixel.",
  },
  {
    id: "celowen",
    period: "Mars – avril 2026",
    kind: "Expérience",
    title: "Stage développeur frontend",
    place: "Celowen",
    where: "à distance",
    challenge: "Construire le frontend d'une application web, en autonomie et à distance.",
    actions: [
      "Prototype de l'application conçu sur Figma",
      "Développement du frontend en TypeScript avec React",
      "Tests de la liaison entre le frontend et le backend",
    ],
    takeaway: "J'ai transformé une maquette en interface testée et branchée à une vraie API.",
  },
];

export const nextQuest = {
  title: "Prochaine quête : votre équipe",
  text: "Une alternance en développement web, au rythme de 3 semaines en entreprise et 1 semaine en cours. Basé à Toulouse, mobile dans toute la France.",
};

/* ---------- Chapitre IV : fiche personnage ---------- */

export type Skill = { name: string; usedIn: string };
export type SkillDomain = { domain: string; glyph: string; items: Skill[] };

export const inventory: SkillDomain[] = [
  {
    domain: "Front",
    glyph: "◆",
    items: [
      { name: "React", usedIn: "Stage Celowen et ce portfolio" },
      { name: "TypeScript", usedIn: "Stage Celowen et ce portfolio" },
      { name: "JavaScript", usedIn: "Projets de cours à l'IPI" },
      { name: "Angular", usedIn: "Bachelor à l'IPI" },
      { name: "HTML et CSS", usedIn: "Tous mes projets web, dont ce portfolio" },
      { name: "Tailwind CSS", usedIn: "Ce portfolio" },
    ],
  },
  {
    domain: "Back",
    glyph: "▲",
    items: [
      { name: "PHP", usedIn: "Bachelor à l'IPI" },
      { name: "Laravel", usedIn: "Bachelor à l'IPI" },
      { name: "MySQL", usedIn: "Bachelor à l'IPI" },
    ],
  },
  {
    domain: "Langages",
    glyph: "●",
    items: [
      { name: "Python", usedIn: "Potion Craft et licence à l'UPS" },
      { name: "Java", usedIn: "Licence à l'UPS" },
      { name: "C et C++", usedIn: "Licence à l'UPS" },
    ],
  },
  {
    domain: "Data",
    glyph: "■",
    items: [
      { name: "pandas", usedIn: "Potion Craft : calcul de la rentabilité" },
      { name: "Plotly", usedIn: "Potion Craft : histogramme de rentabilité" },
      { name: "Streamlit", usedIn: "Potion Craft : tableau de bord" },
    ],
  },
  {
    domain: "Outils",
    glyph: "✦",
    items: [
      { name: "Figma", usedIn: "Stage Celowen : prototype de l'application" },
      { name: "Git et GitHub", usedIn: "Tous mes projets" },
      { name: "GitHub Actions", usedIn: "CI/CD de ce portfolio" },
      { name: "Vitest et ESLint", usedIn: "Tests et lint de ce portfolio" },
      { name: "Sécurité des développements", usedIn: "Bachelor à l'IPI" },
      { name: "Bases DevOps", usedIn: "Bachelor à l'IPI" },
    ],
  },
];

export const traits = [
  {
    name: "Esprit d'équipe",
    source: "Basket et rugby",
    text: "Je joue pour le collectif : passer le ballon, couvrir un coéquipier, partager ce que je sais.",
  },
  {
    name: "Persévérance",
    source: "Hollow Knight et énigmes",
    text: "Un problème difficile ne me décourage pas : j'essaie, j'observe, j'ajuste.",
  },
  {
    name: "Clarté",
    source: "Lecture",
    text: "J'aime raconter les choses simplement, dans le code comme dans une documentation.",
  },
  {
    name: "Fiabilité",
    source: "Leclerc Sapiac",
    text: "Ce qui est promis pour une heure donnée est prêt à cette heure-là.",
  },
  {
    name: "Sérénité",
    source: "Sous la pression d'un match",
    text: "Je reste calme et patient quand la situation se tend, même en fin de sprint.",
  },
  {
    name: "Sociable",
    source: "Vestiaire et open space",
    text: "Je m'intègre vite dans une équipe et j'aime échanger avec les autres métiers.",
  },
] as const;

export const languages = ["Français, langue maternelle", "Anglais courant"] as const;

/* ---------- Chapitre II : enrichissements locaux des dépôts GitHub ---------- */

export type MagicType = "Noire" | "Rouge" | "Blanche" | "Verte" | "Bleue" | "Pourpre";

export type RepoExtra = {
  title: string;
  summary: string;
  team?: string;
  contributionTitle?: string;
  contribution?: string[];
  stack?: string[];
  chart?: { caption: string; data: { potion: string; value: number; type: MagicType }[] };
};

// Clé : nom exact du dépôt GitHub. Les dépôts sans entrée s'affichent avec les données de l'API.
export const repoExtras: Record<string, RepoExtra> = {
  "py-potion-craft-cescosse-alary-sicre-main": {
    title: "Potion Craft",
    team: "Projet à trois : Cescosse, Alary et Sicre",
    summary:
      "Un tableau de bord Streamlit qui explore un grimoire de 60 potions : ingrédients, diluants, prix de vente, inventeurs et types de magie, en quatre visualisations.",
    contributionTitle: "Ma partie : l'histogramme de rentabilité",
    contribution: [
      "Conversion des quantités vers une unité commune, la pincée (souffle, nuage, poignée, once).",
      "Coût de production calculé à partir des prix des ingrédients et des diluants.",
      "Rentabilité = prix de vente − coût, puis sélection des 10 potions les plus rentables.",
      "Barres horizontales Plotly colorées selon le type de magie.",
    ],
    stack: ["Python", "pandas", "Plotly", "Streamlit"],
    // Valeurs réelles recalculées sur data/potions-craft.xlsx avec la logique de src/histogram/rentability.py.
    chart: {
      caption: "Top 10 des potions les plus rentables, recalculé avec mon module.",
      data: [
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
      ],
    },
  },
};
