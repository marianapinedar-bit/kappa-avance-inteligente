# KAPPA — publicar en Cloudflare Pages

Estructura de archivos (así debe quedar tu repo):

```
tu-repo/
├── index.html
└── functions/
    └── analyze.js
```

## Pasos

1. **Crea un repositorio en GitHub** y sube estos dos archivos manteniendo
   exactamente esta estructura de carpetas (`index.html` en la raíz,
   `analyze.js` dentro de una carpeta `functions/`).

2. **Consigue tu API key** de Anthropic en
   https://console.anthropic.com/settings/keys (si no tienes una).

3. Ve a https://dash.cloudflare.com → menú lateral **Workers & Pages** →
   **Create application** → pestaña **Pages** → **Connect to Git**.

4. Autoriza el acceso a GitHub y selecciona el repositorio que creaste.

5. En la configuración de build:
   - **Framework preset**: None
   - **Build command**: (déjalo vacío)
   - **Build output directory**: `/` (la raíz)

   No necesitas build porque es HTML puro + una función; Cloudflare detecta
   automáticamente la carpeta `functions/`.

6. Antes de desplegar (o después, en **Settings → Environment variables**),
   agrega DOS variables, ambas marcadas como **Secret**:
   - `ANTHROPIC_API_KEY` → tu API key de Anthropic.
   - `APP_PASSWORD` → la contraseña que quieras usar para entrar a la app
     (invéntala tú, ej: algo que solo tú conozcas). Esta es la que pedirá
     la pantalla de login antes de dejar usar la app.

   Si las agregas después del primer deploy, tendrás que volver a desplegar
   (**Deployments → Retry deployment**) para que las funciones las vean.

7. Haz clic en **Save and Deploy**. En 1–2 minutos tendrás una URL como:
   `https://tu-proyecto.pages.dev`

8. Abre esa URL: verás primero una pantalla de login. Ingresa la contraseña
   que pusiste en `APP_PASSWORD` para entrar. Una vez dentro, la app completa
   funciona, incluyendo "Analizar con IA", porque el HTML y las funciones
   `/analyze` y `/login` viven en el mismo dominio (sin configurar CORS ni
   nada adicional). La sesión dura mientras la pestaña esté abierta; puedes
   cerrar sesión con el botón "Cerrar sesión" al pie del menú lateral.

## Sobre la contraseña

- Es una protección simple para pruebas, no un sistema de autenticación
  robusto (no hay usuarios, ni recuperación de contraseña, ni cifrado
  adicional más allá de HTTPS). Sirve para que solo quien tú autorices
  pueda usar la app y consumir tu API key.
- El backend (`/analyze`) también exige la contraseña de forma independiente
  a la pantalla de login, así que aunque alguien descubra la URL de la
  función, no puede usarla sin conocer `APP_PASSWORD`.

## Actualizaciones futuras

Cada `git push` a tu repositorio despliega una nueva versión automáticamente.

## Costos (plan gratuito)

- Cloudflare Pages: sitios y despliegues ilimitados, gratis.
- Pages Functions: 100,000 peticiones/día gratis.
- Anthropic API: se cobra por uso de tokens. Revisa precios en
  https://www.anthropic.com/pricing.
