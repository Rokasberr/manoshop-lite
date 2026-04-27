const SectionTitle = ({ eyebrow, title, subtitle, align = "left" }) => (
  <div className={align === "center" ? "text-center" : ""}>
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
    {subtitle && <p className="mt-3 max-w-2xl text-base text-muted">{subtitle}</p>}
  </div>
);

export default SectionTitle;

