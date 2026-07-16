-- Grupo / enlace de invitacion. Un token (UUID opaco) identifica a un grupo
-- ("Familia Curiel-Ramirez" o "Norma Curiel"), no a una sola persona.
CREATE TABLE IF NOT EXISTS guests (
  id             CHAR(36)     NOT NULL,
  family         VARCHAR(255) NOT NULL,               -- etiqueta libre del grupo
  token          CHAR(36)     NOT NULL,               -- UUID opaco (llave de acceso)
  role_id        TINYINT UNSIGNED NOT NULL DEFAULT 3, -- 3 = invitado
  allow_plus_one TINYINT(1)   NOT NULL DEFAULT 0,     -- el grupo puede sumar +1
  confirmed      TINYINT(1)   NOT NULL DEFAULT 0,     -- ya envio su RSVP
  seats_adults   INT          NOT NULL DEFAULT 0,     -- lugares reservados (adultos)
  seats_children INT          NOT NULL DEFAULT 0,     -- menores permitidos (solo familia)
  table_no       INT          NULL,                   -- mesa asignada
  opened_at      DATETIME     NULL,                   -- primera vez que abrio el enlace
  confirmed_at   DATETIME     NULL,                   -- momento del RSVP
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_guests_token (token),
  KEY idx_guests_role (role_id),
  CONSTRAINT fk_guests_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
