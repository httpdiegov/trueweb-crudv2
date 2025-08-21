import { NextRequest, NextResponse } from 'next/server';
import { sendConversionEvent } from '@/lib/meta-conversions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventData } = body;

    if (!eventName) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Obtener información del cliente
    const userAgent = request.headers.get('user-agent') || undefined;
    const clientIpAddress = request.headers.get('x-forwarded-for') || 
                           request.headers.get('x-real-ip') || 
                           undefined;

    // Enviar evento a Meta Conversions API
    await sendConversionEvent(eventName, {
      ...eventData,
      userAgent,
      clientIpAddress
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in Meta Conversions API endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to send conversion event' },
      { status: 500 }
    );
  }
}