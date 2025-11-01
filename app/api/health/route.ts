import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Returns basic system status
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TAS Assistant API',
    version: '0.1.0',
  });
}
