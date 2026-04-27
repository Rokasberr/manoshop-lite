const statusConfig = {
  pending: {
    label: "Pending",
    backgroundColor: "rgba(245, 158, 11, 0.16)",
    color: "rgb(180, 83, 9)",
  },
  shipped: {
    label: "Shipped",
    backgroundColor: "rgba(59, 130, 246, 0.16)",
    color: "rgb(29, 78, 216)",
  },
  delivered: {
    label: "Delivered",
    backgroundColor: "rgba(16, 185, 129, 0.16)",
    color: "rgb(4, 120, 87)",
  },
  paid: {
    label: "Paid",
    backgroundColor: "rgba(16, 185, 129, 0.16)",
    color: "rgb(4, 120, 87)",
  },
  failed: {
    label: "Failed",
    backgroundColor: "rgba(239, 68, 68, 0.16)",
    color: "rgb(185, 28, 28)",
  },
  canceled: {
    label: "Canceled",
    backgroundColor: "rgba(148, 163, 184, 0.18)",
    color: "rgb(71, 85, 105)",
  },
  refunded: {
    label: "Refunded",
    backgroundColor: "rgba(168, 85, 247, 0.16)",
    color: "rgb(126, 34, 206)",
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: config.backgroundColor,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
