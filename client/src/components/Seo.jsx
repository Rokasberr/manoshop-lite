import { useEffect } from "react";

const siteUrl = "https://www.stilloak-studio.com";
const defaultImage = `${siteUrl}/digital-products/previews/personal-budget-system-preview.png`;

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const upsertCanonical = (href) => {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
};

const upsertJsonLd = (schema) => {
  const scriptId = "stilloak-json-ld";
  let element = document.getElementById(scriptId);

  if (!element) {
    element = document.createElement("script");
    element.id = scriptId;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(schema);
};

const Seo = ({
  title = "Stilloak Studio | Digital tools for finance, savings, and productivity",
  description = "Premium Excel products, savings trackers, weekly planning systems, and memberships for clearer personal finance and business productivity.",
  path = "/",
  image = defaultImage,
  type = "website",
  robots = "index,follow",
  schema,
}) => {
  useEffect(() => {
    const canonicalUrl = `${siteUrl}${path}`;
    const fullTitle = title.includes("Stilloak Studio") ? title : `${title} | Stilloak Studio`;

    document.title = fullTitle;
    upsertCanonical(canonicalUrl);
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "Stilloak Studio" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });

    upsertJsonLd(
      schema || {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Stilloak Studio",
        url: siteUrl,
        description,
      }
    );
  }, [description, image, path, robots, schema, title, type]);

  return null;
};

export default Seo;
