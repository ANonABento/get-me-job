ALTER TABLE `profile_bank` ADD `source_artifact_id` text;
--> statement-breakpoint
ALTER TABLE `profile_bank` ADD `source_parse_run_id` text;
--> statement-breakpoint
ALTER TABLE `profile_bank` ADD `source_span_ids` text;
--> statement-breakpoint
ALTER TABLE `profile_bank` ADD `source_quality` text;
--> statement-breakpoint
CREATE INDEX `idx_profile_bank_parse_run` ON `profile_bank` (`user_id`, `source_parse_run_id`);
--> statement-breakpoint
CREATE INDEX `idx_profile_bank_artifact` ON `profile_bank` (`user_id`, `source_artifact_id`);
