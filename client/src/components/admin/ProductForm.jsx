import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  productType: "physical",
  stock: "",
  featured: false,
  allowedForResale: false,
  commissionRate: "",
  isActive: true,
  imagesText: "",
  digitalStoragePath: "",
  digitalFileName: "",
  digitalDownloadLabel: "",
  digitalMimeType: "application/pdf",
};

const mapProductToForm = (product) =>
  product
    ? {
        name: product.name || "",
        description: product.description || "",
        price: product.price ?? "",
        category: product.category || "",
        productType: product.productType || "physical",
        stock: product.stock ?? "",
        featured: Boolean(product.featured),
        allowedForResale: Boolean(product.allowedForResale),
        commissionRate: product.commissionRate ?? "",
        isActive: product.isActive !== false,
        imagesText: Array.isArray(product.images) ? product.images.join("\n") : "",
        digitalStoragePath: product.digitalAsset?.storagePath || "",
        digitalFileName: product.digitalAsset?.fileName || "",
        digitalDownloadLabel: product.digitalAsset?.downloadLabel || "",
        digitalMimeType: product.digitalAsset?.mimeType || "application/pdf",
      }
    : emptyForm;

const ProductForm = ({
  initialProduct,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(mapProductToForm(initialProduct));
    setError("");
  }, [initialProduct]);

  const handleChange = (field, value) => {
    setFormData((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.category.trim() ||
      Number(formData.price) <= 0
    ) {
      setError("Užpildyk pavadinimą, aprašymą, kategoriją ir teisingą kainą.");
      return;
    }

    if (formData.productType === "digital" && !formData.digitalStoragePath.trim()) {
      setError("Skaitmeniniam produktui nurodyk failo kelią serveryje.");
      return;
    }

    setError("");

    await onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category.trim(),
      productType: formData.productType,
      stock: formData.productType === "digital" ? 0 : Number(formData.stock) || 0,
      featured: formData.featured,
      allowedForResale: formData.productType === "digital" ? formData.allowedForResale : false,
      commissionRate: Number(formData.commissionRate) || 0,
      isActive: formData.isActive,
      images: formData.imagesText,
      digitalAsset:
        formData.productType === "digital"
          ? {
              storagePath: formData.digitalStoragePath.trim(),
              fileName: formData.digitalFileName.trim(),
              downloadLabel: formData.digitalDownloadLabel.trim(),
              mimeType: formData.digitalMimeType.trim() || "application/pdf",
            }
          : undefined,
    });
  };

  return (
    <form className="dashboard-panel font-admin space-y-5 p-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="dashboard-eyebrow">{initialProduct ? "Produkto redagavimas" : "Naujas produktas"}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            {initialProduct ? "Atnaujinti produkto informaciją" : "Pridėti naują produktą"}
          </h2>
        </div>

        {initialProduct && (
          <button type="button" onClick={onCancel} className="dashboard-button-secondary">
            Atšaukti
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="mt-8 flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(event) => handleChange("isActive", event.target.checked)}
          />
          Produktas aktyvus
        </label>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold">Produkto pavadinimas</label>
          <input
            className="input-field"
            placeholder="Aiškus, klientui suprantamas produkto pavadinimas"
            value={formData.name}
            onChange={(event) => handleChange("name", event.target.value)}
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Naudok pardavimui paruoštą pavadinimą, ne vidinį ar demo tipo kodą.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Kategorija</label>
          <input
            className="input-field"
            value={formData.category}
            onChange={(event) => handleChange("category", event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Kaina</label>
          <input
            className="input-field"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(event) => handleChange("price", event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Produkto tipas</label>
          <select
            className="select-field"
            value={formData.productType}
            onChange={(event) => handleChange("productType", event.target.value)}
          >
            <option value="physical">Fizinis produktas</option>
            <option value="digital">Skaitmeninis resursas</option>
          </select>
        </div>

        {formData.productType === "physical" ? (
          <div>
            <label className="mb-2 block text-sm font-semibold">Likutis</label>
            <input
              className="input-field"
              type="number"
              min="0"
              step="1"
              value={formData.stock}
              onChange={(event) => handleChange("stock", event.target.value)}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Įkelk tikrą failą į
            <span className="mx-1 font-semibold">server/digital-downloads/</span>
            ir žemiau nurodyk santykinį kelią. Jei prieiga dar ruošiama, pažymėk ją kaip netrukus produkto aprašyme.
          </div>
        )}

        <label className="mt-8 flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(event) => handleChange("featured", event.target.checked)}
          />
          Rodyti kaip atrinktą produktą
        </label>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold">Paveikslėlių URL</label>
          <textarea
            className="textarea-field"
            placeholder="Vienas paveikslėlio URL eilutėje arba atskirtas kableliais"
            value={formData.imagesText}
            onChange={(event) => handleChange("imagesText", event.target.value)}
          />
        </div>

        {formData.productType === "digital" && (
          <>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold sm:col-span-2">
              <input
                type="checkbox"
                checked={formData.allowedForResale}
                onChange={(event) => handleChange("allowedForResale", event.target.checked)}
              />
              Leisti Verslas plano nariams prideti i savo store perpardavimui
            </label>

            <div>
              <label className="mb-2 block text-sm font-semibold">Commission rate (%)</label>
              <input
                className="input-field"
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.commissionRate}
                onChange={(event) => handleChange("commissionRate", event.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">Failo kelias</label>
              <input
                className="input-field"
                placeholder="guides/the-atelier-living-room-guide.pdf"
                value={formData.digitalStoragePath}
                onChange={(event) => handleChange("digitalStoragePath", event.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Atsisiuntimo failo pavadinimas</label>
              <input
                className="input-field"
                placeholder="the-atelier-living-room-guide.pdf"
                value={formData.digitalFileName}
                onChange={(event) => handleChange("digitalFileName", event.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Atsisiuntimo mygtuko tekstas</label>
              <input
                className="input-field"
                placeholder="Atsisiųsti gidą"
                value={formData.digitalDownloadLabel}
                onChange={(event) => handleChange("digitalDownloadLabel", event.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">MIME tipas</label>
              <input
                className="input-field"
                placeholder="application/pdf"
                value={formData.digitalMimeType}
                onChange={(event) => handleChange("digitalMimeType", event.target.value)}
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold">Aprašymas</label>
          <textarea
            className="textarea-field"
            placeholder="Paaiškink: kas tai, kam skirta, ką klientas gauna ir kodėl tai naudinga."
            value={formData.description}
            onChange={(event) => handleChange("description", event.target.value)}
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Venk nepatvirtintų pažadų apie momentinį atsisiuntimą. Skaitmeninei prieigai naudok aiškią formuluotę:
            pasiekiama po įsigijimo, jei taikoma.
          </p>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="dashboard-button-primary w-full justify-center">
        {isSubmitting ? "Saugoma..." : initialProduct ? "Atnaujinti produktą" : "Sukurti produktą"}
      </button>
    </form>
  );
};

export default ProductForm;
