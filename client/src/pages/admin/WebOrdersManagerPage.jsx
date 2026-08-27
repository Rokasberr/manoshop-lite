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

const sourceLabel = (request) => {
  const source = request.attribution?.source || request.source || "direct";
  const medium = request.attribution?.medium || "none";
  return medium && medium !== "none" ? `${source} / ${medium}` : source;
};

const WebOrdersManagerPage = () => {
  const [requests, setRequests] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await webServiceRequestService.getAdminRequests(statusFilter);
      setRequests(data);
      setDrafts(
        Object.fromEntries(
          data.map((request) => [
            request._id,
            {
              status: request.status,
              finalPrice: request.finalPrice ?? "",
              internalNotes: request.internalNotes || "",
            },
          ])
        )
      );
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
    const openStatuses = new Set(["new", "contacted", "qualifying", "proposal_sent"]);
    return {
      total: requests.length,
      open: requests.filter((request) => openStatuses.has(request.status)).length,
      accepted: requests.filter((request) => ["accepted", "in_progress"].includes(request.status)).length,
      completed: requests.filter((request) => request.status === "completed").length,
    };
  }, [requests]);

  const updateDraft = (requestId, key, value) => {
    setDrafts((current) => ({
      ...current,
      [requestId]: {
        ...current[requestId],
        [key]: value,
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
        finalPrice: draft.finalPrice === "" ? null : Number(draft.finalPrice),
        internalNotes: draft.internalNotes,
      });
      setRequests((current) => current.map((request) => (request._id === requestId ? updated : request)));
      setDrafts((current) => ({
        ...current,
        [requestId]: {
          status: updated.status,
          finalPrice: updated.finalPrice ?? "",
          internalNotes: updated.internalNotes || "",
        },
      }));
      toast.success("Web užsakymas atnaujintas.");
    } catch (saveError) {
      toast.error(saveError.response?.data?.message || "Nepavyko išsaugoti pakeitimų.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="space-y-8 font-admin">
      <AdminPageHeader
        eyebrow="Stilloak Web"
        title="Svetainių užsakymai"
        description="Visos užklausos iš web.stilloak-studio.com vienoje vietoje: kontaktai, paketas, projekto vertė, pardavimo būsena ir reklamos / lankytojo šaltinis."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Rodoma", stats.total],
          ["Aktyvūs lead'ai", stats.open],
          ["Priimti / vykdomi", stats.accepted],
          ["Baigti", stats.completed],
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
            <p className="dashboard-eyebrow">Pipeline</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Visi Web užsakymai</h2>
          </div>
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

        {loading ? (
          <div className="mt-6"><LoadingSpinner /></div>
        ) : error ? (
          <div className="mt-6 text-red-600">{error}</div>
        ) : !requests.length ? (
          <div className="mt-6">
            <EmptyState
              title="Web užsakymų kol kas nėra"
              description="Kai klientas pateiks užsakymą per web.stilloak-studio.com, jis atsiras čia."
              actionLabel="Atnaujinti"
              actionTo="/admin/web-orders"
            />
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {requests.map((request) => {
              const draft = drafts[request._id] || {};
              const displayedPrice = request.finalPrice ?? request.basePrice;
              const attribution = request.attribution || {};

              return (
                <article key={request._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-mono text-sm font-semibold text-slate-950">{request.requestNumber}</p>
                        <StatusBadge status={request.status} />
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {request.packageName}
                        </span>
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
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Dabartinė vertė</p>
                          <p className="mt-1 font-semibold text-slate-950">
                            {displayedPrice == null ? "Nenustatyta" : formatCurrency(displayedPrice)}
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
                        Galutinė kaina, €
                        <input
                          className="input-field mt-2 w-full"
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.finalPrice ?? ""}
                          placeholder={request.basePrice == null ? "Įrašyti po įvertinimo" : String(request.basePrice)}
                          onChange={(event) => updateDraft(request._id, "finalPrice", event.target.value)}
                        />
                      </label>

                      <label className="block text-sm font-medium text-slate-700">
                        Vidinės pastabos
                        <textarea
                          className="input-field mt-2 min-h-28 w-full resize-y"
                          value={draft.internalNotes || ""}
                          placeholder="Skambučio rezultatas, sutartos sąlygos, kitas veiksmas..."
                          onChange={(event) => updateDraft(request._id, "internalNotes", event.target.value)}
                        />
                      </label>

                      <button
                        type="button"
                        className="dashboard-button-primary w-full justify-center"
                        disabled={savingId === request._id}
                        onClick={() => handleSave(request._id)}
                      >
                        {savingId === request._id ? "Saugoma..." : "Išsaugoti"}
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
