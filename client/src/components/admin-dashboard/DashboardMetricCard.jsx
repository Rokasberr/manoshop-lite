const DashboardMetricCard = ({ label, value, meta, icon: Icon, accent = "bg-sky-50 text-sky-600" }) => (
  <div className="dashboard-panel p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{value}</p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
        <Icon size={20} />
      </div>
    </div>
    <p className="mt-4 text-sm leading-6 text-slate-500">{meta}</p>
  </div>
);

export default DashboardMetricCard;
