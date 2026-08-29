// functions/login.js
// Verifica la contraseña de acceso a KAPPA · Avance Inteligente.
// La contraseña real se guarda como variable de entorno APP_PASSWORD en el
// dashboard de Cloudflare Pages (Settings → Environment variables), nunca
// en el código. Este endpoint solo confirma si coincide o no.

export async function onRequestPost(context) {
  const { request, env } = context;

  const expected = env.APP_PASSWORD;
  if (!expected) {
    return jsonResponse({ ok: false, error: 'APP_PASSWORD no está configurada en el servidor.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ ok: false, error: 'JSON inválido.' }, 400);
  }

  const provided = typeof body.password === 'string' ? body.password : '';
  const ok = provided.length > 0 && provided === expected;

  return jsonResponse({ ok }, ok ? 200 : 401);
}

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
