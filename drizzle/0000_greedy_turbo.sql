CREATE TABLE `community_signals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`community_name` text NOT NULL,
	`district` text NOT NULL,
	`need_type` text NOT NULL,
	`target_segment` text NOT NULL,
	`need_score` integer NOT NULL,
	`capacity_total` integer NOT NULL,
	`capacity_used` integer NOT NULL,
	`current_visitors` integer NOT NULL,
	`collection_method` text NOT NULL,
	`evidence_url` text NOT NULL,
	`collected_at` text NOT NULL,
	`verified_by` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "community_signals_need_score_check" CHECK("community_signals"."need_score" BETWEEN 0 AND 100),
	CONSTRAINT "community_signals_capacity_total_check" CHECK("community_signals"."capacity_total" > 0),
	CONSTRAINT "community_signals_capacity_used_check" CHECK("community_signals"."capacity_used" BETWEEN 0 AND "community_signals"."capacity_total"),
	CONSTRAINT "community_signals_visitors_check" CHECK("community_signals"."current_visitors" >= 0)
);
--> statement-breakpoint
CREATE INDEX `community_signals_community_collected_idx` ON `community_signals` (`community_name`,`collected_at`);--> statement-breakpoint
CREATE INDEX `community_signals_district_idx` ON `community_signals` (`district`);