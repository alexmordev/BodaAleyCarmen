# Mission — A&C Wedding

> Sitio web de la boda de **Alejandro & Carmen** · **07.11.2026**

## Pitch

Una invitación web mobile-first que acompaña a los invitados desde el "guardad la
fecha" hasta el día del evento: cuenta la historia de la pareja, entrega toda la
logística, recoge la confirmación de asistencia (RSVP) y facilita la mesa de
regalos — todo con la estética íntima estilo "El Cadáver de la Novia" del diseño
original, sin sacrificar claridad ni velocidad.

## Usuarios

- **Invitados** (audiencia principal): familiares y amigos, muchos abriendo el
  sitio desde el móvil y con perfiles no técnicos. Necesitan responder rápido a
  *¿cuándo?*, *¿dónde?*, *¿cómo llego?*, *¿qué me pongo?*, *¿confirmo?* y
  *¿qué regalo?*.
- **Los novios** (administradores): Alejandro & Carmen. Necesitan ver quién
  confirmó, cuántos asisten y gestionar el contenido sin tocar código complejo.

## El problema

Las invitaciones tradicionales (papel, chats sueltos) dispersan la información y
hacen que confirmar asistencia y consultar detalles sea engorroso. Los novios
pierden visibilidad de quién viene. Este sitio centraliza **información,
confirmación, regalos y logística** — cada invitado accede por su **enlace
personal único** (ver *Acceso por invitación*).

## Objetivos (definidos con el cliente)

El sitio debe cubrir **las cuatro funciones**, no solo presentación:

1. **Informar** — historia de la pareja, fecha, cuenta regresiva y ambientación.
2. **Confirmar asistencia (RSVP)** — formulario que persiste respuestas y permite
   a los novios ver el conteo. *(Requiere backend propio — ver `tech-stack.md`.)*
3. **Mesa de regalos / cuenta** — enlaces a lista de regalos, transferencia o
   sobre digital.
4. **Logística** — cómo llegar (mapa), código de vestimenta, agenda del evento y
   hospedaje.

## Políticas del evento (definidas con el cliente)

- **Evento solo para adultos — sin infancias.** Por respeto a los propios niños y
  porque el evento no está preparado para recibirlos, **no se admiten niños**. El
  sitio debe comunicarlo con tacto y de forma clara (p. ej. en la sección de
  logística/asistencia y reforzado en el RSVP). Los lugares reservados por
  invitado son **solo para adultos**; el RSVP no ofrece la opción de acompañantes
  menores.

## Acceso por invitación (enlace único) — definido con el cliente

Cada invitado recibe un **enlace personal único** con un token en la URL
(`boda.com/?i=<token>`). El token es a la vez su **identidad y su llave de acceso**
— sustituye a un login tradicional.

- **Bloqueo total del sitio:** sin un token válido no se muestra el contenido; se
  ve una pantalla de acceso/bloqueo que invita a usar el enlace personal. El sitio
  **no es de acceso público** ni un enlace genérico compartible.
- **Personalización:** el token resuelve, contra el backend, los datos del
  invitado (nombre y **nº de lugares reservados**, solo adultos).
- **Control de aforo:** cada enlace trae un nº fijo de lugares → nadie añade
  acompañantes de más; refuerza la política *solo adultos*.
- **Conteo limpio:** cada confirmación queda atada a un invitado real, sin
  duplicados ni desconocidos.
- **Tokens** opacos y no adivinables (aleatorios, no secuenciales).
- **Generación y reparto:** los novios cargan la lista de invitados (nombre + nº
  de lugares) en el panel del backend; el sistema genera un token por invitado y
  produce la **lista de enlaces exportable** para repartir (WhatsApp, etc.).

## Diferenciadores

- **Identidad visual fiel al prototipo de Claude Design** (`A&C Wedding.html`):
  tipografías, paleta (`--primary`) y el gato animado que cruza al hacer scroll
  (`CatWalker`). El diseño es un requisito, no un detalle.
- **Mobile-first y rápido**: sitio compilado y ligero, servido como estático con
  un backend mínimo solo para lo dinámico.

## Criterios de éxito

- Un invitado abre **su enlace personal** y, desde el móvil, entiende el evento y
  **confirma en < 1 min** (sin login ni fricción).
- Sin un enlace válido, el sitio **no muestra contenido** (pantalla de acceso).
- Los novios pueden **consultar el conteo de confirmaciones** en cualquier momento.
- El sitio se mantiene **idéntico al diseño original** en todas las pantallas.

## Fuera de alcance (por ahora)

- Login tradicional con usuario/contraseña (el acceso es por **token en el enlace
  único**, ver *Acceso por invitación* — no un sistema de cuentas).
- Multi-idioma.
- Galería de fotos post-boda o subida de fotos por invitados.
