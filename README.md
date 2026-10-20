# Serenity — Frontend (Angular)

Frontend del proyecto Serenity (Ingeniería de Software, Universidad de Cundinamarca),
generado a partir del documento de requerimientos (RF1–RF13) y la configuración
tecnológica definida: Angular + TypeScript, consumiendo un Backend en Spring Boot
(Spring Security + JWT, Spring WebSocket/STOMP).

## Puesta en marcha

```bash
npm install
npm start
```

La app queda en `http://localhost:4200`. Ajusta `src/environments/environment.ts`
con la URL real del Backend (`apiUrl`, `wsUrl`) cuando esté disponible.

## Ejecución en producción con Docker

La imagen escucha en el puerto `8080`. Define `API_URL` y `WS_URL` al iniciar el
contenedor; ambas variables son obligatorias:

```bash
docker build -t serenity-frontend:1.0.0 .
docker run --rm -p 8080:8080 \
  -e API_URL=https://api.example.com/api \
  -e WS_URL=wss://api.example.com/ws \
  -e GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}" \
  serenity-frontend:1.0.0
```

La configuración se genera en `/config.json` al arrancar el contenedor.
`API_URL` y `WS_URL` se solicitan desde el navegador, así que deben ser direcciones
accesibles desde el equipo del usuario, no nombres internos de servicios Docker.
Para el stack local, usa `http://localhost:8081/api` y `ws://localhost:8081/ws`, y
configura el backend para permitir el origen `http://localhost:8080` en CORS. En
producción usa el dominio público del backend y permite en CORS el origen público
del frontend; si el frontend usa HTTPS, configura también HTTPS y WSS para el backend.

## Inicio de sesión con Google

El frontend usa el botón oficial de Google Identity Services. Configura el mismo
Client ID de tipo Web en Google Cloud y en el backend mediante `GOOGLE_CLIENT_ID`.
El Client ID es público; no agregues un client secret al frontend. Autoriza como
orígenes JavaScript `http://localhost:4200` para desarrollo y el origen público
del frontend para producción.

Para desarrollo, define `GOOGLE_CLIENT_ID` en un archivo `.env` local y ejecuta
`npm start`. El comando genera `src/assets/config.dev.json` antes de iniciar Angular;
ese archivo queda ignorado por Git. También puedes definir la variable en el entorno
del proceso. Si no está configurada, el inicio de sesión por correo y contraseña
sigue disponible y el botón de Google indica que no está listo.

Para Docker, define `GOOGLE_CLIENT_ID` en el entorno al arrancar el contenedor.
El entrypoint lo expone en `/config.json`; no hace falta reconstruir la imagen al
cambiar el Client ID. Si despliegas con Docker Compose en otro directorio, pasa
la variable al servicio frontend con `GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}`.
Este repositorio no contiene un `docker-compose.yml`.

## Qué incluye

- **Autenticación** (RF1, RF2): login y registro, JWT guardado en `localStorage`,
  interceptor que lo adjunta a cada petición, guard que protege las rutas privadas.
- **Ejercicios terapéuticos**:
  - Respiración guiada por fases (RF4) — totalmente funcional, con animación.
  - Meditación temporizada (RF5) — selector de duración + cuenta regresiva.
  - Relajación muscular progresiva (RF6) — secuencia de 7 grupos musculares.
  - Diario emocional (RF7) — entradas guiadas o libres.
  - Registro de estado de ánimo (RF3) en el dashboard.
- **Gamificación**: experiencia/nivel/racha (RF8, RF9) mostrados en dashboard y navbar,
  jardín virtual (RF10), logros (RF11).
- **Estadísticas** del historial de sesiones.
- **Chat de apoyo en tiempo real** (RF12, RF13) vía STOMP sobre WebSocket, con
  reporte y finalización de conversación.

## Qué falta conectar del lado del Backend

Los servicios en `src/app/core/services` ya están escritos contra los endpoints
esperados (`/api/auth/login`, `/api/auth/registro`, `/api/sesiones`, `/api/animo`,
`/api/diario`, `/api/jardin`, `/api/logros`, `/api/estadisticas/resumen`,
`/api/chat/*`, y el canal WebSocket `/topic/conversacion/{id}` /
`/app/conversacion/{id}/enviar`). Ajusta las rutas si el equipo de Backend define
otras, y añade manejo de errores más específico (mensajes por código HTTP) cuando
el contrato de la API esté cerrado.

No se implementó aún: paginación del historial, edición de perfil, ni pantalla de
"olvidé mi contraseña" — no están en el alcance definido (sección 2.4 del documento).


## Actualizaciones de interfaz y arquitectura

- La paleta global de la interfaz se define en `src/styles.scss` y utiliza tonos azul pastel.
- Las rutas públicas `/ayuda` y `/terminos` contienen recursos de atención y condiciones de uso preliminares.
- La página de ayuda enlaza a los recursos oficiales de salud mental publicados por el Ministerio de Salud y Protección Social.
- Consulta [`docs/SOLID.md`](docs/SOLID.md) para conocer los principios SOLID ya aplicados, las mejoras parciales y los siguientes pasos de arquitectura.

Antes de producción, revisa la configuración de `src/environments/environment.prod.ts`, registra en el backend la aceptación de los términos si se requiere como evidencia y revisa jurídicamente los términos y la política de tratamiento de datos personales.
