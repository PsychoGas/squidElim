import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players } from '@/lib/db/schema';

// Store connected clients
const clients = new Set<ReadableStreamDefaultController>();

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Add this client to the set
      clients.add(controller);

      // Remove client when connection closes
      return () => {
        clients.delete(controller);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Function to broadcast elimination to all connected clients
export async function broadcastElimination(playerNumber: number) {
  const message = `data: ${JSON.stringify({ playerNumber })}\n\n`;
  
  for (const client of clients) {
    try {
      client.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      // Remove failed clients
      clients.delete(client);
    }
  }
} 