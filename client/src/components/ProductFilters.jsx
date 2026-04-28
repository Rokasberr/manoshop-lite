const ProductFilters = ({ filters, categories, onChange, onSubmit, onReset }) => (
  <form className="panel grid gap-4 p-5 lg:grid-cols-[2fr_1fr_1fr_1fr_auto_auto]" onSubmit={onSubmit}>
    <div>
      <label className="mb-2 block text-sm font-semibold">Search the collection</label>
      <input
        className="input-field"
        placeholder="Search by piece name or mood"
        value={filters.search}
        onChange={(event) => onChange("search", event.target.value)}
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold">Category</label>
      <select
        className="select-field"
        value={filters.category}
        onChange={(event) => onChange("category", event.target.value)}
      >
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold">Sort</label>
      <select
        className="select-field"
        value={filters.sort}
        onChange={(event) => onChange("sort", event.target.value)}
      >
        <option value="latest">Newest arrivals</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="name">Name</option>
      </select>
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold">Product type</label>
      <select
        className="select-field"
        value={filters.productType}
        onChange={(event) => onChange("productType", event.target.value)}
      >
        <option value="all">All products</option>
        <option value="physical">Physical</option>
        <option value="digital">Digital products</option>
      </select>
    </div>

    <button type="submit" className="button-primary self-end">
      Refine
    </button>

    <button type="button" onClick={onReset} className="button-secondary self-end">
      Reset
    </button>
  </form>
);

export default ProductFilters;
