import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const communitySignals = sqliteTable("community_signals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  communityName: text("community_name").notNull(),
  district: text("district").notNull(),
  needType: text("need_type").notNull(),
  targetSegment: text("target_segment").notNull(),
  needScore: integer("need_score").notNull(),
  capacityTotal: integer("capacity_total").notNull(),
  capacityUsed: integer("capacity_used").notNull(),
  currentVisitors: integer("current_visitors").notNull(),
  collectionMethod: text("collection_method").notNull(),
  evidenceUrl: text("evidence_url").notNull(),
  collectedAt: text("collected_at").notNull(),
  verifiedBy: text("verified_by").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("community_signals_community_collected_idx").on(table.communityName, table.collectedAt),
  index("community_signals_district_idx").on(table.district),
  check("community_signals_need_score_check", sql`${table.needScore} BETWEEN 0 AND 100`),
  check("community_signals_capacity_total_check", sql`${table.capacityTotal} > 0`),
  check("community_signals_capacity_used_check", sql`${table.capacityUsed} BETWEEN 0 AND ${table.capacityTotal}`),
  check("community_signals_visitors_check", sql`${table.currentVisitors} >= 0`),
]);
