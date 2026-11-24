import { Contact } from "./components/Contact";
import { Hero } from "./components/Hero";
import { Journey } from "./components/Journey";
import { Project } from "./components/Project";
import { Skills } from "./components/Skills";

export function App() {
  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <div className="page">
        <Hero />
        <main id="contenu" tabIndex={-1}>
          <Project />
          <Journey />
          <Skills />
        </main>
        <Contact />
      </div>
    </>
  );
}
