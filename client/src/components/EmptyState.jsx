import { Link } from "react-router-dom";

const EmptyState = ({ title, description, actionLabel, actionTo = "/shop", onAction }) => (
  <div className="panel mx-auto max-w-2xl px-6 py-12 text-center sm:px-10">
    <span className="eyebrow">empty state</span>
    <h2 className="mt-4 font-display text-3xl font-bold">{title}</h2>
    <p className="mt-3 text-muted">{description}</p>
    {onAction ? (
      <button type="button" onClick={onAction} className="button-primary mt-6">
        {actionLabel}
      </button>
    ) : (
      <Link to={actionTo} className="button-primary mt-6">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
