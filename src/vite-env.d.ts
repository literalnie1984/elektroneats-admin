/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_JWT_SECRET_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
