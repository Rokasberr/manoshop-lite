import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const navigationLinks = [
  ["Paslaugos", "#paslaugos"],
  ["Kainos", "#kainos"],
  ["Procesas", "#procesas"],
  ["Kontaktai", "#kontaktai"]
] as const;

const legalLinks = [
  ["Privatumo politika", "https://stilloak-studio.com/privacy"],
  ["Slapukų politika", "https://stilloak-studio.com/cookie-policy"],
  ["Naudojimo sąlygos", "https://stilloak-studio.com/terms"]
] as const;

export default function FooterLinksPortal() {
  const [footer, setFooter] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setFooter(document.querySelector<HTMLElement>(".site-footer"));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!footer) return null;

  return createPortal(
    <div className="footer-links-block" aria-label="Footerio nuorodos">
      <div className="footer-link-group">
        <span className="footer-label">Naršymas</span>
        <nav className="footer-link-list" aria-label="Footerio navigacija">
          {navigationLinks.map(([label, href]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
      </div>
      <div className="footer-link-group">
        <span className="footer-label">Teisinė informacija</span>
        <nav className="footer-link-list" aria-label="Teisinė informacija">
          {legalLinks.map(([label, href]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
      </div>
    </div>,
    footer
  );
}
