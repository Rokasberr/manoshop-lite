const fs = require("fs");

const { getMemberResourceFile } = require("../config/memberResources");
const { getUserPlan, hasActivePlanStatus, normalizePlan } = require("../config/planAccess");
const { createHttpError } = require("../utils/httpError");
const { isAdminUser } = require("../utils/userRole");

const planRank = {
  free: 0,
  basic: 1,
  personal: 2,
  private_business: 3,
};

const hasRequiredPlan = (user, requiredPlan) => {
  if (isAdminUser(user)) {
    return true;
  }

  if (!hasActivePlanStatus(user)) {
    return false;
  }

  const userRank = planRank[getUserPlan(user)] || 0;
  const requiredRank = planRank[normalizePlan(requiredPlan)] || 0;

  return userRank >= requiredRank;
};

const downloadMemberResource = async (req, res) => {
  const resource = getMemberResourceFile(req.params.resourceId, req.params.format);

  if (!resource) {
    throw createHttpError("Resursas nerastas.", 404);
  }

  if (!hasRequiredPlan(req.user, resource.minPlan)) {
    throw createHttpError("Siam resursui reikalingas aukstesnis narystes planas.", 403);
  }

  if (!fs.existsSync(resource.file.filePath)) {
    throw createHttpError("Failas nerastas.", 404);
  }

  res.setHeader("Content-Type", resource.file.contentType);
  return res.download(resource.file.filePath, resource.file.fileName);
};

module.exports = {
  downloadMemberResource,
  hasRequiredPlan,
};
