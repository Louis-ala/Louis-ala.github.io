import { contacts, profile } from "../data/content";

export function Contact() {
  return (
    <footer className="contact" aria-labelledby="contact">
      <h2 id="contact">Contact</h2>
      <p className="contact__lead">
        Une alternance à proposer, une question sur un projet ? Je réponds rapidement, par e-mail comme par téléphone.
      </p>
      <dl className="contact__list">
        {contacts.map((c) => (
          <div key={c.label}>
            <dt>{c.label}</dt>
            <dd>
              <a
                className="text-link"
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {c.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>
      <p className="contact__fine">
        {profile.name}, Toulouse. Site construit avec React et Vite, hébergé sur GitHub Pages.
      </p>
    </footer>
  );
}
