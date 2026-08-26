/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEB_LEAD_ENDPOINT?: string;
  readonly VITE_WEB_CONTACT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
