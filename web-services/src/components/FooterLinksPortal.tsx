import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Facebook, Instagram } from "lucide-react";
import { socialLinks } from "../data/socialLinks";

const navigationLinks = [
  ["Paslaugos", "#paslaugos"],
  ["Kainos", "#kainos"],
  ["Procesas", "#procesas"],
  ["Kontaktai", "#kontaktai"]
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
      <div className="footer-link-group footer-nav-group">
        <span className="footer-label">Naršymas</span>
        <nav className="footer-link-list" aria-label="Footerio navigacija">
          {navigationLinks.map(([label, href]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
      </div>
      <div className="footer-link-group footer-legal-group">
        <span className="footer-label">Teisinė informacija</span>
        <nav className="footer-link-list" aria-label="Teisinė informacija">
          {legalLinks.map(([label, href]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
      </div>
      <div className="footer-link-group footer-social-group">
        <span className="footer-label">Sekite Stilloak</span>
        <nav className="footer-link-list footer-social-list" aria-label="Socialiniai tinklai">
          {socialLinks.map(({ label, href }, index) => {
            const Icon = index === 0 ? Facebook : Instagram;

            return (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${label} (atsidarys naujame lange)`}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </div>,
    footer
  );
}
