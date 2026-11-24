import { m } from "motion/react";
import { useEffect, useState } from "react";
import { GITHUB_USER, repoExtras, type RepoExtra } from "../data/content";
import { Chapter } from "../components/ui/Chapter";
import { Reveal } from "../components/ui/Reveal";
import { Tag } from "../components/ui/Tag";
import { fetchReposCached, languageShares, type Repo } from "../lib/github";
import { EASE_SNAP } from "../lib/motion";

const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178C6",
  JavaScript: "#E0B000",
  PHP: "#777BB4",
  Java: "#B07219",
  HTML: "#E34C26",
  CSS: "#663399",
  Blade: "#F7523F",
  C: "#555555",
  "C++": "#F34B7D",
};

const monthYear = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
const number = new Intl.NumberFormat("fr-FR");

function prettyName(name: string) {
  return name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function RentabilityChart({ chart }: { chart: NonNullable<RepoExtra["chart"]> }) {
  const max = Math.max(...chart.data.map((d) => d.value));
  const types = [...new Set(chart.data.map((d) => d.type))];
  return (
    <figure className="mt-6 rounded-2xl border border-line bg-ink/40 p-4 md:p-5">
      <figcaption className="text-sm text-muted">{chart.caption}</figcaption>
      <ol className="mt-4 grid gap-2.5">
        {chart.data.map((d, i) => (
          <li key={d.potion} className="grid grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-x-3 text-sm">
            <span className="col-span-2 mb-0.5 leading-snug">
              {d.potion}
              <span className="sr-only">, magie {d.type.toLowerCase()} :</span>
            </span>
            <span className="block h-3" aria-hidden="true">
              <m.span
                data-magic={d.type}
                className="block h-full origin-left rounded-r"
                style={{ width: `${((d.value / max) * 100).toFixed(1)}%` }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: EASE_SNAP }}
              />
            </span>
            <span className="text-right font-pixel text-xs">{number.format(d.value)}</span>
          </li>
        ))}
      </ol>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Types de magie">
        {types.map((t) => (
          <li key={t} className="inline-flex items-center gap-1.5">
            <span data-magic={t} className="size-3 rounded-sm" aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
    </figure>
  );
}

function QuestCard({ repo, index }: { repo: Repo; index: number }) {
  const extra = repoExtras[repo.name];
  const title = extra?.title ?? prettyName(repo.name);
  const langs = languageShares(repo.languages);
  const summary = extra?.summary ?? repo.description ?? "Projet public sur GitHub.";
  const featured = !!extra?.contribution;

  return (
    <Reveal
      as="article"
      delay={index * 0.06}
      className={`rounded-3xl border border-line bg-surface p-6 transition-colors duration-300 hover:border-violet/60 md:p-8 ${featured ? "lg:col-span-2" : ""}`}
    >
      <div className={featured ? "grid gap-8 lg:grid-cols-[1fr_1.1fr]" : ""}>
        <div>
          <div className="flex flex-wrap items-center gap-3 font-pixel text-xs text-muted">
            <span className="text-gold">Quête {featured ? "principale" : "annexe"}</span>
            <span>
              <span aria-hidden="true">★ </span>
              {repo.stars} étoile{repo.stars > 1 ? "s" : ""}
            </span>
            <span>Mise à jour : {monthYear.format(new Date(repo.pushedAt))}</span>
          </div>
          <h3 className="mt-3 text-3xl font-extrabold">{title}</h3>
          {extra?.team && <p className="mt-1 text-muted italic">{extra.team}</p>}
          <p className="mt-4 text-lg">{summary}</p>

          {langs.length > 0 && (
            <div className="mt-6">
              <div className="flex h-2.5 overflow-hidden rounded-full bg-raised" aria-hidden="true">
                {langs.map((l) => (
                  <span key={l.name} style={{ width: `${l.share}%`, background: LANG_COLORS[l.name] ?? "var(--color-muted)" }} />
                ))}
              </div>
              <ul className="mt-2 flex flex-wrap gap-x-4 text-sm text-muted" aria-label="Langages">
                {langs.map((l) => (
                  <li key={l.name} className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ background: LANG_COLORS[l.name] ?? "var(--color-muted)" }} aria-hidden="true" />
                    {l.name} {l.share} %
                  </li>
                ))}
              </ul>
            </div>
          )}

          {extra?.stack && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
              {extra.stack.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center rounded-full border-2 border-violet px-5 font-display font-bold text-violet transition-colors duration-200 hover:bg-violet hover:text-on-accent"
            >
              Code de {title} sur GitHub
            </a>
            {repo.homepage && (
              <a
                href={repo.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center rounded-full bg-court px-5 font-display font-bold text-on-accent"
              >
                Démo de {title}
              </a>
            )}
          </div>
        </div>

        {extra?.contribution && (
          <div>
            <h4 className="font-display text-xl font-bold">{extra.contributionTitle}</h4>
            <ol className="mt-4 space-y-3">
              {extra.contribution.map((c, i) => (
                <li key={c} className="flex gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-violet font-pixel text-xs text-on-accent" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>
            {extra.chart && <RentabilityChart chart={extra.chart} />}
          </div>
        )}
      </div>
    </Reveal>
  );
}

export function Quests({ initialRepos }: { initialRepos: Repo[] }) {
  const [repos, setRepos] = useState(initialRepos);
  const [status, setStatus] = useState<"idle" | "error">("idle");

  // Rafraîchit depuis l'API ; en cas d'échec (hors ligne, quota), les données du build restent.
  useEffect(() => {
    let cancelled = false;
    fetchReposCached(GITHUB_USER)
      .then((fresh) => !cancelled && setRepos(fresh))
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Chapter
      id="quetes"
      title="Quêtes accomplies"
      intro="Mes projets publics, récupérés en direct depuis GitHub. Pour chacun, ce que j'y ai construit."
    >
      {repos.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {repos.map((repo, i) => (
            <QuestCard key={repo.name} repo={repo} index={i} />
          ))}
        </div>
      ) : (
        <p className="rounded-3xl border border-dashed border-line p-8 text-center text-muted">
          {status === "error"
            ? "GitHub ne répond pas pour le moment. Mes projets restent visibles directement sur mon profil GitHub."
            : "Chargement des quêtes depuis GitHub…"}
        </p>
      )}
      <p className="mt-6 text-sm text-muted">
        <a className="font-display font-semibold text-violet underline underline-offset-4" href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noopener noreferrer">
          Tout mon profil GitHub
        </a>
      </p>
    </Chapter>
  );
}
