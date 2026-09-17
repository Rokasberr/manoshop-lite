import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Facebook, Instagram } from "lucide-react";

const navigationLinks = [
  ["Paslaugos", "#paslaugos"],
  ["Kainos", "#kainos"],
  ["Procesas", "#procesas"],
  ["Kontaktai", "#kontaktai"]
] as const;

const socialLinks = [
  ["Instagram", "https://www.instagram.com/stilloakstudio/", Instagram],
  ["Facebook", "https://www.facebook.com/stilloakstudio/", Facebook]
] as const;

const legalLinks = [
  ["Rekvizitai", "/web-services-details"],
  ["Privatumo politika", "/web-services-privacy"],
  ["Slapukų politika", "/cookie-policy"],
  ["Paslaugų sąlygos", "/web-services-terms"],
  ["Atsisakymas ir grąžinimai", "/web-services-refunds"]
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
        <span className="footer-label">Sekite Stilloak</span>
        <nav className="footer-social-links" aria-label="Stilloak Studio socialiniai tinklai">
          {socialLinks.map(([label, href, Icon]) => (
            <a key={href} href={href} target="_blank" rel="noreferrer">
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </a>
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
