# Principios SOLID en Serenity

Este documento describe cómo se están aplicando los principios SOLID en el frontend Angular. El objetivo no es añadir capas innecesarias, sino separar responsabilidades y facilitar los cambios y las pruebas.

## S — Responsabilidad única

**Aplicado en esta rama.** Las operaciones HTTP de una conversación están en `ChatService`; la mensajería STOMP/WebSocket y el estado de conexión están en `ChatRealtimeService`. Así, el servicio HTTP no administra sockets y el servicio de tiempo real no es responsable de las solicitudes REST.

Los componentes de interfaz presentan información y responden a acciones del usuario; la comunicación con la API queda en servicios del dominio como `AnimoService`, `DiarioService`, `JardinService` y `GamificacionService`.

## O — Abierto/cerrado

**Aplicación parcial mediante la organización por funcionalidades.** Las páginas son componentes independientes y las funcionalidades protegidas se cargan mediante rutas lazy. Una nueva pantalla puede incorporarse como una funcionalidad nueva sin convertir un único componente central en responsable de toda la aplicación. Debe procurarse que añadir una variación de una funcionalidad no obligue a reescribir lógica estable.

## L — Sustitución de Liskov

El frontend actual utiliza poca herencia explícita, por lo que no se introduce una jerarquía artificial solamente para demostrar este principio. Si se agregan implementaciones intercambiables de una misma abstracción, cada implementación deberá respetar el contrato y el comportamiento que esperan sus consumidores.

## I — Segregación de interfaces

**Aplicación en los límites de los servicios.** Las responsabilidades se dividen por dominio y el chat distingue la API HTTP de la conexión en tiempo real. Esto evita que los consumidores deban depender de operaciones que pertenecen a otra responsabilidad. Todavía no se han creado interfaces TypeScript explícitas para cada servicio; se deben introducir cuando ayuden a intercambiar implementaciones o simplificar pruebas, no como capas decorativas.

## D — Inversión de dependencias

Angular proporciona inyección de dependencias para que los componentes reciban los servicios que necesitan. Además, `UsuarioService` obtiene la dirección base de la API desde `environment.apiUrl`, en lugar de definir una URL local fija.

**Mejora pendiente:** cuando se requiera sustituir servicios concretos en pruebas o cambiar implementaciones, se pueden crear contratos e `InjectionToken` para que los componentes dependan de abstracciones. No se añadieron tokens a todos los servicios porque la arquitectura actual no necesita esa complejidad de forma uniforme.

## Cómo comprobar los cambios

- Revisar `ChatService` y `ChatRealtimeService` para verificar la separación HTTP/WebSocket.
- Confirmar que los servicios consumen `environment.apiUrl` para construir sus URLs.
- Antes de integrar cambios, ejecutar `npm ci`, `npm run build` y probar el flujo de solicitar chat, conectar, enviar, finalizar y reportar.
