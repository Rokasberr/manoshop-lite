import { Download, Eye, FileSpreadsheet, FileText, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import AdminPageHeader from "../../components/admin-dashboard/AdminPageHeader";
import adminDigitalProductService from "../../services/adminDigitalProductService";

const StatusBadge = ({ isReady }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
      isReady ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
    }`}
  >
    {isReady ? "Ready" : "Missing"}
  </span>
);

const FileActionButton = ({ children, icon: Icon, disabled, onClick, variant = "secondary" }) => {
  const className =
    variant === "primary"
      ? "dashboard-button-primary justify-center disabled:cursor-not-allowed disabled:opacity-50"
      : "dashboard-button-secondary justify-center disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      <Icon size={16} />
      <span>{children}</span>
    </button>
  );
};

const MissingFile = () => (
  <span className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400">
    Failas nerastas
  </span>
);

const AdminDigitalProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [previewLoadingId, setPreviewLoadingId] = useState("");
  const [downloadLoadingKey, setDownloadLoadingKey] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      setProducts(await adminDigitalProductService.listProducts());
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Nepavyko įkelti skaitmeninių produktų failų sąrašo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(
    () => () => {
      if (preview?.url) {
        window.URL.revokeObjectURL(preview.url);
      }
    },
    [preview?.url]
  );

  const handlePreviewPdf = async (product) => {
    try {
      setPreviewLoadingId(product.productId);
      const url = await adminDigitalProductService.createPdfPreviewUrl(product.productId);

      if (preview?.url) {
        window.URL.revokeObjectURL(preview.url);
      }

      setPreview({
        title: product.title,
        fileName: product.pdfFileName,
        url,
      });
    } catch (previewError) {
      toast.error(previewError.response?.data?.message || "Nepavyko atidaryti PDF peržiūros.");
    } finally {
      setPreviewLoadingId("");
    }
  };

  const handleDownload = async (product, format) => {
    const fileName = format === "pdf" ? product.pdfFileName : product.excelFileName;

    try {
      setDownloadLoadingKey(`${product.productId}:${format}`);
      await adminDigitalProductService.downloadFile(product.productId, format, fileName);
    } catch (downloadError) {
      toast.error(downloadError.response?.data?.message || "Nepavyko atsisiųsti failo.");
    } finally {
      setDownloadLoadingKey("");
    }
  };

  const closePreview = () => {
    if (preview?.url) {
      window.URL.revokeObjectURL(preview.url);
    }

    setPreview(null);
  };

  return (
    <div className="space-y-8 font-admin">
      <AdminPageHeader
        eyebrow="Skaitmeniniai produktai"
        title="Skaitmeninių produktų failai"
        description="Peržiūrėkite PDF gidus, Excel modelius ir patikrinkite, ar visi produktų failai paruošti atsisiuntimui."
      />

      <section className="dashboard-panel p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="dashboard-eyebrow">Failų būsena</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Produktų biblioteka</h2>
          </div>
          <button type="button" onClick={loadProducts} className="dashboard-button-secondary justify-center">
            Atnaujinti sąrašą
          </button>
        </div>

        {loading ? (
          <div className="mt-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : !products.length ? (
          <div className="mt-8">
            <EmptyState
              title="Produktų failų nėra"
              description="Kai skaitmeniniai produktai bus sukurti, čia matysite PDF ir Excel failų būseną."
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {products.map((product) => (
              <article
                key={product.productId}
                className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5"
              >
                <div className="grid gap-5 xl:grid-cols-[1fr_320px] xl:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                            {product.category}
                          </span>
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                            {product.priceLabel}
                          </span>
                          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                            {product.isActive ? "Aktyvus" : "Neaktyvus"}
                          </span>
                        </div>
                        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{product.title}</h3>
                        <p className="mt-2 break-all text-sm text-slate-500">{product.productId}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <p className="text-xs font-bold uppercase text-slate-400">Versija</p>
                          <p className="mt-1 font-semibold text-slate-900">{product.version}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <p className="text-xs font-bold uppercase text-slate-400">Atnaujinta</p>
                          <p className="mt-1 font-semibold text-slate-900">{product.lastUpdated}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <FileText size={18} className="text-slate-500" />
                            <span className="font-semibold text-slate-900">PDF</span>
                          </div>
                          <StatusBadge isReady={product.hasPdf} />
                        </div>
                        <p className="mt-3 break-all text-sm text-slate-500">{product.pdfFileName || "Failas nerastas"}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet size={18} className="text-slate-500" />
                            <span className="font-semibold text-slate-900">Excel</span>
                          </div>
                          <StatusBadge isReady={product.hasExcel} />
                        </div>
                        <p className="mt-3 break-all text-sm text-slate-500">{product.excelFileName || "Failas nerastas"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {product.hasPdf ? (
                      <FileActionButton
                        icon={previewLoadingId === product.productId ? Loader2 : Eye}
                        onClick={() => handlePreviewPdf(product)}
                        disabled={previewLoadingId === product.productId}
                        variant="primary"
                      >
                        {previewLoadingId === product.productId ? "Atidaroma..." : "Peržiūrėti PDF"}
                      </FileActionButton>
                    ) : (
                      <MissingFile />
                    )}

                    {product.hasPdf ? (
                      <FileActionButton
                        icon={Download}
                        onClick={() => handleDownload(product, "pdf")}
                        disabled={downloadLoadingKey === `${product.productId}:pdf`}
                      >
                        {downloadLoadingKey === `${product.productId}:pdf` ? "Ruošiama..." : "Atsisiųsti PDF"}
                      </FileActionButton>
                    ) : (
                      <MissingFile />
                    )}

                    {product.hasExcel ? (
                      <FileActionButton
                        icon={Download}
                        onClick={() => handleDownload(product, "excel")}
                        disabled={downloadLoadingKey === `${product.productId}:excel`}
                      >
                        {downloadLoadingKey === `${product.productId}:excel` ? "Ruošiama..." : "Atsisiųsti Excel"}
                      </FileActionButton>
                    ) : (
                      <MissingFile />
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {preview ? (
        <div className="fixed inset-0 z-[80] flex bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
          <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">PDF peržiūra</p>
                <h2 className="mt-1 truncate text-xl font-semibold text-slate-950">{preview.title}</h2>
                <p className="mt-1 truncate text-sm text-slate-500">{preview.fileName}</p>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500"
                aria-label="Uždaryti PDF peržiūrą"
              >
                <X size={18} />
              </button>
            </div>
            <iframe title={`PDF peržiūra: ${preview.title}`} src={preview.url} className="min-h-0 flex-1 bg-slate-100" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminDigitalProductsPage;
