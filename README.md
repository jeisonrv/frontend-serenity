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
