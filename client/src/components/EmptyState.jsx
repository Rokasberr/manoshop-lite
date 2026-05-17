import { Link } from "react-router-dom";

const EmptyState = ({
  title = "Kol kas čia nėra turinio",
  description = "Netrukus šioje vietoje matysite savo skaitmeninius produktus, šablonus ir nario įrankius.",
  actionLabel,
  actionTo = "/shop",
  onAction,
}) => (
  <div className="panel mx-auto max-w-2xl rounded-lg px-6 py-12 text-center shadow-[0_24px_70px_rgba(17,31,26,0.08)] sm:px-10">
    <span className="eyebrow">Kol kas tuščia</span>
    <h2 className="mt-4 break-words font-display text-3xl font-bold leading-tight">{title}</h2>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">{description}</p>
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

export default EmptyState;
