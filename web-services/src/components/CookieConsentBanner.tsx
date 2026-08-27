import { useEffect, useState } from "react";
import { Check, Cookie, ShieldCheck, SlidersHorizontal, X } from "lucide-react";

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "stilloak-web-cookie-consent-v1";
const DEFAULT_CONSENT: Consent = { necessary: true, analytics: false, marketing: false };

function readConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Consent>;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing)
    };
  } catch {
    return null;
  }
}

export default function CookieConsentBanner() {
  const [savedConsent, setSavedConsent] = useState<Consent | null>(() => readConsent());
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [draft, setDraft] = useState<Consent>(() => readConsent() || DEFAULT_CONSENT);

  useEffect(() => {
    const openSettings = () => {
      const stored = readConsent();
      setDraft(stored || DEFAULT_CONSENT);
      setPreferencesOpen(true);
    };

    window.addEventListener("stilloak-cookie-settings", openSettings);
    return () => window.removeEventListener("stilloak-cookie-settings", openSettings);
  }, []);

  useEffect(() => {
    if (!preferencesOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreferencesOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preferencesOpen]);

  const save = (next: Consent) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedConsent(next);
    setDraft(next);
    setPreferencesOpen(false);
  };

  const openPreferences = () => {
    setDraft(readConsent() || DEFAULT_CONSENT);
    setPreferencesOpen(true);
  };

  const rejectNonEssential = () => save(DEFAULT_CONSENT);
  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true });

  return (
    <>
      {!savedConsent && !preferencesOpen ? (
        <div className="cookie-banner-wrap">
          <section className="cookie-banner" aria-label="Slapukų pasirinkimas">
            <div className="cookie-icon" aria-hidden="true"><Cookie size={22} /></div>
            <div className="cookie-copy">
              <strong>Jūsų privatumas mums svarbus</strong>
              <p>
                Naudojame būtinus slapukus svetainės veikimui. Analitikos ir rinkodaros slapukai naudojami tik
                gavus jūsų sutikimą. Daugiau informacijos rasite mūsų <a href="https://stilloak-studio.com/cookie-policy">slapukų politikoje</a>.
              </p>
            </div>
            <div className="cookie-actions">
              <button className="cookie-button cookie-button-ghost" type="button" onClick={rejectNonEssential}>
                Tik būtini
              </button>
              <button className="cookie-button cookie-button-ghost" type="button" onClick={openPreferences}>
                <SlidersHorizontal size={15} /> Nustatymai
              </button>
              <button className="cookie-button cookie-button-primary" type="button" onClick={acceptAll}>
                <Check size={15} /> Priimti visus
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {savedConsent && !preferencesOpen ? (
        <button className="cookie-reopen" type="button" onClick={openPreferences}>
          <Cookie size={14} /> Slapukų nustatymai
        </button>
      ) : null}

      {preferencesOpen ? (
        <div className="cookie-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPreferencesOpen(false);
        }}>
          <section className="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
            <div className="cookie-modal-head">
              <div>
                <span className="cookie-modal-kicker"><ShieldCheck size={14} /> Privatumo nustatymai</span>
                <h2 id="cookie-modal-title">Pasirinkite slapukus</h2>
                <p>Nebūtinas kategorijas galite įjungti arba išjungti bet kuriuo metu.</p>
              </div>
              <button className="cookie-close" type="button" onClick={() => setPreferencesOpen(false)} aria-label="Uždaryti">
                <X size={18} />
              </button>
            </div>

            <div className="cookie-category-list">
              <div className="cookie-category">
                <div><strong>Būtini</strong><p>Reikalingi pagrindiniam svetainės veikimui ir saugumui.</p></div>
                <span className="cookie-always">Visada įjungti</span>
              </div>

              <div className="cookie-category">
                <div><strong>Analitika</strong><p>Padeda suprasti, kaip lankytojai naudojasi svetaine ir ką galime pagerinti.</p></div>
                <button
                  className={draft.analytics ? "cookie-toggle is-on" : "cookie-toggle"}
                  type="button"
                  aria-pressed={draft.analytics}
                  onClick={() => setDraft((current) => ({ ...current, analytics: !current.analytics }))}
                ><span /></button>
              </div>

              <div className="cookie-category">
                <div><strong>Rinkodara</strong><p>Skirta reklamos rezultatų matavimui ir aktualesnių kampanijų rodymui.</p></div>
                <button
                  className={draft.marketing ? "cookie-toggle is-on" : "cookie-toggle"}
                  type="button"
                  aria-pressed={draft.marketing}
                  onClick={() => setDraft((current) => ({ ...current, marketing: !current.marketing }))}
                ><span /></button>
              </div>
            </div>

            <div className="cookie-modal-footer">
              <div className="cookie-policy-links">
                <a href="https://stilloak-studio.com/privacy">Privatumo politika</a>
                <a href="https://stilloak-studio.com/cookie-policy">Slapukų politika</a>
              </div>
              <div className="cookie-actions">
                <button className="cookie-button cookie-button-ghost" type="button" onClick={rejectNonEssential}>Tik būtini</button>
                <button className="cookie-button cookie-button-primary" type="button" onClick={() => save(draft)}>Išsaugoti pasirinkimą</button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
