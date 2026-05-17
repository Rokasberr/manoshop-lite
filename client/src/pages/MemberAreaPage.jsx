import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import { isAdminUser, normalizePlan } from "../utils/membership";
import BazinisMemberPage from "./BazinisMemberPage";
import PrivateBusinessWorkspacePage from "./PrivateBusinessWorkspacePage";
import SavingsStudioPage from "./SavingsStudioPage";

const personalPlanIds = new Set(["personal"]);
const privatePlanIds = new Set(["private_business"]);
const previewOptions = [
  { id: "current", label: "Dabartinis planas", helper: "Rodo pagal tikrą paskyros planą." },
  { id: "basic", label: "Bazinis", helper: "Pradinis nario sluoksnis." },
  { id: "personal", label: "Asmeninis", helper: "Pilna nario zona." },
  { id: "private_business", label: "Privatus verslas", helper: "Aukščiausia nario patirtis." },
];
const planLabels = {
  free: "Bazinis",
  guest: "Bazinis",
  basic: "Bazinis",
  personal: "Asmeninis",
  private_business: "Privatus verslas",
};

const PreviewSwitch = ({ currentPlanId, selectedPlanId, onChange }) => (
  <section className="soft-card p-5 sm:p-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">admin preview</p>
        <h2 className="mt-2 font-display text-2xl font-bold">Nario zonos peržiūra</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Šis jungiklis nekeičia tikro vartotojo plano. Tik lokaliai parodo, kaip atrodo skirtingi narystės lygiai.
        </p>
        <p className="mt-2 text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-muted">
          Tikras planas: {planLabels[currentPlanId] || currentPlanId || "Bazinis"}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[520px]">
        {previewOptions.map((option) => {
          const isSelected = selectedPlanId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-lg border px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 ${
                isSelected ? "bg-[rgb(var(--accent-strong))] text-white" : "bg-white text-[rgb(var(--text))]"
              }`}
              style={{
                borderColor: isSelected ? "rgb(var(--accent))" : "rgb(var(--line) / 0.82)",
              }}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className={`mt-1 block text-xs leading-5 ${isSelected ? "opacity-80" : "text-muted"}`}>
                {option.helper}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </section>
);

const MemberAreaPage = () => {
  const { user } = useAuth();
  const [previewPlanId, setPreviewPlanId] = useState("current");
  const realPlanId = normalizePlan(user?.subscription?.plan);
  const canUsePreview = isAdminUser(user) || import.meta.env.DEV;
  const effectivePlanId = canUsePreview && previewPlanId !== "current" ? previewPlanId : realPlanId;
  const shouldRenderPrivateArea = privatePlanIds.has(effectivePlanId);
  const shouldRenderPersonalArea = personalPlanIds.has(effectivePlanId);

  return (
    <div className="member-workspace space-y-6">
      {canUsePreview && (
        <PreviewSwitch currentPlanId={realPlanId} selectedPlanId={previewPlanId} onChange={setPreviewPlanId} />
      )}

      {shouldRenderPrivateArea ? (
        <PrivateBusinessWorkspacePage />
      ) : shouldRenderPersonalArea ? (
        <>
          <SavingsStudioPage />
          <PrivateBusinessWorkspacePage lockedPreview />
        </>
      ) : (
        <BazinisMemberPage />
      )}
    </div>
  );
};

export default MemberAreaPage;
