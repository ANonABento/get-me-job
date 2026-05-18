CREATE TABLE `document_artifacts` (
  `id` text PRIMARY KEY NOT NULL,
  `document_id` text NOT NULL,
  `user_id` text NOT NULL,
  `extractor_version` text NOT NULL,
  `status` text NOT NULL,
  `failure_reason` text,
  `raw_text` text NOT NULL DEFAULT '',
  `normalized_text` text NOT NULL DEFAULT '',
  `pages_json` text NOT NULL DEFAULT '[]',
  `links_json` text NOT NULL DEFAULT '[]',
  `ocr_used` integer NOT NULL DEFAULT 0,
  `created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `idx_document_artifacts_document_created` ON `document_artifacts` (`user_id`, `document_id`, `created_at`);
--> statement-breakpoint
CREATE INDEX `idx_document_artifacts_user_status` ON `document_artifacts` (`user_id`, `status`);
