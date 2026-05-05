import { useAuth } from "../context/AuthContext";
import BazinisMemberPage from "./BazinisMemberPage";
import SavingsStudioPage from "./SavingsStudioPage";

const basicPlanIds = new Set(["free", "guest", "basic", "bazinis"]);
const fullMemberPlanIds = new Set(["circle", "asmeninis", "personal", "pro", "private", "privatus", "business"]);

const normalizePlanId = (planId = "") =>
  String(planId || "free")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-");

const MemberAreaPage = () => {
  const { user } = useAuth();
  const planId = normalizePlanId(user?.subscription?.plan);

  if (user?.role === "admin" || fullMemberPlanIds.has(planId)) {
    return <SavingsStudioPage />;
  }

  if (basicPlanIds.has(planId) || !planId) {
    return <BazinisMemberPage />;
  }

  return <BazinisMemberPage />;
};

export default MemberAreaPage;
