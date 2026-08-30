import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CalendarDays,
  CreditCard,
  Download,
  ExternalLink,
  FileCheck2,
  FolderOpen,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Circle,
  Clock3,
} from "lucide-react";

type InvoiceInfo = { number: string; status: string; sentAt: string | null; downloadPath: string } | null;

type PublicProposal = {
  requestNumber: string;
  customer: { name: string; company: string; billingName: string; companyCode: string; vatCode: string; billingAddress: string };
  package: { id: string; name: string };
  proposal: {
    price: number | null;
    summary: string;
    scope: string;
    terms: string;
    status: string;
    sentAt: string | null;
    viewedAt: string | null;
    acceptedAt: string | null;
    acceptedName: string;
    expiresAt: string | null;
    termsVersion: string;
  };
  deposit: {
    percent: number;
    amount: number | null;
    status: string;
    paidAt: string | null;
    paymentMethod: string;
    invoice: InvoiceInfo;
  };
  finalPayment: { amount: number | null; status: string; requestedAt: string | null; paidAt: string | null; paymentMethod: string; invoice: InvoiceInfo };
  project: {
    stage: string;
    dueDate: string | null;
    liveUrl: string;
    warrantyEndsAt: string | null;
    carePlan: string;
    files: Array<{ label: string; url: string }>;
    tasks: Array<{ id: string; title: string; status: "pending" | "in_progress" | "completed" }>;
  };
  contact: { email: string; phone: string };
};

type ProposalPageProps = {
  token: string;
};

const apiBaseUrl = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const formatCurrency = (value: number | null) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR" }).format(value);

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("lt-LT") : "—";

const projectStageLabels: Record<string, string> = {
  awaiting_deposit: "Laukiama avanso",
  in_progress: "Darbai vykdomi",
  client_review: "Laukiama jūsų peržiūros",
  awaiting_final_payment: "Laukiama galutinio apmokėjimo",
  completed: "Projektas užbaigtas",
};

const paymentStatusLabels: Record<string, string> = {
  not_requested: "Dar neprašytas",
  requested: "Laukiama apmokėjimo",
  pending: "Tvirtinamas",
  paid: "Apmokėta",
  failed: "Nepavyko",
  refunded: "Grąžinta",
};

const paymentMethodLabels: Record<string, string> = {
  stripe: "Kortele per Stripe",
  bank_transfer: "Banko pavedimu",
};

const projectTaskStatusLabels = {
  pending: "Laukia",
  in_progress: "Vykdoma",
  completed: "Atlikta",
};

function ProposalPage({ token }: ProposalPageProps) {
  const [proposal, setProposal] = useState<PublicProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptedName, setAcceptedName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [billingName, setBillingName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [vatCode, setVatCode] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const endpoint = useMemo(
    () => (apiBaseUrl ? `${apiBaseUrl}/web-service-requests/proposal/${token}` : ""),
    [token]
  );

  useEffect(() => {
    document.title = "Kliento projektas | Stilloak Web";

    const load = async () => {
      if (!endpoint) {
        setError("Pasiūlymo sistema šiuo metu nepasiekiama.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const params = new URLSearchParams(window.location.search);
        const payment = params.get("payment");
        const sessionId = params.get("session_id");

        if ((payment === "success" || payment === "final-success") && sessionId) {
          const confirmPath = payment === "final-success" ? "final-payment/confirm" : "deposit/confirm";
          const confirmResponse = await fetch(`${endpoint}/${confirmPath}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });

          if (confirmResponse.ok) {
            const confirmed = (await confirmResponse.json()) as PublicProposal;
            setProposal(confirmed);
            setAcceptedName(confirmed.proposal.acceptedName || confirmed.customer.name || "");
            setBillingName(confirmed.customer.billingName || confirmed.customer.company || confirmed.customer.name || "");
            setCompanyCode(confirmed.customer.companyCode || "");
            setVatCode(confirmed.customer.vatCode || "");
            setBillingAddress(confirmed.customer.billingAddress || "");
            setPaymentMessage(payment === "final-success"
              ? (confirmed.finalPayment.status === "paid" ? "Galutinis mokėjimas sėkmingai gautas. Ačiū!" : "Stripe mokėjimas dar tvirtinamas.")
              : (confirmed.deposit.status === "paid" ? "Avansas sėkmingai gautas. Susisieksime dėl projekto starto." : "Stripe mokėjimas dar tvirtinamas."));
            return;
          }
        }

        if (payment === "cancel" || payment === "final-cancel") {
          setPaymentMessage("Apmokėjimas atšauktas. Galite pabandyti dar kartą.");
        }

        const response = await fetch(endpoint);
        const data = (await response.json().catch(() => ({}))) as PublicProposal & { message?: string };
        if (!response.ok) throw new Error(data.message || "Pasiūlymo nepavyko užkrauti.");

        setProposal(data);
        setAcceptedName(data.proposal.acceptedName || data.customer.name || "");
        setBillingName(data.customer.billingName || data.customer.company || data.customer.name || "");
        setCompanyCode(data.customer.companyCode || "");
        setVatCode(data.customer.vatCode || "");
        setBillingAddress(data.customer.billingAddress || "");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Pasiūlymo nepavyko užkrauti.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [endpoint]);

  const acceptProposal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!endpoint || !proposal) return;

    try {
      setAccepting(true);
      setError("");
      const response = await fetch(`${endpoint}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptedName: acceptedName.trim(),
          acceptedTerms,
          billingName: billingName.trim(),
          companyCode: companyCode.trim(),
          vatCode: vatCode.trim(),
          billingAddress: billingAddress.trim(),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as PublicProposal & { message?: string };
      if (!response.ok) throw new Error(data.message || "Pasiūlymo patvirtinti nepavyko.");
      setProposal(data);
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : "Pasiūlymo patvirtinti nepavyko.");
    } finally {
      setAccepting(false);
    }
  };

  const startDepositPayment = async () => {
    if (!endpoint || !proposal) return;

    try {
      setPaying(true);
      setError("");
      const response = await fetch(`${endpoint}/deposit`, { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        alreadyPaid?: boolean;
        proposal?: PublicProposal;
        message?: string;
      };
      if (!response.ok) throw new Error(data.message || "Nepavyko atidaryti avanso apmokėjimo.");
      if (data.alreadyPaid && data.proposal) {
        setProposal(data.proposal);
        setPaymentMessage("Avansas jau apmokėtas.");
        return;
      }
      if (!data.url) throw new Error("Stripe apmokėjimo nuoroda negauta.");
      window.location.assign(data.url);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Nepavyko atidaryti apmokėjimo.");
    } finally {
      setPaying(false);
    }
  };

  const startFinalPayment = async () => {
    if (!endpoint || !proposal) return;
    try {
      setPaying(true);
      setError("");
      const response = await fetch(`${endpoint}/final-payment`, { method: "POST" });
      const data = await response.json().catch(() => ({})) as { url?: string; alreadyPaid?: boolean; proposal?: PublicProposal; message?: string };
      if (!response.ok) throw new Error(data.message || "Nepavyko atidaryti galutinio apmokėjimo.");
      if (data.alreadyPaid && data.proposal) { setProposal(data.proposal); setPaymentMessage("Projektas jau apmokėtas pilnai."); return; }
      if (!data.url) throw new Error("Stripe apmokėjimo nuoroda negauta.");
      window.location.assign(data.url);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Nepavyko atidaryti apmokėjimo.");
    } finally { setPaying(false); }
  };

  if (loading) {
    return (
      <main className="proposal-shell proposal-centered">
        <Loader2 className="proposal-spinner" size={32} aria-hidden="true" />
        <p>Kraunamas pasiūlymas...</p>
      </main>
    );
  }

  if (error && !proposal) {
    return (
      <main className="proposal-shell proposal-centered">
        <div className="proposal-card proposal-error-card">
          <h1>Pasiūlymo atidaryti nepavyko</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!proposal) return null;

  const isExpired = proposal.proposal.status === "expired";
  const isAccepted = proposal.proposal.status === "accepted";
  const isPaid = proposal.deposit.status === "paid";
  const finalRequested = ["requested", "pending", "paid"].includes(proposal.finalPayment?.status);
  const finalPaid = proposal.finalPayment?.status === "paid";
  const projectTasks = proposal.project?.tasks || [];
  const completedTaskCount = projectTasks.filter((task) => task.status === "completed").length;
  const projectProgress = projectTasks.length ? Math.round((completedTaskCount / projectTasks.length) * 100) : 0;

  return (
    <main className="proposal-shell">
      <header className="proposal-header">
        <a href="/" className="proposal-wordmark" aria-label="Stilloak Web pradžia">
          <strong>Stilloak</strong><span>Web</span>
        </a>
        <span className="proposal-secure"><ShieldCheck size={16} /> Privati kliento nuoroda</span>
      </header>

      <section className="proposal-hero proposal-card">
        <p className="proposal-eyebrow">{isAccepted ? "Kliento projektas" : "Komercinis pasiūlymas"} · {proposal.requestNumber}</p>
        <h1>{proposal.package.name}</h1>
        <p className="proposal-lead">
          {isAccepted
            ? `${proposal.customer.company || proposal.customer.name}, čia rasite visą aktualią projekto informaciją vienoje vietoje.`
            : `${proposal.customer.company || proposal.customer.name}, paruošėme projekto apimtį, kainą ir starto sąlygas vienoje vietoje.`}
        </p>

        <div className="proposal-metrics">
          <div><span>Projekto kaina</span><strong>{formatCurrency(proposal.proposal.price)}</strong></div>
          <div><span>Pradinis avansas</span><strong>{proposal.deposit.percent}% · {formatCurrency(proposal.deposit.amount)}</strong></div>
          <div><span>{isAccepted ? "Projekto terminas" : "Galioja iki"}</span><strong>{formatDate(isAccepted ? proposal.project?.dueDate : proposal.proposal.expiresAt)}</strong></div>
        </div>
      </section>

      {isAccepted ? (
        <section className="project-portal" aria-label="Projekto informacija">
          <div className="proposal-card project-status-card">
            <div className="proposal-section-title"><CheckCircle2 size={22} /><h2>Projekto būsena</h2></div>
            <div className="project-stage"><span className="project-stage-dot" />{projectStageLabels[proposal.project?.stage] || "Projektas vykdomas"}</div>
            <div className="project-meta-row"><CalendarDays size={18} /><span>Numatytas terminas</span><strong>{formatDate(proposal.project?.dueDate)}</strong></div>
            {proposal.project?.liveUrl ? <a className="proposal-secondary-button" href={proposal.project.liveUrl} target="_blank" rel="noreferrer"><ExternalLink size={18} /> Atidaryti svetainę</a> : null}
          </div>

          <div className="proposal-card project-section-wide">
            <div className="project-tasks-heading">
              <div className="proposal-section-title"><Clock3 size={22} /><h2>Darbų eiga</h2></div>
              {projectTasks.length ? <strong>{projectProgress}%</strong> : null}
            </div>
            {projectTasks.length ? <>
              <div className="project-progress" role="progressbar" aria-label="Atliktų projekto darbų progresas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={projectProgress}>
                <span style={{ width: `${projectProgress}%` }} />
              </div>
              <p className="project-progress-copy">Atlikta {completedTaskCount} iš {projectTasks.length} darbų</p>
              <div className="project-task-list">
                {projectTasks.map((task, index) => (
                  <article className={`project-task is-${task.status}`} key={task.id || `${task.title}-${index}`}>
                    {task.status === "completed" ? <CheckCircle2 size={20} /> : task.status === "in_progress" ? <Clock3 size={20} /> : <Circle size={20} />}
                    <span>{task.title}</span>
                    <small>{projectTaskStatusLabels[task.status]}</small>
                  </article>
                ))}
              </div>
            </> : <p className="project-empty">Darbų planas bus parodytas čia, kai tik projektas bus pradėtas.</p>}
          </div>

          <div className="proposal-card project-section-wide">
            <div className="proposal-section-title"><CreditCard size={22} /><h2>Apmokėjimai</h2></div>
            <div className="project-payment-list">
              {[
                { key: "deposit", label: "Avansas", amount: proposal.deposit.amount, status: proposal.deposit.status, paidAt: proposal.deposit.paidAt, method: proposal.deposit.paymentMethod, invoice: proposal.deposit.invoice },
                { key: "final", label: "Likusi dalis", amount: proposal.finalPayment.amount, status: proposal.finalPayment.status, paidAt: proposal.finalPayment.paidAt, method: proposal.finalPayment.paymentMethod, invoice: proposal.finalPayment.invoice },
              ].map((payment) => (
                <article className="project-payment" key={payment.key}>
                  <div><span>{payment.label}</span><strong>{formatCurrency(payment.amount)}</strong></div>
                  <div><span className={`project-payment-status ${payment.status === "paid" ? "is-paid" : ""}`}>{paymentStatusLabels[payment.status] || payment.status}</span><small>{payment.paidAt ? `${formatDate(payment.paidAt)} · ${paymentMethodLabels[payment.method] || payment.method}` : ""}</small></div>
                  {payment.invoice ? <a className="project-download" href={`${endpoint}/${payment.invoice.downloadPath}`}><Download size={17} /> PDF sąskaita{payment.invoice.number ? ` · ${payment.invoice.number}` : ""}</a> : <span className="project-muted">Sąskaita atsiras gavus mokėjimą</span>}
                </article>
              ))}
            </div>
          </div>

          <div className="proposal-card">
            <div className="proposal-section-title"><FolderOpen size={22} /><h2>Perduoti failai</h2></div>
            {proposal.project?.files?.length ? <div className="project-file-list">{proposal.project.files.map((file, index) => file.url ? <a key={`${file.label}-${index}`} href={file.url} target="_blank" rel="noreferrer"><FolderOpen size={18} /><span>{file.label}</span><Download size={16} /></a> : <div key={`${file.label}-${index}`}><FileCheck2 size={18} /><span>{file.label}</span></div>)}</div> : <p className="project-empty">Failai bus pateikti čia, kai tik bus paruošti perdavimui.</p>}
          </div>

          <div className="proposal-card">
            <div className="proposal-section-title"><Mail size={22} /><h2>Kontaktas</h2></div>
            <p className="project-empty">Turite klausimų ar norite pateikti pastabą? Susisiekite tiesiogiai.</p>
            <div className="project-contact-list"><a href={`mailto:${proposal.contact?.email}`}><Mail size={18} />{proposal.contact?.email}</a><a href={`tel:${proposal.contact?.phone?.replace(/\s/g, "")}`}><Phone size={18} />{proposal.contact?.phone}</a></div>
          </div>
        </section>
      ) : null}

      <section className="proposal-grid">
        <div className="proposal-card">
          <div className="proposal-section-title"><FileCheck2 size={20} /><h2>Projekto santrauka</h2></div>
          <p className="proposal-copy">{proposal.proposal.summary}</p>
        </div>
        <div className="proposal-card">
          <h2>Darbų apimtis</h2>
          <p className="proposal-copy proposal-preline">{proposal.proposal.scope}</p>
        </div>
      </section>

      <section className="proposal-card">
        <h2>Sąlygos</h2>
        <p className="proposal-copy proposal-preline">{proposal.proposal.terms}</p>
        <p className="proposal-version">Sąlygų versija: {proposal.proposal.termsVersion}</p>
      </section>

      {paymentMessage ? <div className={`proposal-notice ${isPaid ? "proposal-success" : ""}`}>{paymentMessage}</div> : null}
      {error ? <div className="proposal-notice proposal-error">{error}</div> : null}

      {isExpired ? (
        <section className="proposal-card proposal-action-card">
          <h2>Pasiūlymo galiojimas baigėsi</h2>
          <p>Susisiekite su Stilloak Web ir paruošime atnaujintą pasiūlymą.</p>
          <a className="proposal-secondary-button" href="mailto:hello@stilloak-studio.com">Susisiekti</a>
        </section>
      ) : isAccepted ? (
        <section className="proposal-card proposal-action-card">
          <div className="proposal-status-icon"><CheckCircle2 size={28} /></div>
          <h2>Pasiūlymas patvirtintas</h2>
          <p>
            Patvirtino {proposal.proposal.acceptedName || proposal.customer.name}
            {proposal.proposal.acceptedAt ? ` · ${new Date(proposal.proposal.acceptedAt).toLocaleString("lt-LT")}` : ""}.
          </p>

          {isPaid ? (
            <>
              <div className="proposal-paid-box"><CheckCircle2 size={22} /><div><strong>Avansas apmokėtas</strong><span>{formatCurrency(proposal.deposit.amount)}</span></div></div>
              {finalRequested ? (finalPaid ?
                <div className="proposal-paid-box"><CheckCircle2 size={22} /><div><strong>Projektas apmokėtas pilnai</strong><span>{formatCurrency(proposal.finalPayment.amount)}</span></div></div>
                : <button className="proposal-primary-button" type="button" disabled={paying} onClick={startFinalPayment}>{paying ? <Loader2 className="proposal-spinner" size={19} /> : <CreditCard size={19} />}{paying ? "Atidaromas Stripe..." : `Apmokėti likutį · ${formatCurrency(proposal.finalPayment.amount)}`}</button>) : null}
            </>
          ) : (
            <button className="proposal-primary-button" type="button" disabled={paying} onClick={startDepositPayment}>
              {paying ? <Loader2 className="proposal-spinner" size={19} /> : <CreditCard size={19} />}
              {paying
                ? "Atidaromas Stripe..."
                : `Apmokėti ${proposal.deposit.percent}% avansą · ${formatCurrency(proposal.deposit.amount)}`}
            </button>
          )}
        </section>
      ) : (
        <form className="proposal-card proposal-action-card" onSubmit={acceptProposal}>
          <h2>Patvirtinti pasiūlymą</h2>
          <p>Patvirtinimas užfiksuoja, kad sutinkate su aukščiau pateikta projekto apimtimi, kaina ir sąlygomis.</p>
          <label className="proposal-label">
            Patvirtinančio asmens vardas ir pavardė
            <input value={acceptedName} onChange={(event) => setAcceptedName(event.target.value)} minLength={2} required />
          </label>
          <label className="proposal-label">
            Sąskaitos gavėjas / įmonės pavadinimas
            <input value={billingName} onChange={(event) => setBillingName(event.target.value)} minLength={2} required />
          </label>
          <div className="proposal-grid">
            <label className="proposal-label">
              Įmonės kodas (jei taikoma)
              <input value={companyCode} onChange={(event) => setCompanyCode(event.target.value)} />
            </label>
            <label className="proposal-label">
              PVM kodas (jei taikoma)
              <input value={vatCode} onChange={(event) => setVatCode(event.target.value)} />
            </label>
          </div>
          <label className="proposal-label">
            Sąskaitos adresas
            <input value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} minLength={5} required />
          </label>
          <div className="proposal-notice">
            Patvirtinus bus atsiųsta testinė sutarties PDF versija. Ji negalioja ir nėra teisinė sutartis.
          </div>
          <label className="proposal-checkbox">
            <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required />
            <span>Sutinku su šio pasiūlymo apimtimi, kaina, sąlygomis ir nurodyta avanso suma. Susipažinau su <a href="https://stilloak-studio.com/web-services-terms" target="_blank" rel="noreferrer">paslaugų sąlygomis</a> ir <a href="https://stilloak-studio.com/web-services-privacy" target="_blank" rel="noreferrer">privatumo informacija</a>.</span>
          </label>
          <button className="proposal-primary-button" type="submit" disabled={accepting || !acceptedTerms || acceptedName.trim().length < 2 || billingName.trim().length < 2 || billingAddress.trim().length < 5}>
            {accepting ? <Loader2 className="proposal-spinner" size={19} /> : <FileCheck2 size={19} />}
            {accepting ? "Patvirtinama..." : "Patvirtinti pasiūlymą"}
          </button>
        </form>
      )}

      <footer className="proposal-footer">
        <span>Stilloak Web</span>
        <a href="mailto:hello@stilloak-studio.com">hello@stilloak-studio.com</a>
      </footer>
    </main>
  );
}

export default ProposalPage;
