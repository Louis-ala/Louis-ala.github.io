import { education, experience, type Step } from "../data/content";

function Timeline({ title, steps }: { title: string; steps: Step[] }) {
  return (
    <div className="timeline">
      <h3>{title}</h3>
      <ol>
        {steps.map((s) => (
          <li key={s.title} className="timeline__item">
            <p className="timeline__period">{s.period}</p>
            <h4>{s.title}</h4>
            <p className="timeline__place">
              {s.place}, {s.where}
            </p>
            {s.details && (
              <ul>
                {s.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Journey() {
  return (
    <section className="section" aria-labelledby="parcours">
      <h2 id="parcours">Parcours</h2>
      <div className="journey">
        <Timeline title="Expérience" steps={experience} />
        <Timeline title="Formation" steps={education} />
      </div>
    </section>
  );
}
