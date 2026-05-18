CREATE TABLE `document_parse_runs` (
  `id` text PRIMARY KEY NOT NULL,
  `document_id` text NOT NULL,
  `artifact_id` text NOT NULL,
  `user_id` text NOT NULL,
  `mode` text NOT NULL,
  `parser_version` text NOT NULL,
  `status` text NOT NULL,
  `failure_reason` text,
  `confidence` real NOT NULL DEFAULT 0,
  `warnings_json` text NOT NULL DEFAULT '[]',
  `structured_json` text NOT NULL DEFAULT '{}',
  `created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `idx_document_parse_runs_document_created` ON `document_parse_runs` (`user_id`, `document_id`, `created_at`);
--> statement-breakpoint
CREATE INDEX `idx_document_parse_runs_artifact_created` ON `document_parse_runs` (`user_id`, `artifact_id`, `created_at`);
--> statement-breakpoint
CREATE INDEX `idx_document_parse_runs_user_status` ON `document_parse_runs` (`user_id`, `status`);
