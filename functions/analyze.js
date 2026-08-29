// functions/analyze.js
// Cloudflare Pages Function — proxy seguro para KAPPA · Avance Inteligente.
// Un archivo dentro de /functions se sirve automáticamente como ruta:
// functions/analyze.js  →  https://tu-sitio.pages.dev/analyze
//
// Recibe el mismo body que la app arma (model, max_tokens, messages) y lo
// reenvía a Anthropic agregando la API key desde una variable de entorno
// del servidor (Settings → Environment variables en el dashboard de
// Cloudflare Pages). Nunca queda expuesta en el navegador del usuario.

export async function onRequestPost(context) {
  const { request, env } = context;

  // Protección: exige la misma contraseña de acceso a la app, verificada
  // aquí en el servidor. Evita que alguien llame a /analyze directamente
  // sin pasar por el login, aunque conozca la URL de este endpoint.
  const expectedPassword = env.APP_PASSWORD;
  const providedPassword = request.headers.get('X-App-Password') || '';
  if (!expectedPassword) {
    return jsonResponse({ error: 'APP_PASSWORD no está configurada en el servidor.' }, 500);
  }
  if (providedPassword !== expectedPassword) {
    return jsonResponse({ error: 'No autorizado.' }, 401);
  }

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: 'ANTHROPIC_API_KEY no está configurada en el servidor.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: 'JSON inválido en la petición.' }, 400);
  }

  // Fuerza el modelo desde el servidor (evita que el cliente lo cambie)
  body.model = 'claude-sonnet-5';
  if (!body.max_tokens) body.max_tokens = 700;

  let anthropicResponse;
  try {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    };
    // Algunas API keys quedan ligadas a un workspace y exigen este header.
    // Configura ANTHROPIC_WORKSPACE_ID como variable de entorno si tu key lo pide.
    if (env.ANTHROPIC_WORKSPACE_ID) {
      headers['anthropic-workspace-id'] = env.ANTHROPIC_WORKSPACE_ID;
    }
    anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    return jsonResponse({ error: 'No se pudo contactar a Anthropic.' }, 502);
  }

  const data = await anthropicResponse.text();
  return new Response(data, {
    status: anthropicResponse.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Cloudflare Pages exige responder algo también para otros métodos si se
// llega a llamar por error (opcional pero evita 405 confusos en pruebas).
export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
