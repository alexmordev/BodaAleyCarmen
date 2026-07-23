# API — A&C Wedding

Documentación de los endpoints REST del sitio de la boda de Alejandro & Carmen.
Pensada para pegarse directamente en **Bruno** o **Postman**.

- **Runtime:** Next.js 15 (App Router), Node.js. Todas las rutas son `force-dynamic`.
- **Base URL local:** `http://localhost:3000`
- **Base URL producción:** define `{{baseUrl}}` como variable de entorno en Bruno/Postman.
- **Formato:** JSON en request y response. `Content-Type: application/json` en los `POST`.

## Variables de entorno sugeridas

Crea un *environment* con estas variables y reutilízalas en cada request:

| Variable | Ejemplo | Descripción |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | Raíz del sitio. |
| `guestToken` | `a1b2c3d4-...` | Token (UUID) de un grupo invitado. |
| `noviosToken` | `e5f6g7h8-...` | Token de un grupo con rol `novios` (acceso admin). |
| `memberId` | `11112222-...` | ID de un miembro del grupo (para el RSVP). |

---

## Autenticación

No hay cabeceras de auth. El control de acceso es por **token de grupo** (UUID),
que se resuelve contra la tabla `guests`:

- **Rutas públicas** (`/api/party`, `/api/rsvp`): requieren el token del grupo invitado.
- **Rutas de admin** (`/api/admin/*`): requieren un token cuyo grupo tenga rol `novios`.
  - Token ausente o inexistente → `401`.
  - Token válido pero rol distinto de `novios` → `403`.

---

## 1. Obtener el grupo del invitado

Resuelve el grupo por su token, registra el acceso (log de ingresos), marca la
invitación como abierta y devuelve el payload que el frontend inyecta en
`window.__PARTY__`.

```
GET {{baseUrl}}/api/party?i={{guestToken}}
```

**Query params**

| Param | Requerido | Notas |
|---|---|---|
| `i` | sí | Token del grupo. Alias aceptado: `token`. |

> **`rsvpRequired`**: `false` para roles exentos (`novios`, `proveedor`) — no ven el
> formulario de RSVP ni cuentan en las estadísticas. `true` para el resto
> (invitados, padrinos/damas de honor). Se deriva del rol.

**Ejemplo (curl)**

```bash
curl "{{baseUrl}}/api/party?i={{guestToken}}"
```

**200 OK**

```json
{
  "party": {
    "id": "guest-uuid",
    "family": "Familia Morales",
    "role": "invitado",
    "rsvpRequired": true,
    "allowPlusOne": true,
    "confirmed": false,
    "seats": { "adults": 2, "children": 1 },
    "guests": [
      {
        "id": "member-uuid",
        "name": "Alejandro",
        "principal": true,
        "editable": false,
        "type": "adulto",
        "attending": null,
        "diet": ""
      }
    ]
  }
}
```

**Respuestas de error**

| Status | Body | Causa |
|---|---|---|
| `400` | `{ "error": "Falta el token de invitacion" }` | Sin `i`/`token`. |
| `404` | `{ "error": "Invitacion no encontrada" }` | Token inexistente (se registra el intento fallido). |
| `500` | `{ "error": "Error del servidor" }` | Error de BD. |

---

## 2. Confirmar asistencia (RSVP)

Persiste la confirmación de un grupo. Valida el aforo antes de escribir; si se
excede, devuelve `409` con `code: "AFORO"`.

```
POST {{baseUrl}}/api/rsvp
Content-Type: application/json
```

**Body**

```json
{
  "token": "{{guestToken}}",
  "responses": [
    { "memberId": "{{memberId}}", "attending": true, "name": "Alejandro", "diet": "vegetariano" },
    { "memberId": "member-uuid-2", "attending": false }
  ],
  "plus": { "enabled": true, "name": "Invitado +1", "diet": "" }
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `token` | string | sí | Token del grupo. |
| `responses` | array | sí | No vacío. Una entrada por miembro. |
| `responses[].memberId` | string | sí | ID del miembro (`party.guests[].id`). |
| `responses[].attending` | bool | sí | `true` asiste, `false` no. |
| `responses[].name` | string | no | Solo se aplica si el miembro es `editable`. |
| `responses[].diet` | string | no | Preferencia alimentaria. |
| `plus` | object | no | Acompañante (+1). Solo si el grupo tiene `allowPlusOne`. |
| `plus.enabled` | bool | — | `true` para registrar el +1. |
| `plus.name` | string | — | Requerido para que el +1 cuente. |
| `plus.diet` | string | — | Dieta del +1. |

**Ejemplo (curl)**

```bash
curl -X POST "{{baseUrl}}/api/rsvp" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "{{guestToken}}",
    "responses": [{ "memberId": "{{memberId}}", "attending": true }]
  }'
```

**200 OK**

```json
{ "ok": true, "going": 2, "notGoing": 1 }
```

**Respuestas de error**

| Status | Body | Causa |
|---|---|---|
| `400` | `{ "error": "JSON invalido" }` | Body no parseable. |
| `400` | `{ "error": "Falta el token" }` | Sin `token`. |
| `400` | `{ "error": "Faltan respuestas" }` | `responses` ausente o vacío. |
| `403` | `{ "error": "Este acceso no requiere confirmación", "code": "NO_RSVP" }` | El grupo es de un rol exento (`novios`/`proveedor`). |
| `404` | `{ "error": "Invitacion no encontrada" }` | Token inexistente. |
| `409` | `{ "error": "Tu invitación tiene N lugares...", "code": "AFORO" }` | Aforo excedido. |
| `500` | `{ "error": "No se pudo guardar la confirmacion" }` | Error al persistir. |

> **Aforo:** un límite en `0` se interpreta como "sin límite" y no bloquea (grupos
> antiguos sin `seats_adults`/`seats_children`). El `+1` cuenta como adulto.

---

## 3. Panel de novios — accesos y estadísticas

Resumen de accesos por grupo, ingresos recientes y conteo de confirmaciones.
**Solo rol `novios`.**

> Las estadísticas (`stats.groups`, `stats.people`, `stats.diets`) cuentan **solo
> roles que confirman**; se excluyen `novios` y `proveedor`.

```
GET {{baseUrl}}/api/admin/access?token={{noviosToken}}
```

**Query params**

| Param | Requerido | Notas |
|---|---|---|
| `token` | sí | Token de un grupo con rol `novios`. |

**Ejemplo (curl)**

```bash
curl "{{baseUrl}}/api/admin/access?token={{noviosToken}}"
```

**200 OK**

```json
{
  "summary": [
    {
      "id": "guest-uuid",
      "family": "Familia Morales",
      "role": "invitado",
      "confirmed": 1,
      "visitas": 3,
      "primer_ingreso": "2026-07-01T10:00:00.000Z",
      "ultimo_ingreso": "2026-07-20T18:30:00.000Z"
    }
  ],
  "recent": [
    {
      "id": 123,
      "created_at": "2026-07-20T18:30:00.000Z",
      "success": 1,
      "ip": "203.0.113.5",
      "token_tried": "a1b2c3d4-...",
      "family": "Familia Morales"
    }
  ],
  "stats": {
    "groups": { "grupos": 40, "grupos_confirmados": 25 },
    "people": { "asisten": 78, "no_asisten": 6, "sin_responder": 20, "acompanantes": 5 },
    "diets": [ { "diet": "vegetariano", "n": 4 } ]
  }
}
```

**Respuestas de error**

| Status | Body | Causa |
|---|---|---|
| `401` | `{ "error": "Token requerido o invalido" }` | Token ausente o inexistente. |
| `403` | `{ "error": "Acceso solo para novios" }` | Rol distinto de `novios`. |
| `500` | `{ "error": "Error del servidor" }` | Error de BD. |

---

## 4. Panel de novios — listar invitados

Lista todos los grupos con sus miembros, estado y enlace de invitación.
**Solo rol `novios`.**

```
GET {{baseUrl}}/api/admin/guests?token={{noviosToken}}
```

**200 OK**

```json
{
  "guests": [
    {
      "id": "guest-uuid",
      "family": "Familia Morales",
      "token": "a1b2c3d4-...",
      "role": "invitado",
      "allow_plus_one": 1,
      "confirmed": 1,
      "seats_adults": 2,
      "seats_children": 1,
      "opened_at": "2026-07-01T10:00:00.000Z",
      "confirmed_at": "2026-07-05T12:00:00.000Z",
      "link": "https://tu-dominio.com/?i=a1b2c3d4-...",
      "members": [
        {
          "id": "member-uuid",
          "guest_id": "guest-uuid",
          "name": "Alejandro",
          "type": "adulto",
          "is_principal": 1,
          "attending": 1,
          "diet": "",
          "plus_one_name": null,
          "plus_one_attending": null,
          "plus_one_diet": null
        }
      ]
    }
  ]
}
```

> El campo `link` usa `NEXT_PUBLIC_SITE_URL`; si no está definida, el enlace es relativo (`/?i=...`).

**Errores:** iguales que en `/api/admin/access` (`401`, `403`, `500`).

---

## 5. Panel de novios — alta de invitado

Crea un grupo nuevo y genera su token de invitación. **Solo rol `novios`.**

```
POST {{baseUrl}}/api/admin/guests?token={{noviosToken}}
Content-Type: application/json
```

**Body**

```json
{
  "family": "Familia Pérez",
  "role": "invitado",
  "allowPlusOne": false,
  "seatsAdults": 2,
  "seatsChildren": 0,
  "members": [
    { "name": "Juan", "type": "adulto", "principal": true, "editable": false, "allowPlusOne": false },
    { "name": "Ana", "type": "adulto", "principal": false, "editable": false },
    { "name": null, "type": "menor", "editable": true }
  ]
}
```

| Campo | Tipo | Requerido | Default | Notas |
|---|---|---|---|---|
| `family` | string | sí | — | Etiqueta del grupo. |
| `role` | string | no | `invitado` | Nombre de rol existente (`invitado`, `novios`, ...). |
| `allowPlusOne` | bool | no | `false` | Habilita el +1 del grupo. |
| `seatsAdults` | number | no | `0` | Lugares para adultos (0 = sin límite). |
| `seatsChildren` | number | no | `0` | Lugares para menores (0 = sin límite). |
| `members` | array | no | `[]` | Miembros del grupo. |
| `members[].name` | string\|null | no | `null` | Nombre; `null` si el invitado lo rellenará. |
| `members[].type` | string | no | `adulto` | `adulto` o `menor`. |
| `members[].principal` | bool | no | `false` | Miembro principal (cuelga el +1). |
| `members[].editable` | bool | no | `false` | Permite editar el nombre en el RSVP. |
| `members[].allowPlusOne` | bool | no | `false` | +1 a nivel miembro. |

**Ejemplo (curl)**

```bash
curl -X POST "{{baseUrl}}/api/admin/guests?token={{noviosToken}}" \
  -H "Content-Type: application/json" \
  -d '{ "family": "Familia Pérez", "members": [{ "name": "Juan", "principal": true }] }'
```

**201 Created**

```json
{
  "ok": true,
  "id": "nuevo-guest-uuid",
  "token": "nuevo-token-uuid",
  "link": "https://tu-dominio.com/?i=nuevo-token-uuid"
}
```

**Respuestas de error**

| Status | Body | Causa |
|---|---|---|
| `400` | `{ "error": "JSON invalido" }` | Body no parseable. |
| `400` | `{ "error": "Falta la etiqueta del grupo (family)" }` | Sin `family`. |
| `401` | `{ "error": "Token requerido o invalido" }` | Token ausente o inexistente. |
| `403` | `{ "error": "Acceso solo para novios" }` | Rol distinto de `novios`. |
| `500` | `{ "error": "No se pudo crear el invitado" }` | Error al persistir. |

> **Roles disponibles**: `invitado`, `familia`, `padrinos` (todos confirman) y
> `novios`, `proveedor` (exentos de RSVP). Los tipos de miembro son `adulto` /
> `menor`.

---

## 6. Mesas (seating)

Gestión de mesas del banquete y asignación de personas a cada mesa. **Solo rol
`novios`.** La asignación se cuelga de cada **miembro** (`guest_members`), no del
grupo, para poder sentar a personas del mismo grupo en mesas distintas.

```
GET    {{baseUrl}}/api/admin/tables?token={{noviosToken}}
POST   {{baseUrl}}/api/admin/tables?token={{noviosToken}}
PATCH  {{baseUrl}}/api/admin/tables?token={{noviosToken}}
DELETE {{baseUrl}}/api/admin/tables?token={{noviosToken}}&id=<mesa>
```

**GET** → lista de mesas con el conteo de personas ya sentadas:

```json
{ "tables": [ { "id": "mesa-uuid", "name": "Mesa 1", "seats": 10, "sort_order": 1, "seated": 3 } ] }
```

**POST** — crea una mesa. Body opcional `{ "name": "Mesa Novios", "seats": 8 }`
(por defecto `Mesa N` con 10 lugares) → `201 { ok: true, table: { ... } }`.

**PATCH** — sienta o libera a una persona:

```json
{ "memberId": "member-uuid", "tableId": "mesa-uuid" }   // tableId: null para liberar
```

→ `200 { ok: true }`. Errores: `400` sin `memberId`; `404` `{ "error": "La mesa
no existe" }`.

**DELETE** — borra la mesa (los invitados sentados quedan libres, no se borran).
Requiere `?id=<mesa>` → `200 { ok: true }`.

Errores comunes a todos: `401` token ausente/inválido, `403` rol distinto de
`novios`.

---

## Resumen de endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/party?i=<token>` | token invitado | Grupo del invitado + registra acceso. |
| `POST` | `/api/rsvp` | token invitado (en body) | Confirmar asistencia. |
| `GET` | `/api/admin/access?token=<novios>` | novios | Accesos y estadísticas. |
| `GET` | `/api/admin/guests?token=<novios>` | novios | Listar invitados con enlaces. |
| `POST` | `/api/admin/guests?token=<novios>` | novios | Alta de grupo + token. |
| `GET` | `/api/admin/tables?token=<novios>` | novios | Listar mesas + conteo sentados. |
| `POST` | `/api/admin/tables?token=<novios>` | novios | Crear mesa. |
| `PATCH` | `/api/admin/tables?token=<novios>` | novios | Sentar/liberar persona. |
| `DELETE` | `/api/admin/tables?token=<novios>&id=<mesa>` | novios | Borrar mesa. |