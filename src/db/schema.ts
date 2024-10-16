import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  uuid,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const votingSessions = pgTable("voting_sessions", {
  id: uuid().defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  creatorId: varchar("creator_id").notNull(), // Clerk tarafından sağlanan kullanıcı ID
  duration: integer("duration").notNull(), // Süre dakika cinsinden
  candidateCount: integer("candidate_count").notNull(), // Aday sayısı
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" })
    .generatedAlwaysAs(sql`created_at + (duration * interval '1 minute')`)
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(), // Oylamanın aktif olup olmadığını belirtir
});

export const candidates = pgTable("candidates", {
  id: uuid().defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => votingSessions.id, { onDelete: "cascade" })
    .notNull(), // Oylama oturumuyla ilişkilendirilen aday
  name: varchar("name", { length: 255 }).notNull(),
});

export const votes = pgTable("votes", {
  id: uuid().defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => votingSessions.id, { onDelete: "cascade" })
    .notNull(), // Oylama oturumu
  candidateId: uuid("candidate_id")
    .references(() => candidates.id, { onDelete: "cascade" })
    .notNull(), // Oy verilen aday
  userId: uuid("user_id").notNull(), // Clerk tarafından sağlanan kullanıcı ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
