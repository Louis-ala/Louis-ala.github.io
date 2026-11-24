import { potionProject as project, type MagicType } from "../data/content";

const max = Math.max(...project.top10.map((p) => p.value));
const legend: MagicType[] = ["Noire", "Rouge", "Blanche", "Verte", "Bleue"];
const format = new Intl.NumberFormat("fr-FR");

export function Project() {
  return (
    <section className="section" aria-labelledby="projets">
      <h2 id="projets">Projet</h2>

      <article className="project">
        <div className="project__intro">
          <h3>{project.name}</h3>
          <p className="project__team">{project.team}</p>
          <p>{project.summary}</p>
          <ul className="tags" aria-label="Technologies utilisées">
            {project.stack.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p>
            <a className="text-link" href={project.repo} target="_blank" rel="noopener noreferrer">
              Voir le code de Potion Craft sur GitHub
            </a>
          </p>
        </div>

        <div className="project__mine">
          <h4>{project.contributionTitle}</h4>
          <ul className="steps">
            {project.contribution.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <figure className="chart">
            <figcaption>{project.chartCaption}</figcaption>
            <ol className="chart__bars">
              {project.top10.map((p) => (
                <li key={p.potion} className="chart__row">
                  <span className="chart__label">
                    {p.potion}
                    <span className="visually-hidden">, magie {p.type.toLowerCase()} :</span>
                  </span>
                  <span className="chart__track" aria-hidden="true">
                    <span
                      className="chart__bar"
                      data-type={p.type}
                      style={{ inlineSize: `${((p.value / max) * 100).toFixed(1)}%` }}
                    />
                  </span>
                  <span className="chart__value">{format.format(p.value)}</span>
                </li>
              ))}
            </ol>
            <ul className="chart__legend" aria-label="Types de magie">
              {legend.map((t) => (
                <li key={t}>
                  <span className="chart__swatch" data-type={t} aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </figure>
        </div>
      </article>
    </section>
  );
}
