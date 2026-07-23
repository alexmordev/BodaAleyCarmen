# Errores de producción — diagnóstico

## Síntoma

```
GET https://aleycarmen.site/api/admin/guests?token=...   → 500 Internal Server Error
GET https://aleycarmen.site/api/admin/tables?token=...    → 500 Internal Server Error (antes)
```

El panel carga las stats (`/api/admin/access`) pero la lista de invitados y las
mesas fallan intermitentemente.

## Diagnóstico (verificado)

- **Una sola base de datos**, compartida por local y producción
  (`u544426531_aleycarmenboda`). No hay una segunda BD "de local".
- Esa BD **sí tiene** la columna `guest_members.table_id` y la migración
  `006_tables_and_roles.sql` aplicada.
- Las queries de `guestsWithMembers()` (que seleccionan `table_id`) **corren
  limpias** contra ella. → El código y el esquema son correctos.
- La MySQL de Hostinger limita a **`max_user_connections = 75`** por usuario.

**Conclusión:** no es un bug de código ni falta de columna. El 500 es
**transitorio, por presión de conexiones** en la MySQL compartida — agravado por
correr **servidores locales (dev/prod) contra la MISMA BD de producción**. Bajo
carga concurrente algún request se queda sin conexión y devuelve 500.

## Correcciones aplicadas

1. **Pool más ligero** (`lib/db.js`): `maxIdle: 2`, `idleTimeout: 30s`,
   `enableKeepAlive`. Cada instancia suelta conexiones ociosas y no acapara cupo.
2. **`prestart` de migraciones** (`package.json`): al arrancar, prod aplica las
   migraciones pendientes solas (idempotente).

## Acciones pendientes

- [ ] Commit + push a `main` y **redeploy/restart** en Hostinger (toma el pool
      nuevo y el `prestart`).
- [ ] **Dejar de usar la BD de producción para desarrollo local** (raíz del
      problema y riesgo para los datos reales). Usar una BD local separada.
- [ ] Si el 500 reaparece con pocas conexiones activas, leer el error real en los
      logs de Hostinger: línea `[api/admin/guests] DB error: ...` (o `tables`).
