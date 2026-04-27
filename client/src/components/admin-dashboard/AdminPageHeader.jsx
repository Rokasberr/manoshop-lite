import { Link } from "react-router-dom";

const AdminPageHeader = ({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div className="space-y-3">
      {eyebrow ? <span className="dashboard-eyebrow">{eyebrow}</span> : null}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">{title}</h1>
        {description ? <p className="max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">{description}</p> : null}
      </div>
    </div>

    {(primaryAction || secondaryAction) ? (
      <div className="flex flex-wrap gap-3">
        {secondaryAction ? (
          <Link to={secondaryAction.to} className="dashboard-button-secondary">
            {secondaryAction.label}
          </Link>
        ) : null}
        {primaryAction ? (
          <Link to={primaryAction.to} className="dashboard-button-primary">
            {primaryAction.label}
          </Link>
        ) : null}
      </div>
    ) : null}
  </div>
);

export default AdminPageHeader;
