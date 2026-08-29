import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MailCheck, Send } from "lucide-react";

import AdminPageHeader from "../../components/admin-dashboard/AdminPageHeader";
import adminEmailService from "../../services/adminEmailService";
import adminOperationsService from "../../services/adminOperationsService";

const templates = [
  ["web_project", "Web projekto laiškas"],
  ["email_verification", "El. pašto patvirtinimas"],
  ["password_reset", "Slaptažodžio atkūrimas"],
  ["subscription_paid", "Prenumeratos mokėjimas gautas"],
  ["subscription_failed", "Prenumeratos mokėjimas nepavyko"],
  ["subscription_cancel", "Prenumeratos atšaukimas"],
  ["digital_product", "Skaitmeninis produktas paruoštas"],
];

const EmailTestingPage = () => {
  const [to, setTo] = useState("");
  const [template, setTemplate] = useState("web_project");
  const [sending, setSending] = useState(false);
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    adminOperationsService.getOperations().then((data) => setDeliveries(data.emailDeliveries || [])).catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (sending) return;
    try {
      setSending(true);
      await adminEmailService.sendTest({ to: to.trim(), template });
      toast.success("Testinis laiškas išsiųstas. Patikrinkite Gmail ir šlamšto aplanką.");
      const data = await adminOperationsService.getOperations();
      setDeliveries(data.emailDeliveries || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Testinio laiško išsiųsti nepavyko.");
    } finally { setSending(false); }
  };

  return <div className="space-y-8 font-admin">
    <AdminPageHeader eyebrow="El. laiškų kokybė" title="Testinis laiškas" description="Pasirinkite realų laiško tipą ir išsiųskite jį į savo adresą patikrai telefone arba kompiuteryje." />
    <form onSubmit={submit} className="dashboard-panel max-w-3xl p-6 sm:p-8">
      <div className="flex items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><MailCheck size={22} /></div><div><h2 className="text-xl font-semibold text-slate-950">Siuntimo patikra</h2><p className="mt-1 text-sm text-slate-500">Laiškas siunčiamas per tą patį transportą kaip produkciniai pranešimai.</p></div></div>
      <label className="mt-6 block text-sm font-medium text-slate-700">Laiško tipas<select className="select-field mt-2 w-full" value={template} onChange={(event) => setTemplate(event.target.value)}>{templates.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <label className="mt-5 block text-sm font-medium text-slate-700">Gavėjo el. paštas<input className="input-field mt-2 w-full" type="email" autoComplete="email" required value={to} onChange={(event) => setTo(event.target.value)} placeholder="rokas@stilloak-studio.com" /></label>
      <button type="submit" className="dashboard-button-primary mt-6 w-full justify-center" disabled={sending || !to.trim()}><Send size={17} />{sending ? "Siunčiama..." : "Išsiųsti testinį laišką"}</button>
    </form>
    <section className="dashboard-panel p-6 sm:p-8"><h2 className="text-xl font-semibold text-slate-950">Laiškų pristatymo būsena</h2><p className="mt-2 text-sm text-slate-500">Rodomi paskutiniai 50 registruotų transakcinių laiškų. „Pristatytas“, „grįžo“ ir „šlamštas“ atsiras prijungus tiekėjo webhook.</p>{deliveries.length ? <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400"><th className="px-3 py-3">Tipas</th><th className="px-3 py-3">Siuntimas</th><th className="px-3 py-3">Pristatymas</th><th className="px-3 py-3">Atnaujinta</th></tr></thead><tbody>{deliveries.map((delivery) => <tr key={delivery._id} className="border-b border-slate-100"><td className="px-3 py-3 font-medium text-slate-800">{delivery.type}</td><td className="px-3 py-3 text-slate-600">{delivery.status === "sent" ? "Išsiųstas" : delivery.status === "failed" ? "Nepavyko" : "Siunčiamas"}</td><td className="px-3 py-3 text-slate-600">{{ queued: "Laukiama", sent: "Išsiųstas", delivered: "Pristatytas", bounced: "Grįžo", complained: "Pažymėtas kaip šlamštas" }[delivery.deliveryStatus] || "Laukiama"}</td><td className="px-3 py-3 text-slate-500">{new Date(delivery.deliveryStatusAt || delivery.updatedAt).toLocaleString("lt-LT")}</td></tr>)}</tbody></table></div> : <p className="mt-5 text-sm text-slate-500">Registruotų laiškų dar nėra.</p>}</section>
  </div>;
};

export default EmailTestingPage;
