# Esquema de base de datos — A&C Wedding

Base de datos **MySQL** (gestionada en Hostinger). Acceso desde las **Route
Handlers de Next.js** (`app/api/*`) con el driver **mysql2** (`lib/db.js`). Sin
ORM: consultas SQL parametrizadas y migraciones versionadas en `db/migrations/`.

- **Motor:** MySQL / MariaDB · InnoDB · `utf8mb4` / `utf8mb4_unicode_ci`.
- **Migraciones:** `db/migrations/NNN_*.sql`, aplicadas por `scripts/migrate.mjs`
  (registro en la tabla de control `_migrations`).
- **IDs:** `CHAR(36)` con UUID v4 (`crypto.randomUUID()`) para `guests` y
  `guest_members`; `BIGINT AUTO_INCREMENT` para tablas de log.
- **Token:** UUID opaco en `guests.token`; es la identidad + llave del invitado
  (no hay login). Llega por la URL `?i=<token>`.
- **Zona horaria:** columnas `DATETIME`; la conexión usa `timezone: 'Z'` y
  `dateStrings: true` (las fechas viajan como texto `YYYY-MM-DD HH:MM:SS`).

## Diagrama de relaciones

```
roles (1) ────< guests (1) ────< guest_members
                   │  │
                   │  └────< access_logs      (log de ingresos)
                   └───────< rsvp_submissions (auditoría de confirmaciones)
```

---

## Tabla `roles`

Catálogo de roles. Sembrado por la migración `001_roles.sql`.

| Columna       | Tipo                | Nulo | Default        | Notas |
|---------------|---------------------|------|----------------|-------|
| `id`          | TINYINT UNSIGNED PK | no   | AUTO_INCREMENT | |
| `name`        | VARCHAR(32)         | no   | —              | UNIQUE. `novios` \| `proveedor` \| `invitado` |
| `description` | VARCHAR(255)        | sí   | NULL           | |

**Semilla:** `1 novios`, `2 proveedor`, `3 invitado`.

- **novios** → administradores. Al entrar con su token ven el botón *Panel de
  novios* y acceden a `/novios` (accesos + confirmaciones + alta de invitados).
- **proveedor** → acceso acotado (alcance por definir).
- **invitado** → RSVP estándar.

## Tabla `guests` (grupo / enlace de invitación)

Un token identifica a un **grupo** (el "invitado principal"), no a una persona.

| Columna          | Tipo                | Nulo | Default            | Notas |
|------------------|---------------------|------|--------------------|-------|
| `id`             | CHAR(36) PK         | no   | UUID               | |
| `family`         | VARCHAR(255)        | no   | —                  | Etiqueta libre ("Familia Curiel-Ramírez") |
| `token`          | CHAR(36)            | no   | UUID               | UNIQUE. Llave de acceso (`?i=`) |
| `role_id`        | TINYINT UNSIGNED FK | no   | 3                  | → `roles.id` |
| `allow_plus_one` | TINYINT(1)          | no   | 0                  | El grupo puede sumar +1 |
| `confirmed`      | TINYINT(1)          | no   | 0                  | Ya envió su RSVP |
| `seats_adults`   | INT                 | no   | 0                  | Lugares reservados (adultos) |
| `seats_children` | INT                 | no   | 0                  | Menores permitidos (solo familia) |
| `table_no`       | INT                 | sí   | NULL               | Mesa asignada |
| `opened_at`      | DATETIME            | sí   | NULL               | Primera apertura del enlace |
| `confirmed_at`   | DATETIME            | sí   | NULL               | Momento del RSVP |
| `created_at`     | DATETIME            | no   | CURRENT_TIMESTAMP  | |
| `updated_at`     | DATETIME            | no   | CURRENT_TIMESTAMP  | ON UPDATE |

Índices: `PK(id)`, `UNIQUE(token)`, `KEY(role_id)`, FK `role_id → roles.id`.

## Tabla `guest_members` (personas del grupo)

| Columna              | Tipo                    | Nulo | Default           | Notas |
|----------------------|-------------------------|------|-------------------|-------|
| `id`                 | CHAR(36) PK             | no   | UUID              | |
| `guest_id`           | CHAR(36) FK             | no   | —                 | → `guests.id` (ON DELETE CASCADE) |
| `name`               | VARCHAR(255)            | sí   | NULL              | Puede venir vacío (a llenar en el form) |
| `editable_name`      | TINYINT(1)              | no   | 0                 | El invitado escribe el nombre |
| `type`               | ENUM('adulto','menor')  | no   | 'adulto'          | 'menor' permitido a nivel datos (familia); el copy público es "solo adultos" |
| `is_principal`       | TINYINT(1)              | no   | 0                 | Invitado principal del grupo |
| `allow_plus_one`     | TINYINT(1)              | no   | 0                 | Este miembro puede sumar +1 |
| `attending`          | TINYINT(1)              | sí   | NULL              | NULL = sin responder; 1 = sí; 0 = no |
| `diet`               | VARCHAR(255)            | sí   | NULL              | Restricción alimentaria |
| `plus_one_name`      | VARCHAR(255)            | sí   | NULL              | +1 (se cuelga del principal) |
| `plus_one_attending` | TINYINT(1)              | sí   | NULL              | |
| `plus_one_diet`      | VARCHAR(255)            | sí   | NULL              | |
| `sort_order`         | INT                     | no   | 0                 | Orden de despliegue |
| `created_at`         | DATETIME                | no   | CURRENT_TIMESTAMP | |
| `updated_at`         | DATETIME                | no   | CURRENT_TIMESTAMP | ON UPDATE |

Índices: `PK(id)`, `KEY(guest_id)`, FK `guest_id → guests.id` (CASCADE).

## Tabla `access_logs` (log de ingresos)

Un registro por cada apertura de enlace (`GET /api/party`). Alimenta el panel de
novios: **quién entró, a qué hora, cuántas veces**. Los intentos con token
inválido también se registran (`guest_id` NULL, `success` 0).

| Columna       | Tipo                  | Nulo | Default           | Notas |
|---------------|-----------------------|------|-------------------|-------|
| `id`          | BIGINT UNSIGNED PK    | no   | AUTO_INCREMENT    | |
| `guest_id`    | CHAR(36) FK           | sí   | NULL              | → `guests.id` (ON DELETE SET NULL) |
| `token_tried` | VARCHAR(64)           | sí   | NULL              | Token presentado (auditoría de fallos) |
| `success`     | TINYINT(1)            | no   | 0                 | 1 = token válido y resuelto |
| `ip`          | VARCHAR(45)           | sí   | NULL              | IPv4/IPv6 (de `x-forwarded-for`) |
| `user_agent`  | VARCHAR(512)          | sí   | NULL              | |
| `created_at`  | DATETIME              | no   | CURRENT_TIMESTAMP | La hora del ingreso |

Índices: `PK(id)`, `KEY(guest_id)`, `KEY(created_at)`, FK `guest_id → guests.id`.

## Tabla `rsvp_submissions` (auditoría de confirmaciones)

El estado vigente vive en `guest_members`/`guests`. Esta tabla guarda una copia
inmutable de cada envío del formulario (por si el grupo reenvía).

| Columna           | Tipo               | Nulo | Default           | Notas |
|-------------------|--------------------|------|-------------------|-------|
| `id`              | BIGINT UNSIGNED PK | no   | AUTO_INCREMENT    | |
| `guest_id`        | CHAR(36) FK        | no   | —                 | → `guests.id` (ON DELETE CASCADE) |
| `payload`         | JSON               | no   | —                 | Snapshot `{ responses, plus }` |
| `going_count`     | INT                | no   | 0                 | Personas que asisten en el envío |
| `not_going_count` | INT                | no   | 0                 | Personas que no asisten |
| `ip`              | VARCHAR(45)        | sí   | NULL              | |
| `user_agent`      | VARCHAR(512)       | sí   | NULL              | |
| `created_at`      | DATETIME           | no   | CURRENT_TIMESTAMP | |

Índices: `PK(id)`, `KEY(guest_id)`, FK `guest_id → guests.id` (CASCADE).

## Tabla `_migrations` (control interno)

Creada por `scripts/migrate.mjs`. Registra qué archivos SQL ya se aplicaron.

| Columna      | Tipo               | Nulo | Default           | Notas |
|--------------|--------------------|------|-------------------|-------|
| `id`         | BIGINT UNSIGNED PK | no   | AUTO_INCREMENT    | |
| `filename`   | VARCHAR(255)       | no   | —                 | UNIQUE |
| `applied_at` | DATETIME           | no   | CURRENT_TIMESTAMP | |

---

## Endpoints que usan estas tablas

| Método | Ruta                     | Rol       | Tablas |
|--------|--------------------------|-----------|--------|
| GET    | `/api/party?i=<token>`   | cualquiera| `guests`, `guest_members`, `roles`, `access_logs` |
| POST   | `/api/rsvp`              | invitado  | `guests`, `guest_members`, `rsvp_submissions` |
| GET    | `/api/admin/access`      | novios    | `access_logs`, `guests`, `guest_members`, `roles` |
| GET    | `/api/admin/guests`      | novios    | `guests`, `guest_members`, `roles` |
| POST   | `/api/admin/guests`      | novios    | `guests`, `guest_members` |

## Cómo aplicar el esquema

```bash
cp .env.example .env          # completar credenciales DB_* de Hostinger
npm install                   # instala mysql2 + dotenv
npm run migrate               # aplica db/migrations/*.sql
npm run migrate:status        # (opcional) ver aplicadas / pendientes
npm run seed                  # (opcional) datos de prueba + enlaces
```

> Para correr las migraciones desde una máquina externa hay que habilitar
> **Remote MySQL** en hPanel y autorizar la IP. En el propio Hostinger (donde
> corre la app) el host suele ser `localhost`.
