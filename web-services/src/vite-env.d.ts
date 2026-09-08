/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEB_LEAD_ENDPOINT?: string;
  readonly VITE_WEB_CONTACT_EMAIL?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_GOOGLE_ADS_ID?: string;
  readonly VITE_GOOGLE_ADS_LEAD_LABEL?: string;
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_GOOGLE_SITE_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
