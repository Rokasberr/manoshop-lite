const calculateCommission = ({ price, commissionRate }) => {
  const priceCents = Math.max(Math.round(Number(price || 0) * 100), 0);
  const normalizedRate = Math.min(Math.max(Number(commissionRate || 0), 0), 100);
  const platformCommissionCents = Math.round((priceCents * normalizedRate) / 100);
  const sellerEarningsCents = priceCents - platformCommissionCents;

  return {
    platformCommission: Number((platformCommissionCents / 100).toFixed(2)),
    sellerEarnings: Number((sellerEarningsCents / 100).toFixed(2)),
    commissionRate: normalizedRate,
  };
};

module.exports = {
  calculateCommission,
};
