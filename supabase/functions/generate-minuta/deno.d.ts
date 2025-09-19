// Declaraciones de tipos para Deno en Edge Functions
declare namespace Deno {
  interface Env {
    get(key: string): string | undefined
  }

  const env: Env

  function serve(handler: (req: Request) => Promise<Response> | Response): void
}

declare module "https://esm.sh/html-docx-js@0.6.0" {
  export function HTMLtoDOCX(html: string, header?: any, options?: any): ArrayBuffer | Uint8Array
}