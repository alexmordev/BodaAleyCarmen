-- Auditoria de confirmaciones. El estado vigente vive en guest_members/guests;
-- aqui queda una copia inmutable de cada envio del formulario (por si reenvian).
CREATE TABLE IF NOT EXISTS rsvp_submissions (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  guest_id        CHAR(36)     NOT NULL,
  payload         JSON         NOT NULL,            -- snapshot del envio {responses, plus}
  going_count     INT          NOT NULL DEFAULT 0,
  not_going_count INT          NOT NULL DEFAULT 0,
  ip              VARCHAR(45)  NULL,
  user_agent      VARCHAR(512) NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rsvp_guest (guest_id),
  CONSTRAINT fk_rsvp_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
