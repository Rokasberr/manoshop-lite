const ProductFilters = ({ filters, categories, onChange, onSubmit, onReset }) => (
  <form className="panel grid gap-4 p-5 lg:grid-cols-[2fr_1fr_1fr_1fr_auto_auto]" onSubmit={onSubmit}>
    <div>
      <label className="mb-2 block text-sm font-semibold">Ieškoti produkte</label>
      <input
        className="input-field"
        placeholder="Pavadinimas, paskirtis arba kategorija"
        value={filters.search}
        onChange={(event) => onChange("search", event.target.value)}
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold">Kategorija</label>
      <select
        className="select-field"
        value={filters.category}
        onChange={(event) => onChange("category", event.target.value)}
      >
        <option value="all">Visos kategorijos</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold">Rikiavimas</label>
      <select
        className="select-field"
        value={filters.sort}
        onChange={(event) => onChange("sort", event.target.value)}
      >
        <option value="latest">Naujausi</option>
        <option value="price-asc">Kaina: nuo mažiausios</option>
        <option value="price-desc">Kaina: nuo didžiausios</option>
        <option value="name">Pavadinimas</option>
      </select>
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold">Tipas</label>
      <select
        className="select-field"
        value={filters.productType}
        onChange={(event) => onChange("productType", event.target.value)}
      >
        <option value="all">Visi produktai</option>
        <option value="physical">Fiziniai produktai</option>
        <option value="digital">Skaitmeniniai resursai</option>
      </select>
    </div>

    <button type="submit" className="button-primary self-end">
      Rodyti
    </button>

    <button type="button" onClick={onReset} className="button-secondary self-end">
      Išvalyti
    </button>
  </form>
);

export default ProductFilters;
