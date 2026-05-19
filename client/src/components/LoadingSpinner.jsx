import { useLanguage } from "../context/LanguageContext";

const LoadingSpinner = ({ label, fullScreen = false }) => {
  const { t } = useLanguage();
  const resolvedLabel = label || t("common.loading");

  return (
    <div
      className={`flex items-center justify-center ${fullScreen ? "min-h-[60vh]" : "py-16"}`}
      role="status"
    >
      <div className="panel flex items-center gap-4 px-6 py-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-transparent"
          style={{
            borderTopColor: "rgb(var(--accent))",
            borderRightColor: "rgb(var(--accent) / 0.25)",
          }}
        />
        <span className="text-sm font-medium text-muted">{resolvedLabel}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
