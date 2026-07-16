-- Log de ingresos: cada vez que se abre un enlace (?i=<token>) se registra aqui.
-- Alimenta el panel de novios (quien entro, a que hora, cuantas veces).
-- Los intentos con token invalido tambien se registran (guest_id NULL, success=0).
CREATE TABLE IF NOT EXISTS access_logs (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  guest_id    CHAR(36)     NULL,
  token_tried VARCHAR(64)  NULL,                    -- token presentado (para auditar fallos)
  success     TINYINT(1)   NOT NULL DEFAULT 0,      -- 1 = token valido y resuelto
  ip          VARCHAR(45)  NULL,                    -- IPv4/IPv6
  user_agent  VARCHAR(512) NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_access_guest (guest_id),
  KEY idx_access_created (created_at),
  CONSTRAINT fk_access_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
