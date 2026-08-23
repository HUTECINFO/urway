# UR WAY by HUTEC

Plataforma editorial-tecnológica de oportunidades de viaje para México.

## Desarrollo local

Requisitos: Node.js 20.9 o superior y npm.

```bash
npm install
touch .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

La aplicación funciona sin servicios externos en modo demo. El acceso editorial está disponible en `/login` con:

```text
admin@urway.mx
urway-demo
```

Define `DEMO_ADMIN_EMAIL` y `DEMO_ADMIN_PASSWORD` para cambiar estas credenciales locales.

## Supabase

Configura las variables de Supabase en `.env.local` y aplica la migration y el seed:

```bash
supabase db reset
```

Después de crear el usuario administrador en Supabase Auth, asigna el rol desde SQL:

```sql
update public.users set role = 'ADMIN' where email = 'tu-correo@dominio.com';
```

La aplicación cambia automáticamente del repositorio demo a Supabase cuando existen `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Las operaciones de tracking y cron requieren `SUPABASE_SERVICE_ROLE_KEY` en el servidor.

## Verificación

```bash
npm run lint
npm run typecheck
npm run build
```

## Integraciones

- `SERPAPI_KEY`: activa el adapter de SerpApi en discovery.
- `TRAVELPAYOUTS_API_TOKEN`: consulta precios y enlaces vigentes de Aviasales desde el servidor.
- `TRAVELPAYOUTS_MARKER`: Partner ID opcional para atribuir los enlaces de Aviasales a tu cuenta.
- `CRON_SECRET`: protege los endpoints `/api/cron/*` en producción.
- `NEXT_PUBLIC_POSTHOG_KEY`: habilita la estructura de eventos.
- `RESEND_API_KEY`: habilita el cliente transaccional preparado.
- Firebase Cloud Messaging queda desacoplado mediante la interfaz `PushProvider`.

El cron de descubrimiento usa Travelpayouts como proveedor principal cuando `TRAVELPAYOUTS_API_TOKEN` está configurado; los resultados incluyen únicamente tarifas marcadas para afiliados (`show_to_affiliates=true`).

Los cron jobs de Vercel están definidos en `vercel.json`.
