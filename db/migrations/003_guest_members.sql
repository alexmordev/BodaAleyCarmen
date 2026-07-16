-- Personas dentro de un grupo. El nombre puede venir vacio (editable_name=1)
-- para que el invitado lo escriba en el formulario. type admite 'menor' a nivel
-- de datos (familia), aunque el copy publico del sitio es "solo adultos".
CREATE TABLE IF NOT EXISTS guest_members (
  id                  CHAR(36)     NOT NULL,
  guest_id            CHAR(36)     NOT NULL,
  name                VARCHAR(255) NULL,
  editable_name       TINYINT(1)   NOT NULL DEFAULT 0,   -- el invitado escribe el nombre
  type                ENUM('adulto','menor') NOT NULL DEFAULT 'adulto',
  is_principal        TINYINT(1)   NOT NULL DEFAULT 0,   -- invitado principal del grupo
  allow_plus_one      TINYINT(1)   NOT NULL DEFAULT 0,   -- este miembro puede sumar +1
  attending           TINYINT(1)   NULL,                 -- NULL = sin responder
  diet                VARCHAR(255) NULL,                 -- restriccion alimentaria
  plus_one_name       VARCHAR(255) NULL,
  plus_one_attending  TINYINT(1)   NULL,
  plus_one_diet       VARCHAR(255) NULL,
  sort_order          INT          NOT NULL DEFAULT 0,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_members_guest (guest_id),
  CONSTRAINT fk_members_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
