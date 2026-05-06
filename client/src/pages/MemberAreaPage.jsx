import { useState } from "react";
import { ArrowUpRight, Briefcase, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import BazinisMemberPage from "./BazinisMemberPage";
import PrivateBusinessWorkspacePage from "./PrivateBusinessWorkspacePage";
import SavingsStudioPage from "./SavingsStudioPage";

const basicPlanIds = new Set(["free", "guest", "basic", "bazinis"]);
const personalPlanIds = new Set(["asmeninis"]);
const privatePlanIds = new Set(["privatus_verslas"]);
const previewOptions = [
  { id: "current", label: "Dabartinis planas", helper: "Rodo pagal tikrą paskyros planą." },
  { id: "bazinis", label: "Bazinis", helper: "Pradinis nario sluoksnis." },
  { id: "asmeninis", label: "Asmeninis", helper: "Pilna nario zona." },
  { id: "privatus_verslas", label: "Privatus verslas", helper: "Aukščiausia nario patirtis." },
];
const planLabels = {
  free: "Bazinis",
  guest: "Bazinis",
  basic: "Bazinis",
  bazinis: "Bazinis",
  asmeninis: "Asmeninis",
  privatus_verslas: "Privatus verslas",
};

const normalizePlanId = (planId = "") =>
  String(planId || "free")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

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

const DigitalProductGeneratorDashboardCard = () => (
  <section className="member-value-card overflow-hidden rounded-lg p-5 sm:p-6">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
          style={{
            border: "1px solid rgb(226 202 145 / 0.28)",
            backgroundColor: "rgb(226 202 145 / 0.12)",
            color: "rgb(126 88 33)",
          }}
        >
          <Lightbulb size={22} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="premium-tag">Premium įrankis</span>
            <span className="soft-pill inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold text-muted">
              <Briefcase size={14} />
              Produktų idėjos
            </span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold leading-tight">
            Skaitmeninio produkto idėjų generatorius
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Sugeneruok parduodamų PDF, šablonų, checklistų, kursų, narystės ir mini SaaS idėjų pagal savo nišą.
          </p>
        </div>
      </div>

      <Link to="/member/digital-product-generator" className="button-primary shrink-0 gap-2">
        Atidaryti generatorių
        <ArrowUpRight size={16} />
      </Link>
    </div>
  </section>
);

const MemberAreaPage = () => {
  const { user } = useAuth();
  const [previewPlanId, setPreviewPlanId] = useState("current");
  const realPlanId = normalizePlanId(user?.subscription?.plan);
  const canUsePreview = user?.role === "admin" || import.meta.env.DEV;
  const effectivePlanId = canUsePreview && previewPlanId !== "current" ? previewPlanId : realPlanId;
  const shouldRenderPrivateArea = privatePlanIds.has(effectivePlanId);
  const shouldRenderPersonalArea = personalPlanIds.has(effectivePlanId);

  return (
    <div className="member-workspace space-y-6">
      {canUsePreview && (
        <PreviewSwitch currentPlanId={realPlanId} selectedPlanId={previewPlanId} onChange={setPreviewPlanId} />
      )}

      <DigitalProductGeneratorDashboardCard />

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
