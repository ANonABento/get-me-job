ALTER TABLE `documents` ADD `file_hash` text;--> statement-breakpoint
CREATE INDEX `idx_documents_user_file_hash` ON `documents` (`user_id`,`file_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_documents_user_file_hash` ON `documents` (`user_id`,`file_hash`) WHERE file_hash IS NOT NULL;--> statement-breakpoint
ALTER TABLE `profile_versions` ADD `user_id` text DEFAULT 'default' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_profile_bank_user_source` ON `profile_bank` (`user_id`,`source_document_id`);