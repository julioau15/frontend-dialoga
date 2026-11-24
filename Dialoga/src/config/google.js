// ============================================================
// config/google.js
// ID do cliente web do Google (login com Google).
// É um valor público (não é segredo). Para trocar, crie um .env
// na raiz do front com:  VITE_GOOGLE_CLIENT_ID=seu-id.apps.googleusercontent.com
// ============================================================
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  '710933688848-p6ptu9862r2trmq9il215o4vh2q9nbq4.apps.googleusercontent.com'
