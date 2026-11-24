import { contacts, profile } from "../data/content";
import photo160avif from "../assets/photo-160.avif";
import photo320avif from "../assets/photo-320.avif";
import photo480avif from "../assets/photo-480.avif";
import photo160webp from "../assets/photo-160.webp";
import photo320webp from "../assets/photo-320.webp";
import photo480webp from "../assets/photo-480.webp";

const sizes = "(max-width: 40rem) 7rem, 10rem";
const heroLinks = contacts.filter((c) => c.label !== "Téléphone");

export function Hero() {
  return (
    <header className="hero">
      <div className="hero__text">
        <h1 className="hero__name">{profile.name}</h1>
        <p className="hero__role">{profile.role}</p>
        {profile.pitch.map((p) => (
          <p key={p.slice(0, 24)} className="hero__pitch">
            {p}
          </p>
        ))}

        <dl className="availability">
          <div>
            <dt>Recherche</dt>
            <dd>Alternance en développement web</dd>
          </div>
          <div>
            <dt>Rythme</dt>
            <dd>3 semaines en entreprise, 1 semaine en cours</dd>
          </div>
          <div>
            <dt>Localisation</dt>
            <dd>{profile.location}</dd>
          </div>
        </dl>

        <ul className="hero__links">
          {heroLinks.map((c, i) => (
            <li key={c.label}>
              <a
                className={i === 0 ? "button button--primary" : "button"}
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {i === 0 ? "M'écrire un e-mail" : c.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <picture className="hero__photo">
        <source type="image/avif" srcSet={`${photo160avif} 160w, ${photo320avif} 320w, ${photo480avif} 480w`} sizes={sizes} />
        <img
          src={photo320webp}
          srcSet={`${photo160webp} 160w, ${photo320webp} 320w, ${photo480webp} 480w`}
          sizes={sizes}
          width={320}
          height={427}
          alt={profile.photoAlt}
          fetchPriority="high"
          decoding="async"
        />
      </picture>
    </header>
  );
}
