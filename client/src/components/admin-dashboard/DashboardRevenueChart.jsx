const formatCompact = (value) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const DashboardRevenueChart = ({ points }) => {
  const width = 640;
  const height = 280;
  const paddingX = 18;
  const paddingTop = 24;
  const paddingBottom = 36;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const stepX = points.length > 1 ? (width - paddingX * 2) / (points.length - 1) : width - paddingX * 2;

  const chartPoints = points.map((point, index) => {
    const x = paddingX + stepX * index;
    const y =
      height - paddingBottom - ((point.value || 0) / maxValue) * (height - paddingTop - paddingBottom);

    return {
      ...point,
      x,
      y,
    };
  });

  const linePath = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${height - paddingBottom} L ${chartPoints[0].x} ${height - paddingBottom} Z`;
  const yTicks = [0, maxValue / 2, maxValue];

  return (
    <div className="dashboard-panel p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Revenue trend</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Sales performance</h2>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Last {points.length} days
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-4 sm:p-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full" role="img" aria-label="Revenue chart">
          <defs>
            <linearGradient id="dashboardAreaFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y =
              height - paddingBottom - (tick / maxValue) * (height - paddingTop - paddingBottom);

            return (
              <g key={tick}>
                <line
                  x1={paddingX}
                  x2={width - paddingX}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 6"
                />
                <text x={paddingX} y={y - 8} fontSize="12" fill="#94a3b8">
                  €{formatCompact(Math.round(tick))}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#dashboardAreaFill)" />
          <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

          {chartPoints.map((point) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="4.5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
              <text x={point.x} y={height - 12} textAnchor="middle" fontSize="12" fill="#94a3b8">
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default DashboardRevenueChart;
