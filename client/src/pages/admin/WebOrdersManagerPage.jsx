import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import AdminPageHeader from "../../components/admin-dashboard/AdminPageHeader";
import StatusBadge from "../../components/admin/StatusBadge";
import webServiceRequestService from "../../services/webServiceRequestService";
import { formatCurrency } from "../../utils/currency";

const statusOptions = [
  "new",
  "contacted",
  "qualifying",
  "proposal_sent",
  "accepted",
  "in_progress",
  "completed",
  "lost",
];

const statusLabels = {
  new: "Naujas",
  contacted: "Susisiekta",
  qualifying: "Vertinamas",
  proposal_sent: "Pasiūlymas išsiųstas",
  accepted: "Priimtas",
  in_progress: "Projektas vykdomas",
  completed: "Baigtas",
  lost: "Prarastas",
};

const OPEN_STATUSES = new Set(["new", "contacted", "qualifying", "proposal_sent"]);
const PIPELINE_STATUSES = new Set(["new", "contacted", "qualifying", "proposal_sent", "accepted"]);

const contactTypeOptions = [
  ["note", "Pastaba"],
  ["email", "El. laiškas"],
  ["call", "Skambutis"],
  ["meeting", "Susitikimas"],
  ["proposal", "Pasiūlymas"],
];

const contactTypeLabels = Object.fromEntries(contactTypeOptions);

const sourceLabel = (request) => {
  const legacySource = request.source === "stilloak-web-services" ? "direct" : request.source;
  const source = request.attribution?.source || legacySource || "direct";
  const medium = request.attribution?.medium || "none";
  return medium && medium !== "none" ? `${source} / ${medium}` : source;
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const getLeadPriority = (request) => {
  let score = 0;

  if (["pro", "custom"].includes(request.packageId)) score += 3;
  else if (request.packageId === "business") score += 2;
  else score += 1;

  if (request.company) score += 1;
  if (request.phone) score += 1;
  if (request.budget) score += 1;
  if (request.attribution?.gclid || request.attribution?.fbclid) score += 1;

  if (score >= 5) {
    return { score, label: "Aukštas", className: "bg-rose-50 text-rose-700" };
  }
  if (score >= 3) {
    return { score, label: "Vidutinis", className: "bg-amber-50 text-amber-700" };
  }
  return { score, label: "Normalus", className: "bg-slate-100 text-slate-600" };
};

const isOverdue = (request, now = Date.now()) =>
  Boolean(
    request.nextActionAt &&
      OPEN_STATUSES.has(request.status) &&
      new Date(request.nextActionAt).getTime() < now
  );

const needsAttention = (request, now = Date.now()) =>
  OPEN_STATUSES.has(request.status) &&
  (request.status === "new" || !request.nextActionAt || isOverdue(request, now));

const pipelineValueFor = (request) =>
  Number(request.finalPrice ?? request.proposalPrice ?? request.basePrice ?? 0) || 0;

const buildDraft = (request) => ({
  status: request.status,
  proposalPrice: request.proposalPrice ?? "",
  finalPrice: request.finalPrice ?? "",
  nextAction: request.nextAction || "",
  nextActionAt: toDateTimeLocal(request.nextActionAt),
  dueDate: toDateInput(request.dueDate),
  internalNotes: request.internalNotes || "",
  contactType: "call",
  contactNote: "",
});

const WebOrdersManagerPage = () => {
  const [requests, setRequests] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [contactSavingId, setContactSavingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [attentionFilter, setAttentionFilter] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await webServiceRequestService.getAdminRequests(statusFilter);
      setRequests(data);
      setDrafts(Object.fromEntries(data.map((request) => [request._id, buildDraft(request)])));
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Nepavyko užkrauti Web užsakymų.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const stats = useMemo(() => {
    const now = Date.now();
    const open = requests.filter((request) => OPEN_STATUSES.has(request.status));
    const followUps = open.filter((request) => request.nextActionAt);

    return {
      total: requests.length,
      open: open.length,
      attention: open.filter((request) => needsAttention(request, now)).length,
      overdue: followUps.filter((request) => isOverdue(request, now)).length,
      pipelineValue: requests
        .filter((request) => PIPELINE_STATUSES.has(request.status))
        .reduce((sum, request) => sum + pipelineValueFor(request), 0),
    };
  }, [requests]);

  const displayedRequests = useMemo(() => {
    const now = Date.now();
    const filtered = requests.filter((request) => {
      if (attentionFilter === "attention") return needsAttention(request, now);
      if (attentionFilter === "overdue") return isOverdue(request, now);
      return true;
    });

    return [...filtered].sort((a, b) => {
      const overdueDifference = Number(isOverdue(b, now)) - Number(isOverdue(a, now));
      if (overdueDifference) return overdueDifference;

      const attentionDifference = Number(needsAttention(b, now)) - Number(needsAttention(a, now));
      if (attentionDifference) return attentionDifference;

      const priorityDifference = getLeadPriority(b).score - getLeadPriority(a).score;
      if (priorityDifference) return priorityDifference;

      const aFollowUp = a.nextActionAt ? new Date(a.nextActionAt).getTime() : Number.POSITIVE_INFINITY;
      const bFollowUp = b.nextActionAt ? new Date(b.nextActionAt).getTime() : Number.POSITIVE_INFINITY;
      if (aFollowUp !== bFollowUp) return aFollowUp - bFollowUp;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [attentionFilter, requests]);

  const updateDraft = (requestId, key, value) => {
    setDrafts((current) => ({
      ...current,
      [requestId]: {
        ...current[requestId],
        [key]: value,
      },
    }));
  };

  const setQuickFollowUp = (requestId, hours) => {
    const nextDate = new Date(Date.now() + hours * 60 * 60 * 1000);
    setDrafts((current) => ({
      ...current,
      [requestId]: {
        ...current[requestId],
        nextAction: current[requestId]?.nextAction || "Susisiekti su klientu",
        nextActionAt: toDateTimeLocal(nextDate),
      },
    }));
  };

  const handleSave = async (requestId) => {
    const draft = drafts[requestId];
    if (!draft) return;

    try {
      setSavingId(requestId);
      const updated = await webServiceRequestService.updateRequest(requestId, {
        status: draft.status,
        proposalPrice: draft.proposalPrice === "" ? null : Number(draft.proposalPrice),
        finalPrice: draft.finalPrice === "" ? null : Number(draft.finalPrice),
        nextAction: draft.nextAction,
        nextActionAt: draft.nextActionAt ? new Date(draft.nextActionAt).toISOString() : null,
        dueDate: draft.dueDate || null,
        internalNotes: draft.internalNotes,
      });
      setRequests((current) => current.map((request) => (request._id === requestId ? updated : request)));
      setDrafts((current) => ({
        ...current,
        [requestId]: {
          ...buildDraft(updated),
          contactType: current[requestId]?.contactType || "call",
          contactNote: current[requestId]?.contactNote || "",
        },
      }));
      toast.success("CRM duomenys atnaujinti.");
    } catch (saveError) {
      toast.error(saveError.response?.data?.message || "Nepavyko išsaugoti pakeitimų.");
    } finally {
      setSavingId("");
    }
  };

  const handleAddContact = async (requestId) => {
    const draft = drafts[requestId];
    const note = draft?.contactNote?.trim();
    if (!note) {
      toast.error("Įrašyk kontakto rezultatą arba pastabą.");
      return;
    }

    try {
      setContactSavingId(requestId);
      const updated = await webServiceRequestService.updateRequest(requestId, {
        contactEntry: {
          type: draft.contactType || "note",
          note,
          happenedAt: new Date().toISOString(),
        },
      });
      setRequests((current) => current.map((request) => (request._id === requestId ? updated : request)));
      setDrafts((current) => ({
        ...current,
        [requestId]: {
          ...current[requestId],
          contactNote: "",
        },
      }));
      toast.success("Kontaktas pridėtas į istoriją.");
    } catch (saveError) {
      toast.error(saveError.response?.data?.message || "Nepavyko pridėti kontakto.");
    } finally {
      setContactSavingId("");
    }
  };

  return (
    <div className="space-y-8 font-admin">
      <AdminPageHeader
        eyebrow="Stilloak Web"
        title="Svetainių užsakymai"
        description="CRM V3 automatiškai suplanuoja pirmą follow-up, prioritetizuoja vertingiausius lead'us ir pirmiausia rodo tai, kam reikia tavo dėmesio."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Rodoma", stats.total],
          ["Aktyvūs lead'ai", stats.open],
          ["Reikia dėmesio", stats.attention],
          ["Vėluoja", stats.overdue],
          ["Pipeline vertė", formatCurrency(stats.pipelineValue)],
        ].map(([label, value]) => (
          <div key={label} className="dashboard-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="dashboard-eyebrow">Pipeline</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Web pardavimų eilė</h2>
            <p className="mt-2 text-sm text-slate-500">Vėluojantys ir aukštesnio prioriteto lead'ai automatiškai keliami į viršų.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              className="select-field min-w-52"
              value={attentionFilter}
              onChange={(event) => setAttentionFilter(event.target.value)}
            >
              <option value="">Visi lead'ai</option>
              <option value="attention">Reikia dėmesio</option>
              <option value="overdue">Tik vėluojantys</option>
            </select>
            <select
              className="select-field min-w-56"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Visos būsenos</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-6"><LoadingSpinner /></div>
        ) : error ? (
          <div className="mt-6 text-red-600">{error}</div>
        ) : !requests.length ? (
          <div className="mt-6">
            <EmptyState
              title="Web užsakymų kol kas nėra"
              description="Kai klientas pateiks užsakymą per web.stilloak-studio.com, jis atsiras čia ir automatiškai gaus pirmą follow-up."
              actionLabel="Atnaujinti"
              actionTo="/admin/web-orders"
            />
          </div>
        ) : !displayedRequests.length ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            Pagal pasirinktą filtrą lead'ų nėra.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {displayedRequests.map((request) => {
              const draft = drafts[request._id] || {};
              const displayedPrice = request.finalPrice ?? request.proposalPrice ?? request.basePrice;
              const attribution = request.attribution || {};
              const contactHistory = [...(request.contactHistory || [])].sort(
                (a, b) => new Date(b.happenedAt || b.createdAt) - new Date(a.happenedAt || a.createdAt)
              );
              const priority = getLeadPriority(request);
              const overdue = isOverdue(request);
              const attention = needsAttention(request);

              return (
                <article
                  key={request._id}
                  className={`rounded-3xl border bg-white p-5 shadow-sm sm:p-6 ${
                    overdue ? "border-rose-300 ring-1 ring-rose-100" : attention ? "border-amber-200" : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-mono text-sm font-semibold text-slate-950">{request.requestNumber}</p>
                        <StatusBadge status={request.status} />
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {request.packageName}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priority.className}`}>
                          Prioritetas: {priority.label}
                        </span>
                        {overdue ? (
                          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Follow-up vėluoja</span>
                        ) : null}
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Šaltinis: {sourceLabel(request)}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Klientas</p>
                          <p className="mt-1 font-semibold text-slate-950">{request.name}</p>
                          <a className="mt-1 block break-all text-sm text-sky-700" href={`mailto:${request.email}`}>
                            {request.email}
                          </a>
                          {request.phone ? <a className="mt-1 block text-sm text-slate-600" href={`tel:${request.phone}`}>{request.phone}</a> : null}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Įmonė</p>
                          <p className="mt-1 text-sm font-medium text-slate-800">{request.company || "—"}</p>
                          <p className="mt-2 text-xs text-slate-500">{new Date(request.createdAt).toLocaleString("lt-LT")}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Bazinė kaina</p>
                          <p className="mt-1 font-semibold text-slate-950">
                            {request.basePrice == null ? "Individuali" : formatCurrency(request.basePrice)}
                          </p>
                          {request.budget ? <p className="mt-1 text-sm text-slate-500">Biudžetas: {request.budget}</p> : null}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Pipeline vertė</p>
                          <p className="mt-1 font-semibold text-slate-950">
                            {displayedPrice == null ? "Nenustatyta" : formatCurrency(displayedPrice)}
                          </p>
                        </div>
                      </div>

                      <div className={`mt-5 grid gap-4 rounded-2xl border p-4 md:grid-cols-3 ${overdue ? "border-rose-200 bg-rose-50/60" : "border-amber-100 bg-amber-50/50"}`}>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700/70">Kitas veiksmas</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{request.nextAction || "Nenustatytas"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700/70">Follow-up</p>
                          <p className="mt-1 text-sm text-slate-700">
                            {request.nextActionAt ? new Date(request.nextActionAt).toLocaleString("lt-LT") : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700/70">Projekto terminas</p>
                          <p className="mt-1 text-sm text-slate-700">
                            {request.dueDate ? new Date(request.dueDate).toLocaleDateString("lt-LT") : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70">Source / medium</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{sourceLabel(request)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70">Kampanija</p>
                          <p className="mt-1 break-words text-sm text-slate-700">{attribution.campaign || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70">Landing page</p>
                          <p className="mt-1 break-all text-sm text-slate-700">{attribution.landingPage || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70">Referrer</p>
                          <p className="mt-1 break-all text-sm text-slate-700">{attribution.referrer || "—"}</p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Projekto aprašymas</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{request.message}</p>
                      </div>

                      <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Kontaktų istorija</p>
                            <p className="mt-1 text-sm text-slate-600">Skambučiai, laiškai, susitikimai ir išsiųsti pasiūlymai.</p>
                          </div>
                          <span className="text-sm font-semibold text-slate-500">{contactHistory.length} įraš.</span>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto]">
                          <select
                            className="select-field w-full"
                            value={draft.contactType || "call"}
                            onChange={(event) => updateDraft(request._id, "contactType", event.target.value)}
                          >
                            {contactTypeOptions.map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                          <input
                            className="input-field w-full"
                            value={draft.contactNote || ""}
                            placeholder="Pvz. Klientas patvirtino biudžetą, perskambinti penktadienį"
                            onChange={(event) => updateDraft(request._id, "contactNote", event.target.value)}
                          />
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={contactSavingId === request._id}
                            onClick={() => handleAddContact(request._id)}
                          >
                            {contactSavingId === request._id ? "Pridedama..." : "Pridėti"}
                          </button>
                        </div>

                        {contactHistory.length ? (
                          <div className="mt-4 space-y-3">
                            {contactHistory.slice(0, 8).map((entry) => (
                              <div key={entry._id || `${entry.happenedAt}-${entry.note}`} className="rounded-xl bg-slate-50 px-4 py-3">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                  <span>{contactTypeLabels[entry.type] || entry.type}</span>
                                  <span>•</span>
                                  <span>{new Date(entry.happenedAt || entry.createdAt).toLocaleString("lt-LT")}</span>
                                </div>
                                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{entry.note}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-slate-500">Kontaktų istorijos dar nėra.</p>
                        )}
                      </div>
                    </div>

                    <div className="w-full shrink-0 space-y-4 xl:w-80">
                      <label className="block text-sm font-medium text-slate-700">
                        Būsena
                        <select
                          className="select-field mt-2 w-full"
                          value={draft.status || request.status}
                          onChange={(event) => updateDraft(request._id, "status", event.target.value)}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{statusLabels[status]}</option>
                          ))}
                        </select>
                      </label>

                      <label className="block text-sm font-medium text-slate-700">
                        Pasiūlymo kaina, €
                        <input
                          className="input-field mt-2 w-full"
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.proposalPrice ?? ""}
                          placeholder={request.basePrice == null ? "Įrašyti po įvertinimo" : String(request.basePrice)}
                          onChange={(event) => updateDraft(request._id, "proposalPrice", event.target.value)}
                        />
                      </label>

                      <label className="block text-sm font-medium text-slate-700">
                        Galutinė kaina, €
                        <input
                          className="input-field mt-2 w-full"
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.finalPrice ?? ""}
                          placeholder="Po susitarimo"
                          onChange={(event) => updateDraft(request._id, "finalPrice", event.target.value)}
                        />
                      </label>

                      <label className="block text-sm font-medium text-slate-700">
                        Kitas veiksmas
                        <textarea
                          className="input-field mt-2 min-h-20 w-full resize-y"
                          value={draft.nextAction || ""}
                          placeholder="Pvz. Perskambinti ir patvirtinti pasiūlymą"
                          onChange={(event) => updateDraft(request._id, "nextAction", event.target.value)}
                        />
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Follow-up data
                          <input
                            className="input-field mt-2 w-full"
                            type="datetime-local"
                            value={draft.nextActionAt || ""}
                            onChange={(event) => updateDraft(request._id, "nextActionAt", event.target.value)}
                          />
                        </label>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {[[2, "+2 val."], [24, "Rytoj"], [72, "+3 d."]].map(([hours, label]) => (
                            <button
                              key={label}
                              type="button"
                              className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                              onClick={() => setQuickFollowUp(request._id, hours)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label className="block text-sm font-medium text-slate-700">
                        Projekto terminas
                        <input
                          className="input-field mt-2 w-full"
                          type="date"
                          value={draft.dueDate || ""}
                          onChange={(event) => updateDraft(request._id, "dueDate", event.target.value)}
                        />
                      </label>

                      <label className="block text-sm font-medium text-slate-700">
                        Vidinės pastabos
                        <textarea
                          className="input-field mt-2 min-h-28 w-full resize-y"
                          value={draft.internalNotes || ""}
                          placeholder="Sąlygos, rizikos, kliento pageidavimai..."
                          onChange={(event) => updateDraft(request._id, "internalNotes", event.target.value)}
                        />
                      </label>

                      <button
                        type="button"
                        className="dashboard-button-primary w-full justify-center"
                        disabled={savingId === request._id}
                        onClick={() => handleSave(request._id)}
                      >
                        {savingId === request._id ? "Saugoma..." : "Išsaugoti CRM"}
                      </button>
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

export default WebOrdersManagerPage;
