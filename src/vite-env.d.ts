/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_API_GOOGLE_MAPS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
