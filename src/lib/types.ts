import { candidates } from "@/db/schema";
import { votingSessions } from "@/db/schema";

export type sessions = typeof votingSessions.$inferInsert;
export type candidates = typeof candidates.$inferInsert;
