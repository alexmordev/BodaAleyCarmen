-- Panel de novios (rediseño): roles adicionales + mesas (seating).
--
-- 1) Roles nuevos para clasificar grupos en el alta del panel. familia y
--    padrinos SÍ confirman (no son exentos); solo novios/proveedor quedan fuera
--    del RSVP y las estadísticas (ver rsvpRequiredForRole en lib/repo.js).
INSERT INTO roles (id, name, description) VALUES
  (4, 'familia',  'Grupo familiar (RSVP estándar)'),
  (5, 'padrinos', 'Padrinos y damas de honor (RSVP estándar)')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 2) Mesas del banquete. Cada mesa tiene un nombre y un número de lugares.
CREATE TABLE IF NOT EXISTS tables (
  id          CHAR(36)     NOT NULL,
  name        VARCHAR(120) NOT NULL,
  seats       INT          NOT NULL DEFAULT 10,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Asignación de cada persona a una mesa. Se cuelga del miembro (no del grupo)
--    para poder sentar a personas del mismo grupo en mesas distintas. ON DELETE
--    SET NULL: borrar una mesa libera a sus invitados sin borrarlos.
ALTER TABLE guest_members
  ADD COLUMN table_id CHAR(36) NULL AFTER diet,
  ADD KEY idx_members_table (table_id),
  ADD CONSTRAINT fk_members_table FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL;
