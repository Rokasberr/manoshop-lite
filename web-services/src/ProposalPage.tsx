import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  CreditCard,
  FileCheck2,
  Landmark,
  Loader2,
  ShieldCheck,
} from "lucide-react";

type PublicProposal = {
  requestNumber: string;
  customer: { name: string; company: string };
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
  };
};

type BankTransferResponse = {
  requestNumber: string;
  deposit: {
    percent: number;
    amount: number | null;
    status: string;
    paidAt: string | null;
  };
  bankTransfer: {
    beneficiary: string;
    iban: string;
    bic: string;
    bankName: string;
    currency: string;
    reference: string;
  };
  stripeEnabled: boolean;
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

function ProposalPage({ token }: ProposalPageProps) {
  const [proposal, setProposal] = useState<PublicProposal | null>(null);
  const [bankPayment, setBankPayment] = useState<BankTransferResponse | null>(null);
  const [bankPaymentError, setBankPaymentError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptedName, setAcceptedName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const endpoint = useMemo(
    () => (apiBaseUrl ? `${apiBaseUrl}/web-service-requests/proposal/${token}` : ""),
    [token]
  );

  useEffect(() => {
    document.title = "Projekto pasiūlymas | Stilloak Web";

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

        if (payment === "success" && sessionId) {
          const confirmResponse = await fetch(`${endpoint}/deposit/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });

          if (confirmResponse.ok) {
            const confirmed = (await confirmResponse.json()) as PublicProposal;
            setProposal(confirmed);
            setAcceptedName(confirmed.proposal.acceptedName || confirmed.customer.name || "");
            setPaymentMessage(
              confirmed.deposit.status === "paid"
                ? "Avansas sėkmingai gautas. Susisieksime dėl projekto starto."
                : "Stripe mokėjimas dar tvirtinamas."
            );
            return;
          }
        }

        if (payment === "cancel") {
          setPaymentMessage("Apmokėjimas atšauktas. Galite pasirinkti banko pavedimą.");
        }

        const response = await fetch(endpoint);
        const data = (await response.json().catch(() => ({}))) as PublicProposal & { message?: string };
        if (!response.ok) throw new Error(data.message || "Pasiūlymo nepavyko užkrauti.");

        setProposal(data);
        setAcceptedName(data.proposal.acceptedName || data.customer.name || "");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Pasiūlymo nepavyko užkrauti.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [endpoint]);

  useEffect(() => {
    if (!endpoint || proposal?.proposal.status !== "accepted" || proposal.deposit.status === "paid") return;

    let cancelled = false;
    const loadBankPayment = async () => {
      try {
        setBankPaymentError("");
        const response = await fetch(`${endpoint}/bank-transfer`);
        const data = (await response.json().catch(() => ({}))) as BankTransferResponse & {
          message?: string;
        };
        if (!response.ok) throw new Error(data.message || "Banko pavedimo duomenų nepavyko užkrauti.");
        if (!cancelled) setBankPayment(data);
      } catch (bankError) {
        if (!cancelled) {
          setBankPaymentError(
            bankError instanceof Error ? bankError.message : "Banko pavedimo duomenų nepavyko užkrauti."
          );
        }
      }
    };

    loadBankPayment();
    return () => {
      cancelled = true;
    };
  }, [endpoint, proposal?.deposit.status, proposal?.proposal.status]);

  const acceptProposal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!endpoint || !proposal) return;

    try {
      setAccepting(true);
      setError("");
      const response = await fetch(`${endpoint}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptedName: acceptedName.trim(), acceptedTerms }),
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

  const copyBankPayment = async () => {
    if (!bankPayment) return;
    const { bankTransfer } = bankPayment;
    const text = [
      `Suma: ${formatCurrency(bankPayment.deposit.amount)}`,
      `Gavėjas: ${bankTransfer.beneficiary}`,
      `IBAN: ${bankTransfer.iban}`,
      bankTransfer.bankName ? `Bankas: ${bankTransfer.bankName}` : "",
      bankTransfer.bic ? `BIC / SWIFT: ${bankTransfer.bic}` : "",
      `Mokėjimo paskirtis: ${bankTransfer.reference}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setPaymentMessage("Nepavyko automatiškai nukopijuoti. Nukopijuokite rekvizitus rankiniu būdu.");
    }
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

  return (
    <main className="proposal-shell">
      <header className="proposal-header">
        <a href="/" className="proposal-wordmark" aria-label="Stilloak Web pradžia">
          <strong>Stilloak</strong><span>Web</span>
        </a>
        <span className="proposal-secure"><ShieldCheck size={16} /> Saugi pasiūlymo nuoroda</span>
      </header>

      <section className="proposal-hero proposal-card">
        <p className="proposal-eyebrow">Komercinis pasiūlymas · {proposal.requestNumber}</p>
        <h1>{proposal.package.name}</h1>
        <p className="proposal-lead">
          {proposal.customer.company || proposal.customer.name}, paruošėme projekto apimtį, kainą ir starto sąlygas vienoje vietoje.
        </p>

        <div className="proposal-metrics">
          <div><span>Projekto kaina</span><strong>{formatCurrency(proposal.proposal.price)}</strong></div>
          <div><span>Pradinis avansas</span><strong>{proposal.deposit.percent}% · {formatCurrency(proposal.deposit.amount)}</strong></div>
          <div><span>Galioja iki</span><strong>{formatDate(proposal.proposal.expiresAt)}</strong></div>
        </div>
      </section>

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
            <div className="proposal-paid-box">
              <CheckCircle2 size={22} />
              <div><strong>Avansas apmokėtas</strong><span>{formatCurrency(proposal.deposit.amount)}</span></div>
            </div>
          ) : bankPayment ? (
            <div className="proposal-bank-box">
              <div className="proposal-bank-heading">
                <span className="proposal-bank-icon"><Landmark size={20} /></span>
                <div>
                  <strong>Apmokėti {bankPayment.deposit.percent}% avansą</strong>
                  <span>Avansas banko pavedimu · peržiūrėkite rekvizitus ir atlikite pavedimą savo banke.</span>
                </div>
              </div>

              <div className="proposal-bank-amount">
                <span>Mokėtina suma</span>
                <strong>{formatCurrency(bankPayment.deposit.amount)}</strong>
              </div>

              <dl className="proposal-bank-details">
                <div><dt>Gavėjas</dt><dd>{bankPayment.bankTransfer.beneficiary}</dd></div>
                <div><dt>IBAN</dt><dd>{bankPayment.bankTransfer.iban}</dd></div>
                {bankPayment.bankTransfer.bankName ? <div><dt>Bankas</dt><dd>{bankPayment.bankTransfer.bankName}</dd></div> : null}
                {bankPayment.bankTransfer.bic ? <div><dt>BIC / SWIFT</dt><dd>{bankPayment.bankTransfer.bic}</dd></div> : null}
                <div><dt>Mokėjimo paskirtis</dt><dd>{bankPayment.bankTransfer.reference}</dd></div>
              </dl>

              <button className="proposal-secondary-button proposal-copy-payment" type="button" onClick={copyBankPayment}>
                <Copy size={17} /> {copied ? "Nukopijuota" : "Nukopijuoti mokėjimo duomenis"}
              </button>
              <p className="proposal-bank-note">
                Gavę pavedimą jį patvirtinsime ir susisieksime dėl projekto starto.
              </p>

              {bankPayment.stripeEnabled ? (
                <button className="proposal-primary-button" type="button" disabled={paying} onClick={startDepositPayment}>
                  {paying ? <Loader2 className="proposal-spinner" size={19} /> : <CreditCard size={19} />}
                  {paying ? "Atidaromas Stripe..." : "Mokėti kortele per Stripe"}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="proposal-notice">
              {bankPaymentError || "Kraunami banko pavedimo duomenys..."}
            </div>
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
          <label className="proposal-checkbox">
            <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required />
            <span>Sutinku su šio pasiūlymo apimtimi, kaina, sąlygomis ir nurodyta avanso suma.</span>
          </label>
          <button className="proposal-primary-button" type="submit" disabled={accepting || !acceptedTerms || acceptedName.trim().length < 2}>
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
