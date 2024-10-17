import { candidates } from "@/db/schema";
import { votingSessions } from "@/db/schema";

export type sessionsType = typeof votingSessions.$inferInsert;
export type candidatesType = typeof candidates.$inferInsert;
