import { useEffect, useState } from "react";
import { Check, Cookie, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { Link } from "react-router-dom";

import { useCookieConsent } from "../context/CookieConsentContext";
import { useLanguage } from "../context/LanguageContext";
import { COOKIE_CATEGORIES, DEFAULT_COOKIE_CATEGORIES } from "../utils/cookieConsent";

const CookieToggle = ({ category, copy, enabled, disabled, onToggle }) => (
  <div className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-4 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[rgb(var(--text))]">{copy.title}</p>
        <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">{copy.description}</p>
      </div>

      <button
        type="button"
        aria-pressed={enabled}
        disabled={disabled}
        onClick={() => onToggle(category)}
        className={`relative mt-1 h-7 w-12 shrink-0 rounded-full border transition ${
          enabled
            ? "border-[rgb(var(--accent-strong))] bg-[rgb(var(--accent-strong))]"
            : "border-[rgb(var(--line))] bg-[rgb(var(--surface-soft))]"
        } ${disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
        <span className="sr-only">{copy.title}</span>
      </button>
    </div>

    <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--surface-soft))] px-3 py-1 text-xs font-semibold text-[rgb(var(--muted))]">
      {disabled ? copy.alwaysOn : copy.optional}
    </div>
  </div>
);

const CookiePreferencesModal = () => {
  const { categories, closePreferences, savePreferences, acceptAll, rejectNonEssential, hasSavedConsent } =
    useCookieConsent();
  const { t } = useLanguage();
  const copy = t("cookieConsent");
  const [selectedCategories, setSelectedCategories] = useState(DEFAULT_COOKIE_CATEGORIES);

  useEffect(() => {
    setSelectedCategories(categories);
  }, [categories]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePreferences();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePreferences]);

  const handleToggle = (category) => {
    if (category === "necessary") {
      return;
    }

    setSelectedCategories((currentCategories) => ({
      ...currentCategories,
      [category]: !currentCategories[category],
    }));
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[rgb(10_14_12/0.58)] px-4 py-5 backdrop-blur-sm sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-5 shadow-[0_26px_90px_rgba(13,24,21,0.28)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--accent)/0.1)] px-3 py-1 text-xs font-semibold uppercase text-[rgb(var(--accent-strong))]">
              <ShieldCheck size={14} />
              {copy.settingsEyebrow}
            </div>
            <h2
              id="cookie-preferences-title"
              className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(var(--text))] sm:text-4xl"
            >
              {copy.modalTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--muted))]">{copy.modalText}</p>
          </div>

          <button
            type="button"
            onClick={closePreferences}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface-soft))] text-[rgb(var(--text))] transition hover:-translate-y-0.5"
            aria-label={copy.close}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {COOKIE_CATEGORIES.map((category) => (
            <CookieToggle
              key={category}
              category={category}
              copy={{
                ...copy.categories[category],
                alwaysOn: copy.alwaysOn,
                optional: copy.optional,
              }}
              enabled={Boolean(selectedCategories[category])}
              disabled={category === "necessary"}
              onToggle={handleToggle}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[rgb(var(--line))] pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Link to="/cookie-policy" className="text-sm font-semibold text-[rgb(var(--accent-strong))] transition hover:opacity-80">
            {copy.policyLink}
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={rejectNonEssential} className="button-secondary gap-2">
              <X size={16} />
              {copy.rejectNonEssential}
            </button>
            <button
              type="button"
              onClick={() => savePreferences(selectedCategories)}
              className="button-secondary gap-2"
            >
              <SlidersHorizontal size={16} />
              {copy.savePreferences}
            </button>
            <button type="button" onClick={acceptAll} className="button-primary gap-2">
              <Check size={16} />
              {copy.acceptAll}
            </button>
          </div>
        </div>

        {!hasSavedConsent ? (
          <p className="mt-4 text-xs leading-5 text-[rgb(var(--muted))]">{copy.firstChoiceNote}</p>
        ) : null}
      </section>
    </div>
  );
};

const CookieConsentBanner = () => {
  const { hasSavedConsent, isPreferencesOpen, openPreferences, acceptAll, rejectNonEssential } = useCookieConsent();
  const { t } = useLanguage();
  const copy = t("cookieConsent");

  return (
    <>
      {!hasSavedConsent && !isPreferencesOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:px-6">
          <section className="mx-auto max-w-6xl rounded-[28px] border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-4 shadow-[0_24px_70px_rgba(13,24,21,0.22)] sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent-strong))]">
                <Cookie size={22} />
              </div>

              <div>
                <p className="font-display text-lg font-bold text-[rgb(var(--text))]">{copy.bannerTitle}</p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[rgb(var(--muted))]">{copy.bannerText}</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                <button type="button" onClick={rejectNonEssential} className="button-secondary gap-2 whitespace-nowrap">
                  <X size={16} />
                  {copy.rejectNonEssential}
                </button>
                <button type="button" onClick={openPreferences} className="button-secondary gap-2 whitespace-nowrap">
                  <SlidersHorizontal size={16} />
                  {copy.managePreferences}
                </button>
                <button type="button" onClick={acceptAll} className="button-primary gap-2 whitespace-nowrap">
                  <Check size={16} />
                  {copy.acceptAll}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {isPreferencesOpen ? <CookiePreferencesModal /> : null}
    </>
  );
};

export default CookieConsentBanner;
