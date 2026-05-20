import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";

const EmptyState = ({
  title,
  description,
  actionLabel,
  actionTo = "/digital-products",
  onAction,
}) => {
  const { t } = useLanguage();
  const resolvedTitle = title || t("common.empty.title");
  const resolvedDescription = description || t("common.empty.description");

  return (
    <div className="panel mx-auto max-w-2xl rounded-lg px-6 py-12 text-center shadow-[0_24px_70px_rgba(17,31,26,0.08)] sm:px-10">
      <span className="eyebrow">{t("common.empty.eyebrow")}</span>
      <h2 className="mt-4 break-words font-display text-3xl font-bold leading-tight">{resolvedTitle}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">{resolvedDescription}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="button-primary mt-6 min-h-[3rem] justify-center">
          {actionLabel}
        </button>
      ) : actionLabel ? (
        <Link to={actionTo} className="button-primary mt-6 min-h-[3rem] justify-center">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
};

export default EmptyState;
