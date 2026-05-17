import AdminPageHeader from "../../components/admin-dashboard/AdminPageHeader";
import DigitalProductGeneratorPage from "../DigitalProductGeneratorPage";

const AdminDigitalProductGeneratorPage = () => (
  <div className="space-y-6 font-admin">
    <AdminPageHeader
      eyebrow="Admin product tool"
      title="Skaitmeninių produktų generatorius"
      description="Kurk ir įvertink skaitmeninių produktų idėjas administravimo erdvėje. Įrankis pasiekiamas tik administratoriams."
      secondaryAction={{ to: "/admin", label: "Grįžti į apžvalgą" }}
    />

    <section className="dashboard-panel overflow-hidden rounded-[28px] border border-slate-200 bg-white p-2 shadow-sm sm:p-3">
      <DigitalProductGeneratorPage />
    </section>
  </div>
);

export default AdminDigitalProductGeneratorPage;
