import { skills } from "../data/content";

export function Skills() {
  return (
    <section className="section" aria-labelledby="competences">
      <h2 id="competences">Compétences</h2>
      <div className="skills">
        {skills.map((g) => (
          <div key={g.group} className="skills__group">
            <h3>{g.group}</h3>
            <ul className="tags">
              {g.items.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
