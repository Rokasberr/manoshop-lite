import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import AdminPageHeader from "../../components/admin-dashboard/AdminPageHeader";
import webServiceRequestService from "../../services/webServiceRequestService";
import { formatCurrency } from "../../utils/currency";

const DEFAULT_TERMS =
  "Darbų apimtis, terminas ir kaina galioja pagal šį pasiūlymą. Pagrindinis mokėjimo variantas – visa suma iškart; klientas taip pat gali pasirinkti du mokėjimus – avansą ir likutį. Darbai pradedami gavus sutartą pirmą mokėjimą. Papildomi darbai ar apimties pakeitimai derinami atskirai.";

const proposalLabels = {
  draft: "Juodraštis",
  sent: "Išsiųstas",
  viewed: "Peržiūrėtas",
  accepted: "Patvirtintas",
  declined: "Atmestas",
  expired: "Nebegalioja",
};

const depositLabels = {
  not_requested: "Nelaukia apmokėjimo",
  pending: "Laukiama apmokėjimo",
  paid: "Apmokėtas",
  failed: "Nepavyko",
  refunded: "Grąžintas",
};
const finalPaymentLabels = { not_requested: "Likutis neprašytas", requested: "Laukiama likučio", pending: "Mokėjimas pradėtas", paid: "Pilnai apmokėta", failed: "Nepavyko", refunded: "Grąžintas" };

const projectStageLabels = { awaiting_deposit: "Laukia pirmo mokėjimo", in_progress: "Darbai vykdomi", client_review: "Kliento peržiūra", awaiting_final_payment: "Laukia likučio", completed: "Užbaigta" };
const projectTaskStatusLabels = { pending: "Laukia", in_progress: "Vykdoma", completed: "Atlikta" };

const paymentMethodLabels = {
  bank_transfer: "Banko pavedimas",
  stripe: "Stripe",
};

const buildDraft = (request) => ({
  proposalPrice: request.proposalPrice ?? request.finalPrice ?? request.basePrice ?? "",
  proposalSummary:
    request.proposalSummary ||
    `Paruošime ${request.packageName} svetainės projektą pagal aptartus verslo tikslus, turinį ir funkcionalumą.`,
  proposalScope: request.proposalScope || request.message || "",
  proposalTerms: request.proposalTerms || DEFAULT_TERMS,
  depositPercent: request.splitPaymentPercent ?? (request.paymentPlan === "split" ? request.depositPercent : 50),
  expiryDays: 14,
  projectLiveUrl: request.projectLiveUrl || "",
  warrantyEndsAt: request.warrantyEndsAt ? new Date(request.warrantyEndsAt).toISOString().slice(0, 10) : "",
  carePlan: request.carePlan || "",
  revisionLimit: request.revisionLimit ?? 2,
  revisionRoundNote: "",
  handoverItemsText: (request.handoverItems || []).join("\n"),
  projectTasks: (request.projectTasks || []).map((task) => ({
    id: task._id || task.id || "",
    title: task.title || "",
    status: task.status || "pending",
    plannedDate: task.plannedDate ? new Date(task.plannedDate).toISOString().slice(0, 10) : "",
    reviewUrl: task.reviewUrl || "",
    completedAt: task.completedAt || null,
    clientDecision: task.clientDecision || "none",
    clientDecisionAt: task.clientDecisionAt || null,
    clientComments: task.clientComments || [],
  })),
});

const WebProposalsPage = () => {
  const [requests, setRequests] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [proposalUrls, setProposalUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingId, setSendingId] = useState("");
  const [syncingId, setSyncingId] = useState("");
  const [markingPaidId, setMarkingPaidId] = useState("");
  const [requestingFinalId, setRequestingFinalId] = useState("");
  const [finalBankPaidId, setFinalBankPaidId] = useState("");
  const [resendingInvoiceKey, setResendingInvoiceKey] = useState("");
  const [updatingStageId, setUpdatingStageId] = useState("");
  const [savingHandoverId, setSavingHandoverId] = useState("");
  const [savingTasksId, setSavingTasksId] = useState("");
  const [savingRevisionsId, setSavingRevisionsId] = useState("");
  const [resendingContractId, setResendingContractId] = useState("");
  const [resendingHandoverId, setResendingHandoverId] = useState("");
  const [filter, setFilter] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await webServiceRequestService.getAdminRequests();
      setRequests(data);
      setDrafts(Object.fromEntries(data.map((request) => [request._id, buildDraft(request)])));
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Nepavyko užkrauti Web pasiūlymų.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const stats = useMemo(() => {
    const active = requests.filter((request) => !["completed", "lost"].includes(request.status));
    return {
      active: active.length,
      sent: active.filter((request) => ["sent", "viewed"].includes(request.proposalStatus)).length,
      accepted: active.filter((request) => request.proposalStatus === "accepted").length,
      paid: active.filter((request) => request.depositStatus === "paid").length,
    };
  }, [requests]);

  const visibleRequests = useMemo(() => {
    let filteredRequests = requests;
    if (filter === "needs_payment") {
      filteredRequests = requests.filter(
        (request) => request.proposalStatus === "accepted" && request.depositStatus !== "paid"
      );
    } else if (filter === "paid") {
      filteredRequests = requests.filter((request) => request.depositStatus === "paid");
    } else if (filter !== "all") {
      filteredRequests = requests.filter((request) => !["completed", "lost"].includes(request.status));
    }

    const query = searchQuery.trim().toLocaleLowerCase("lt-LT");
    if (!query) return filteredRequests;

    return filteredRequests.filter((request) =>
      [request.requestNumber, request.name, request.email, request.phone, request.company]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("lt-LT").includes(query))
    );
  }, [filter, requests, searchQuery]);

  const updateDraft = (requestId, key, value) => {
    setDrafts((current) => ({
      ...current,
      [requestId]: {
        ...current[requestId],
        [key]: value,
      },
    }));
  };

  const updateProjectTask = (requestId, index, key, value) => {
    const tasks = [...(drafts[requestId]?.projectTasks || [])];
    tasks[index] = { ...tasks[index], [key]: value };
    updateDraft(requestId, "projectTasks", tasks);
  };

  const addProjectTask = (requestId) => {
    updateDraft(requestId, "projectTasks", [...(drafts[requestId]?.projectTasks || []), { id: "", title: "", status: "pending", plannedDate: "", reviewUrl: "", clientDecision: "none", clientComments: [] }]);
  };

  const removeProjectTask = (requestId, index) => {
    updateDraft(requestId, "projectTasks", (drafts[requestId]?.projectTasks || []).filter((_, taskIndex) => taskIndex !== index));
  };

  const moveProjectTask = (requestId, index, direction) => {
    const tasks = [...(drafts[requestId]?.projectTasks || [])];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= tasks.length) return;
    [tasks[index], tasks[nextIndex]] = [tasks[nextIndex], tasks[index]];
    updateDraft(requestId, "projectTasks", tasks);
  };

  const handleSaveProjectTasks = async (request) => {
    const tasks = (drafts[request._id]?.projectTasks || []).map((task) => ({ id: task.id, title: task.title.trim(), status: task.status, plannedDate: task.plannedDate || null, reviewUrl: task.reviewUrl.trim() })).filter((task) => task.title);
    try {
      setSavingTasksId(request._id);
      const updated = await webServiceRequestService.updateRequest(request._id, { projectTasks: tasks });
      setRequests((current) => current.map((item) => item._id === request._id ? updated : item));
      setDrafts((current) => ({ ...current, [request._id]: buildDraft(updated) }));
      toast.success("Kliento darbų planas išsaugotas.");
    } catch (saveError) {
      toast.error(saveError.response?.data?.message || "Nepavyko išsaugoti darbų plano.");
    } finally {
      setSavingTasksId("");
    }
  };

  const handleSaveRevisionLimit = async (request) => {
    const draft = drafts[request._id];
    try {
      setSavingRevisionsId(request._id);
      const updated = await webServiceRequestService.updateRequest(request._id, { revisionLimit: Number(draft.revisionLimit) });
      setRequests((current) => current.map((item) => item._id === request._id ? updated : item));
      setDrafts((current) => ({ ...current, [request._id]: buildDraft(updated) }));
      toast.success("Korekcijų limitas išsaugotas.");
    } catch (saveError) {
      toast.error(saveError.response?.data?.message || "Nepavyko išsaugoti korekcijų limito.");
    } finally {
      setSavingRevisionsId("");
    }
  };

  const handleStartRevisionRound = async (request) => {
    const draft = drafts[request._id];
    try {
      setSavingRevisionsId(request._id);
      const updated = await webServiceRequestService.updateRequest(request._id, {
        startRevisionRound: true,
        revisionRoundNote: draft.revisionRoundNote.trim(),
      });
      setRequests((current) => current.map((item) => item._id === request._id ? updated : item));
      setDrafts((current) => ({ ...current, [request._id]: buildDraft(updated) }));
      toast.success("Korekcijų etapas užregistruotas.");
    } catch (saveError) {
      toast.error(saveError.response?.data?.message || "Nepavyko užregistruoti korekcijų etapo.");
    } finally {
      setSavingRevisionsId("");
    }
  };

  const handleSend = async (request) => {
    const draft = drafts[request._id];
    if (!draft) return;

    try {
      setSendingId(request._id);
      const result = await webServiceRequestService.sendProposal(request._id, {
        proposalPrice: draft.proposalPrice === "" ? null : Number(draft.proposalPrice),
        proposalSummary: draft.proposalSummary,
        proposalScope: draft.proposalScope,
        proposalTerms: draft.proposalTerms,
        depositPercent: Number(draft.depositPercent),
        expiryDays: Number(draft.expiryDays),
      });

      setRequests((current) =>
        current.map((item) => (item._id === request._id ? result.request : item))
      );
      setDrafts((current) => ({
        ...current,
        [request._id]: buildDraft(result.request),
      }));
      setProposalUrls((current) => ({ ...current, [request._id]: result.proposalUrl || "" }));

      if (result.email?.sent) {
        toast.success("Pasiūlymas išsiųstas klientui.");
      } else {
        toast.success("Pasiūlymas sukurtas. Nukopijuok nuorodą ir išsiųsk klientui.");
      }
    } catch (sendError) {
      toast.error(sendError.response?.data?.message || "Nepavyko išsiųsti pasiūlymo.");
    } finally {
      setSendingId("");
    }
  };

  const handleSyncDeposit = async (requestId) => {
    try {
      setSyncingId(requestId);
      const updated = await webServiceRequestService.syncDeposit(requestId);
      setRequests((current) =>
        current.map((request) => (request._id === requestId ? updated : request))
      );
      toast.success(
        updated.depositStatus === "paid" ? (updated.paymentPlan === "full" ? "Pilnas mokėjimas patvirtintas." : "Avansas patvirtintas.") : "Stripe būsena atnaujinta."
      );
    } catch (syncError) {
      toast.error(syncError.response?.data?.message || "Nepavyko patikrinti pirmo mokėjimo.");
    } finally {
      setSyncingId("");
    }
  };

  const handleMarkBankTransferPaid = async (request) => {
    const confirmed = window.confirm(
      `Patvirtinti, kad gautas ${formatCurrency(request.depositAmount)} ${request.paymentPlan === "full" ? "pilnas mokėjimas" : "avansas"} pavedimu už ${request.requestNumber}?`
    );
    if (!confirmed) return;

    try {
      setMarkingPaidId(request._id);
      const updated = await webServiceRequestService.markBankTransferPaid(request._id);
      setRequests((current) =>
        current.map((item) => (item._id === request._id ? updated : item))
      );
      toast.success(request.paymentPlan === "full" ? "Pilnas mokėjimas pažymėtas gautu banko pavedimu." : "Avansas pažymėtas gautu banko pavedimu.");
    } catch (markError) {
      toast.error(markError.response?.data?.message || "Nepavyko pažymėti mokėjimo gautu.");
    } finally {
      setMarkingPaidId("");
    }
  };

  const handleRequestFinalPayment = async (request) => {
    const amount = Math.round((Number(request.proposalPrice || 0) - Number(request.depositAmount || 0)) * 100) / 100;
    if (!window.confirm(`Išsiųsti klientui prašymą apmokėti ${formatCurrency(amount)} projekto likutį?`)) return;
    try {
      setRequestingFinalId(request._id);
      const result = await webServiceRequestService.requestFinalPayment(request._id);
      setRequests((current) => current.map((item) => item._id === request._id ? result.request : item));
      setProposalUrls((current) => ({ ...current, [request._id]: result.proposalUrl || "" }));
      toast.success(result.email?.sent ? "Likučio mokėjimo kvietimas išsiųstas klientui." : "Mokėjimo nuoroda sukurta. Nukopijuok ją klientui.");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Nepavyko paruošti likusio mokėjimo.");
    } finally { setRequestingFinalId(""); }
  };

  const handleMarkFinalBankPaid = async (request) => {
    if (!window.confirm(`Patvirtinti, kad ${formatCurrency(request.finalPaymentAmount)} likutis gautas banko pavedimu?`)) return;
    try {
      setFinalBankPaidId(request._id);
      const updated = await webServiceRequestService.markFinalBankTransferPaid(request._id);
      setRequests((current) => current.map((item) => item._id === request._id ? updated : item));
      toast.success("Likutis pažymėtas apmokėtu; testinė PDF sąskaita paruošta siuntimui.");
    } catch (markError) {
      toast.error(markError.response?.data?.message || "Nepavyko pažymėti likučio apmokėtu.");
    } finally { setFinalBankPaidId(""); }
  };

  const handleResendInvoice = async (request, paymentType) => {
    const key = `${request._id}-${paymentType}`;
    try {
      setResendingInvoiceKey(key);
      const result = await webServiceRequestService.resendTestInvoice(request._id, paymentType);
      setRequests((current) => current.map((item) => item._id === request._id ? result.request : item));
      toast.success("Testinė PDF sąskaita išsiųsta pakartotinai.");
    } catch (sendError) {
      toast.error(sendError.response?.data?.message || "Nepavyko pakartotinai išsiųsti PDF sąskaitos.");
    } finally { setResendingInvoiceKey(""); }
  };

  const handleProjectStage = async (requestId, projectStage) => {
    try {
      setUpdatingStageId(requestId);
      const updated = await webServiceRequestService.updateRequest(requestId, { projectStage });
      setRequests((current) => current.map((item) => item._id === requestId ? updated : item));
      toast.success("Projekto etapas atnaujintas.");
    } catch (stageError) {
      toast.error(stageError.response?.data?.message || "Nepavyko atnaujinti projekto etapo.");
    } finally {
      setUpdatingStageId("");
    }
  };

  const handleSaveHandover = async (request) => {
    const draft = drafts[request._id];
    try {
      setSavingHandoverId(request._id);
      const updated = await webServiceRequestService.updateRequest(request._id, {
        projectLiveUrl: draft.projectLiveUrl,
        warrantyEndsAt: draft.warrantyEndsAt || null,
        carePlan: draft.carePlan,
        handoverItems: draft.handoverItemsText.split("\n").map((item) => item.trim()).filter(Boolean),
      });
      setRequests((current) => current.map((item) => item._id === request._id ? updated : item));
      setDrafts((current) => ({ ...current, [request._id]: buildDraft(updated) }));
      toast.success("Perdavimo informacija išsaugota.");
    } catch (saveError) {
      toast.error(saveError.response?.data?.message || "Nepavyko išsaugoti perdavimo informacijos.");
    } finally { setSavingHandoverId(""); }
  };

  const handleResendContract = async (request) => {
    try {
      setResendingContractId(request._id);
      const result = await webServiceRequestService.resendTestContract(request._id);
      setRequests((current) => current.map((item) => item._id === request._id ? result.request : item));
      toast.success("Testinė sutartis išsiųsta pakartotinai.");
    } catch (sendError) {
      toast.error(sendError.response?.data?.message || "Nepavyko išsiųsti testinės sutarties.");
    } finally { setResendingContractId(""); }
  };

  const handleResendHandover = async (request) => {
    try {
      setResendingHandoverId(request._id);
      const result = await webServiceRequestService.resendHandover(request._id);
      setRequests((current) => current.map((item) => item._id === request._id ? result.request : item));
      toast.success("Projekto perdavimo laiškas išsiųstas pakartotinai.");
    } catch (sendError) {
      toast.error(sendError.response?.data?.message || "Nepavyko išsiųsti perdavimo laiško.");
    } finally { setResendingHandoverId(""); }
  };

  const copyProposalUrl = async (requestId) => {
    const url = proposalUrls[requestId];
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Pasiūlymo nuoroda nukopijuota.");
    } catch {
      toast.error("Nepavyko automatiškai nukopijuoti nuorodos.");
    }
  };

  return (
    <div className="space-y-8 font-admin">
      <AdminPageHeader
        eyebrow="Stilloak Web"
        title="Pasiūlymai ir mokėjimai"
        description="Paruošk pasiūlymą su pagrindiniu pilno apmokėjimo variantu ir pasirenkamu mokėjimu dviem dalimis. Kortelės mokėjimai lieka išjungti, kol juos sąmoningai aktyvuosime."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Aktyvūs projektai", stats.active],
          ["Laukia sprendimo", stats.sent],
          ["Patvirtinti", stats.accepted],
          ["Pirmas mokėjimas gautas", stats.paid],
        ].map(([label, value]) => (
          <div key={label} className="dashboard-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-panel p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="dashboard-eyebrow">Sales workflow</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Klientų pasiūlymai
            </h2>
          </div>
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
            <label className="sr-only" htmlFor="web-project-search">Ieškoti projekto</label>
            <input
              id="web-project-search"
              className="input-field min-w-0 sm:min-w-64"
              type="search"
              placeholder="Klientas, el. paštas, numeris..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <select
              className="select-field min-w-0 sm:min-w-56"
              aria-label="Filtruoti projektus"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="active">Aktyvūs</option>
              <option value="needs_payment">Patvirtinti, laukia mokėjimo</option>
              <option value="paid">Pirmas mokėjimas gautas</option>
              <option value="all">Visi</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-6"><LoadingSpinner /></div>
        ) : error ? (
          <div className="mt-6 text-red-600">{error}</div>
        ) : !visibleRequests.length ? (
          <div className="mt-6">
            <EmptyState
              title="Pasiūlymų darbų nėra"
              description="Kai CRM atsiras aktyvus Web lead'as, pasiūlymą galėsi paruošti čia."
              actionLabel="Atidaryti Web CRM"
              actionTo="/admin/web-orders"
            />
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {visibleRequests.map((request) => {
              const draft = drafts[request._id] || buildDraft(request);
              const proposalStatus = request.proposalStatus || "draft";
              const depositStatus = request.depositStatus || "not_requested";
              const finalPaymentStatus = request.finalPaymentStatus || "not_requested";
              const paymentPlan = request.paymentPlan || "split";
              const paymentsFullyPaid = paymentPlan === "full" ? depositStatus === "paid" : finalPaymentStatus === "paid";
              const proposalUrl = proposalUrls[request._id] || "";
              const projectStage = request.projectStage || "awaiting_deposit";

              return (
                <article key={request._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-6 xl:flex-row">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-slate-950">{request.requestNumber}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {request.packageName}
                        </span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          {proposalLabels[proposalStatus] || proposalStatus}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${depositStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"}`}>
                          {depositLabels[depositStatus] || depositStatus}
                        </span>
                        {depositStatus === "paid" ? <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentsFullyPaid ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700"}`}>{paymentsFullyPaid ? "Pilnai apmokėta" : finalPaymentLabels[finalPaymentStatus] || finalPaymentStatus}</span> : null}
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{projectStageLabels[projectStage] || projectStage}</span>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Klientas</p>
                          <p className="mt-1 font-semibold text-slate-950">{request.name}</p>
                          <a href={`mailto:${request.email}`} className="mt-1 block break-all text-sm text-sky-700">{request.email}</a>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Įmonė</p>
                          <p className="mt-1 text-sm font-medium text-slate-800">{request.company || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Pasiūlymo kaina</p>
                          <p className="mt-1 font-semibold text-slate-950">
                            {request.proposalPrice ? formatCurrency(request.proposalPrice) : "Nenustatyta"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Mokėjimo planas</p>
                          <p className="mt-1 font-semibold text-slate-950">
                            {request.depositAmount ? (paymentPlan === "full" ? `Visa suma · ${formatCurrency(request.depositAmount)}` : `${request.depositPercent}% · ${formatCurrency(request.depositAmount)}`) : "—"}
                          </p>
                          {request.depositPaymentMethod ? (
                            <p className="mt-1 text-xs text-slate-500">
                              {paymentMethodLabels[request.depositPaymentMethod] || request.depositPaymentMethod}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {request.proposalAcceptedAt ? (
                        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-900">
                          <strong>Klientas patvirtino:</strong> {request.proposalAcceptedName || request.name} · {new Date(request.proposalAcceptedAt).toLocaleString("lt-LT")}
                          {request.depositPaidAt ? ` · ${paymentPlan === "full" ? "Visa suma" : "Avansas"} gauta ${new Date(request.depositPaidAt).toLocaleString("lt-LT")}` : ""}
                          {paymentsFullyPaid ? ` · Pilnai apmokėta ${new Date(request.finalPaymentPaidAt || request.depositPaidAt).toLocaleString("lt-LT")}` : ""}
                        </div>
                      ) : null}

                      {proposalStatus === "accepted" ? (
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm">
                          <div>
                            <strong>Testinė sutartis: {request.contractTestStatus === "sent" ? "išsiųsta" : request.contractTestStatus || "nesukurta"}</strong>
                            <p className="text-xs text-slate-500">{request.contractTestNumber || "Numeris dar nesukurtas"}{request.contractTestSentAt ? ` · ${new Date(request.contractTestSentAt).toLocaleString("lt-LT")}` : ""}</p>
                            <p className="mt-1 text-xs text-slate-500">Sąskaitos duomenys: {request.billingName || "—"}, {request.billingAddress || "—"}</p>
                          </div>
                          <button type="button" className="dashboard-button-secondary" disabled={resendingContractId === request._id} onClick={() => handleResendContract(request)}>{resendingContractId === request._id ? "Siunčiama..." : "Siųsti sutartį dar kartą"}</button>
                        </div>
                      ) : null}

                      {depositStatus === "paid" ? (
                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Mokėjimų istorija</p>
                          <div className="mt-3 space-y-3 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div><strong>{paymentPlan === "full" ? "Pilnas mokėjimas" : "Avansas"} · {formatCurrency(request.depositAmount)}</strong><p className="text-xs text-slate-500">{paymentMethodLabels[request.depositPaymentMethod] || request.depositPaymentMethod || "—"} · {request.depositPaidAt ? new Date(request.depositPaidAt).toLocaleString("lt-LT") : "—"}</p><p className="text-xs text-slate-500">{request.depositInvoiceNumber ? `Oficiali sąskaita ${request.depositInvoiceNumber}` : "Testinis PDF"}: {(request.depositInvoiceNumber ? request.depositInvoiceStatus : request.depositTestInvoiceStatus) === "sent" ? `išsiųstas ${(request.depositInvoiceSentAt || request.depositTestInvoiceSentAt) ? new Date(request.depositInvoiceSentAt || request.depositTestInvoiceSentAt).toLocaleString("lt-LT") : ""}` : (request.depositInvoiceNumber ? request.depositInvoiceStatus : request.depositTestInvoiceStatus) || "nesukurtas"}</p></div>
                              <button type="button" className="dashboard-button-secondary" disabled={resendingInvoiceKey === `${request._id}-deposit`} onClick={() => handleResendInvoice(request, "deposit")}>{resendingInvoiceKey === `${request._id}-deposit` ? "Siunčiama..." : "Siųsti PDF dar kartą"}</button>
                            </div>
                            {finalPaymentStatus !== "not_requested" ? <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
                              <div><strong>Likutis · {formatCurrency(request.finalPaymentAmount)}</strong><p className="text-xs text-slate-500">{finalPaymentStatus === "paid" ? (paymentMethodLabels[request.finalPaymentMethod] || request.finalPaymentMethod || "—") : finalPaymentLabels[finalPaymentStatus]}{request.finalPaymentPaidAt ? ` · ${new Date(request.finalPaymentPaidAt).toLocaleString("lt-LT")}` : ""}</p><p className="text-xs text-slate-500">{request.finalInvoiceNumber ? `Oficiali sąskaita ${request.finalInvoiceNumber}` : "Testinis PDF"}: {(request.finalInvoiceNumber ? request.finalInvoiceStatus : request.finalTestInvoiceStatus) === "sent" ? `išsiųstas ${(request.finalInvoiceSentAt || request.finalTestInvoiceSentAt) ? new Date(request.finalInvoiceSentAt || request.finalTestInvoiceSentAt).toLocaleString("lt-LT") : ""}` : (request.finalInvoiceNumber ? request.finalInvoiceStatus : request.finalTestInvoiceStatus) || "nesukurtas"}</p></div>
                              {finalPaymentStatus === "paid" ? <button type="button" className="dashboard-button-secondary" disabled={resendingInvoiceKey === `${request._id}-final`} onClick={() => handleResendInvoice(request, "final")}>{resendingInvoiceKey === `${request._id}-final` ? "Siunčiama..." : "Siųsti PDF dar kartą"}</button> : null}
                            </div> : null}
                          </div>
                        </div>
                      ) : null}

                      {proposalUrl ? (
                        <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">Nauja kliento nuoroda</p>
                          <p className="mt-2 break-all text-sm text-slate-700">{proposalUrl}</p>
                          <button type="button" className="dashboard-button-secondary mt-3" onClick={() => copyProposalUrl(request._id)}>
                            Kopijuoti nuorodą
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <div className="w-full shrink-0 space-y-4 xl:w-[440px]">
                      <label className="block text-sm font-medium text-slate-700">Projekto etapas
                        <select className="select-field mt-2 w-full" value={projectStage} disabled={updatingStageId === request._id} onChange={(event) => handleProjectStage(request._id, event.target.value)}>
                          {Object.entries(projectStageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </label>

                      {proposalStatus === "accepted" ? (
                        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Kliento darbų planas</p><p className="mt-1 text-xs text-slate-500">Eiliškumas ir būsenos matomi privačiame projekto puslapyje.</p></div>
                            <button type="button" className="dashboard-button-secondary shrink-0" disabled={(draft.projectTasks || []).length >= 30} onClick={() => addProjectTask(request._id)}>+ Darbas</button>
                          </div>
                          {(draft.projectTasks || []).length ? <div className="space-y-3">
                            {draft.projectTasks.map((task, index) => (
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3" key={`${request._id}-task-${index}`}>
                                <input className="input-field w-full" type="text" maxLength={200} placeholder="Pvz. Mobilios versijos paruošimas" value={task.title} onChange={(event) => updateProjectTask(request._id, index, "title", event.target.value)} />
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  <select className="select-field w-full" aria-label={`Darbo ${index + 1} būsena`} value={task.status} onChange={(event) => updateProjectTask(request._id, index, "status", event.target.value)}>{Object.entries(projectTaskStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                                  <div className="flex justify-end gap-1">
                                    <button type="button" className="dashboard-button-secondary px-3" disabled={index === 0} aria-label="Perkelti darbą aukštyn" onClick={() => moveProjectTask(request._id, index, -1)}>↑</button>
                                    <button type="button" className="dashboard-button-secondary px-3" disabled={index === draft.projectTasks.length - 1} aria-label="Perkelti darbą žemyn" onClick={() => moveProjectTask(request._id, index, 1)}>↓</button>
                                    <button type="button" className="dashboard-button-secondary px-3 text-rose-700" aria-label="Pašalinti darbą" onClick={() => removeProjectTask(request._id, index)}>×</button>
                                  </div>
                                </div>
                                <label className="mt-2 block text-xs font-medium text-slate-600">Planuojama data<input className="input-field mt-1 w-full" type="date" value={task.plannedDate || ""} onChange={(event) => updateProjectTask(request._id, index, "plannedDate", event.target.value)} /></label>
                                <label className="mt-2 block text-xs font-medium text-slate-600">Peržiūros nuoroda<input className="input-field mt-1 w-full" type="url" inputMode="url" maxLength={500} placeholder="https://projekto-preview.vercel.app" value={task.reviewUrl || ""} onChange={(event) => updateProjectTask(request._id, index, "reviewUrl", event.target.value)} /><span className="mt-1 block font-normal text-slate-500">Klientas šią nuorodą matys prie konkretaus darbo.</span></label>
                                {task.completedAt ? <p className="mt-2 text-xs text-emerald-700">Atlikta: {new Date(task.completedAt).toLocaleString("lt-LT")}</p> : null}
                                {task.clientDecision !== "none" ? <p className={`mt-2 rounded-lg px-3 py-2 text-xs font-semibold ${task.clientDecision === "approved" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>Kliento sprendimas: {task.clientDecision === "approved" ? "Patvirtinta" : "Reikia pataisymų"}{task.clientDecisionAt ? ` · ${new Date(task.clientDecisionAt).toLocaleString("lt-LT")}` : ""}</p> : null}
                                {task.clientComments?.length ? <div className="mt-2 space-y-2">{task.clientComments.map((comment, commentIndex) => <div className="rounded-lg bg-white px-3 py-2 text-xs text-slate-700" key={`${task.id}-comment-${commentIndex}`}><strong>Kliento pastaba:</strong> {comment.message}<span className="mt-1 block text-slate-400">{comment.createdAt ? new Date(comment.createdAt).toLocaleString("lt-LT") : ""}</span></div>)}</div> : null}
                              </div>
                            ))}
                          </div> : <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Darbų dar nėra. Paspausk „+ Darbas“ ir sudaryk kliento projekto planą.</p>}
                          <button type="button" className="dashboard-button-primary w-full justify-center" disabled={savingTasksId === request._id} onClick={() => handleSaveProjectTasks(request)}>{savingTasksId === request._id ? "Saugoma..." : "Išsaugoti darbų planą"}</button>
                        </div>
                      ) : null}

                      {proposalStatus === "accepted" ? (
                        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-800">Korekcijų etapai</p>
                            <p className="mt-1 text-sm text-slate-700"><strong>{request.revisionRounds?.length || 0}</strong> iš <strong>{draft.revisionLimit}</strong> panaudota</p>
                          </div>
                          <label className="block text-sm font-medium text-slate-700">Į kainą įskaičiuotų etapų limitas
                            <input className="input-field mt-2 w-full" type="number" min="0" max="10" step="1" value={draft.revisionLimit} onChange={(event) => updateDraft(request._id, "revisionLimit", event.target.value)} />
                          </label>
                          <button type="button" className="dashboard-button-secondary w-full justify-center" disabled={savingRevisionsId === request._id} onClick={() => handleSaveRevisionLimit(request)}>Išsaugoti limitą</button>
                          <label className="block text-sm font-medium text-slate-700">Etapo pastaba (nebūtina)
                            <textarea className="input-field mt-2 min-h-20 w-full resize-y" maxLength={500} placeholder="Pvz. Pagrindinio puslapio dizaino korekcijos" value={draft.revisionRoundNote} onChange={(event) => updateDraft(request._id, "revisionRoundNote", event.target.value)} />
                            <span className="mt-1 block text-xs font-normal text-slate-500">Klientas matys šią pastabą korekcijų istorijoje.</span>
                          </label>
                          <button type="button" className="dashboard-button-primary w-full justify-center" disabled={savingRevisionsId === request._id} onClick={() => handleStartRevisionRound(request)}>{savingRevisionsId === request._id ? "Saugoma..." : "Registruoti korekcijų etapą"}</button>
                          {request.revisionRounds?.length ? <div className="space-y-2 border-t border-amber-200 pt-3">{request.revisionRounds.map((round) => <div className="rounded-lg bg-white px-3 py-2 text-xs text-slate-700" key={`${request._id}-revision-${round.number}`}><strong>{round.number} korekcijų etapas</strong><span className="mt-1 block text-slate-500">{round.startedAt ? new Date(round.startedAt).toLocaleString("lt-LT") : ""}{round.note ? ` · ${round.note}` : ""}</span></div>)}</div> : null}
                          {(request.revisionRounds?.length || 0) >= Number(draft.revisionLimit) ? <p className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">Į kainą įskaičiuotas limitas pasiektas. Kitas etapas bus pažymėtas kaip papildomas.</p> : null}
                        </div>
                      ) : null}

                      {depositStatus === "paid" ? (
                        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Perdavimo informacija</p>
                          <label className="block text-sm font-medium text-slate-700">Vieša svetainės nuoroda<input className="input-field mt-2 w-full" type="url" placeholder="https://..." value={draft.projectLiveUrl || ""} onChange={(event) => updateDraft(request._id, "projectLiveUrl", event.target.value)} /></label>
                          <label className="block text-sm font-medium text-slate-700">Garantija iki<input className="input-field mt-2 w-full" type="date" value={draft.warrantyEndsAt || ""} onChange={(event) => updateDraft(request._id, "warrantyEndsAt", event.target.value)} /></label>
                          <label className="block text-sm font-medium text-slate-700">Priežiūros planas<textarea className="input-field mt-2 min-h-20 w-full resize-y" value={draft.carePlan || ""} onChange={(event) => updateDraft(request._id, "carePlan", event.target.value)} /></label>
                          <label className="block text-sm font-medium text-slate-700">Klientui perduodami failai ir nuorodos<textarea className="input-field mt-2 min-h-24 w-full resize-y" placeholder={"Svetainės instrukcija | https://...\nLogotipo failai | https://..."} value={draft.handoverItemsText || ""} onChange={(event) => updateDraft(request._id, "handoverItemsText", event.target.value)} /><span className="mt-1 block text-xs font-normal text-slate-500">Po vieną eilutėje: pavadinimas | saugi https:// nuoroda</span></label>
                          <button type="button" className="dashboard-button-secondary w-full justify-center" disabled={savingHandoverId === request._id} onClick={() => handleSaveHandover(request)}>{savingHandoverId === request._id ? "Saugoma..." : "Išsaugoti perdavimo informaciją"}</button>
                          {paymentsFullyPaid ? <button type="button" className="dashboard-button-secondary w-full justify-center" disabled={resendingHandoverId === request._id} onClick={() => handleResendHandover(request)}>{resendingHandoverId === request._id ? "Siunčiama..." : "Siųsti perdavimo laišką dar kartą"}</button> : null}
                        </div>
                      ) : null}
                      <label className="block text-sm font-medium text-slate-700">
                        Projekto kaina, €
                        <input
                          className="input-field mt-2 w-full"
                          type="number"
                          min="1"
                          step="0.01"
                          value={draft.proposalPrice ?? ""}
                          onChange={(event) => updateDraft(request._id, "proposalPrice", event.target.value)}
                        />
                      </label>

                      <label className="block text-sm font-medium text-slate-700">
                        Pasiūlymo santrauka
                        <textarea
                          className="input-field mt-2 min-h-24 w-full resize-y"
                          value={draft.proposalSummary || ""}
                          onChange={(event) => updateDraft(request._id, "proposalSummary", event.target.value)}
                        />
                      </label>

                      <label className="block text-sm font-medium text-slate-700">
                        Darbų apimtis
                        <textarea
                          className="input-field mt-2 min-h-32 w-full resize-y"
                          value={draft.proposalScope || ""}
                          onChange={(event) => updateDraft(request._id, "proposalScope", event.target.value)}
                        />
                      </label>

                      <label className="block text-sm font-medium text-slate-700">
                        Sąlygos
                        <textarea
                          className="input-field mt-2 min-h-28 w-full resize-y"
                          value={draft.proposalTerms || ""}
                          onChange={(event) => updateDraft(request._id, "proposalTerms", event.target.value)}
                        />
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Dviejų mokėjimų avansas, %
                          <input
                            className="input-field mt-2 w-full"
                            type="number"
                            min="10"
                            max="90"
                            value={draft.depositPercent ?? 50}
                            onChange={(event) => updateDraft(request._id, "depositPercent", event.target.value)}
                          />
                        </label>
                        <label className="block text-sm font-medium text-slate-700">
                          Galioja, dienų
                          <input
                            className="input-field mt-2 w-full"
                            type="number"
                            min="1"
                            max="60"
                            value={draft.expiryDays ?? 14}
                            onChange={(event) => updateDraft(request._id, "expiryDays", event.target.value)}
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        className="dashboard-button-primary w-full justify-center"
                        disabled={sendingId === request._id || depositStatus === "paid"}
                        onClick={() => handleSend(request)}
                      >
                        {sendingId === request._id ? "Siunčiama..." : proposalStatus === "draft" ? "Paruošti ir išsiųsti" : "Atnaujinti ir išsiųsti naują"}
                      </button>

                      {proposalStatus === "accepted" && depositStatus !== "paid" ? (
                        <button
                          type="button"
                          className="dashboard-button-secondary w-full justify-center"
                          disabled={markingPaidId === request._id}
                          onClick={() => handleMarkBankTransferPaid(request)}
                        >
                          {markingPaidId === request._id ? "Žymima..." : paymentPlan === "full" ? "Pažymėti pilną mokėjimą gautu" : "Pažymėti avansą gautu pavedimu"}
                        </button>
                      ) : null}

                      {request.stripeDepositCheckoutSessionId && depositStatus !== "paid" ? (
                        <button
                          type="button"
                          className="dashboard-button-secondary w-full justify-center"
                          disabled={syncingId === request._id}
                          onClick={() => handleSyncDeposit(request._id)}
                        >
                          {syncingId === request._id ? "Tikrinama..." : "Patikrinti ankstesnį Stripe mokėjimą"}
                        </button>
                      ) : null}

                      {paymentPlan === "split" && depositStatus === "paid" && finalPaymentStatus !== "paid" ? (
                        <button type="button" className="dashboard-button-primary w-full justify-center" disabled={requestingFinalId === request._id} onClick={() => handleRequestFinalPayment(request)}>
                          {requestingFinalId === request._id ? "Siunčiama..." : finalPaymentStatus === "not_requested" ? "Prašyti likusio mokėjimo" : "Siųsti naują likučio nuorodą"}
                        </button>
                      ) : null}
                      {depositStatus === "paid" && ["requested", "pending"].includes(finalPaymentStatus) ? (
                        <button type="button" className="dashboard-button-secondary w-full justify-center" disabled={finalBankPaidId === request._id} onClick={() => handleMarkFinalBankPaid(request)}>{finalBankPaidId === request._id ? "Žymima..." : "Pažymėti likutį gautu pavedimu"}</button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebProposalsPage;
