import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const connectionString = process.env.DATABASE_URL;

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

// Helper functions for database operations
export async function getAllPlayers() {
  return await db.select().from(schema.players);
}

export async function createPlayer(player: schema.NewPlayer) {
  return await db.insert(schema.players).values(player).returning();
}

export async function eliminatePlayer(playerNumber: number) {
  return await db
    .update(schema.players)
    .set({ isEliminated: true, updatedAt: new Date() })
    .where(schema.players.playerNumber.equals(playerNumber))
    .returning();
}

export async function getPlayerByNumber(playerNumber: number) {
  return await db
    .select()
    .from(schema.players)
    .where(schema.players.playerNumber.equals(playerNumber))
    .limit(1);
} 