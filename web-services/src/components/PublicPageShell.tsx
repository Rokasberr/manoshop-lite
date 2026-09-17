import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

type PublicPageShellProps = {
  children: ReactNode;
};

const contactEmail = "hello@stilloak-studio.com";
const contactPhone = "+370 638 43445";

export default function PublicPageShell({ children }: PublicPageShellProps) {
  return (
    <div className="site-shell detail-site-shell">
      <header className="site-header detail-site-header">
        <a className="wordmark" href="/" aria-label="Stilloak Web pradžia">
          <strong>Stilloak</strong>
          <span>Web Studio</span>
        </a>

        <nav className="nav detail-nav" aria-label="Pagrindinė navigacija">
          <a href="/#paslaugos">Paslaugos</a>
          <a href="/#kainos">Kainos</a>
          <a href="/#portfolio">Pavyzdžiai</a>
          <a className="nav-cta" href="/#kontaktai">
            Gauti pasiūlymą <ArrowRight size={17} aria-hidden="true" />
          </a>
        </nav>
      </header>

      {children}

      <footer className="site-footer">
        <div className="footer-brand-block">
          <a className="wordmark footer-wordmark" href="/">
            <strong>Stilloak</strong>
            <span>Web Studio</span>
          </a>
          <p>Svetainės, kurios padeda verslui atrodyti profesionaliai ir augti.</p>
        </div>
        <div>
          <span className="footer-label">Kontaktai</span>
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          <br />
          <a href="tel:+37063843445">{contactPhone}</a>
        </div>
        <div>
          <span className="footer-label">Stilloak Studio</span>
          <p>© 2026 Stilloak Studio. Visos teisės saugomos.</p>
        </div>
      </footer>
    </div>
  );
}
