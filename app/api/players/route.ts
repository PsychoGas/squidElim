import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { broadcastElimination } from '../eliminations/route';

export async function GET() {
  try {
    const allPlayers = await db.select().from(players);
    return NextResponse.json(allPlayers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, avatar } = body;

    // Get the next player number (highest + 1)
    const lastPlayer = await db.select().from(players).orderBy(desc(players.playerNumber)).limit(1);
    const nextPlayerNumber = lastPlayer.length > 0 ? lastPlayer[0].playerNumber + 1 : 1;

    const newPlayer = await db.insert(players).values({
      name,
      avatar,
      playerNumber: nextPlayerNumber,
      isEliminated: false,
    }).returning();

    return NextResponse.json(newPlayer[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { playerNumber } = body;

    const updatedPlayer = await db
      .update(players)
      .set({ isEliminated: true })
      .where(eq(players.playerNumber, playerNumber))
      .returning();

    // Broadcast the elimination to all connected clients
    await broadcastElimination(playerNumber);

    return NextResponse.json(updatedPlayer[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
} 