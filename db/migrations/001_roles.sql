-- Roles del sistema. novios = administradores (panel de accesos, alta de
-- invitados, tokens y conteo); proveedor = acceso acotado; invitado = RSVP.
CREATE TABLE IF NOT EXISTS roles (
  id          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(32)  NOT NULL,
  description VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (id, name, description) VALUES
  (1, 'novios',    'Administradores: panel de accesos, alta de invitados, tokens y conteo'),
  (2, 'proveedor', 'Proveedores con acceso acotado'),
  (3, 'invitado',  'Invitado estandar (RSVP)')
ON DUPLICATE KEY UPDATE description = VALUES(description);
