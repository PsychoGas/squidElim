import { pgTable, serial, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  playerNumber: serial('player_number').notNull(),
  name: text('name').notNull(),
  avatar: text('avatar').notNull(),
  isEliminated: boolean('is_eliminated').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert; 