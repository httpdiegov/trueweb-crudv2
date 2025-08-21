import { NextRequest, NextResponse } from 'next/server';
import { sendPurchaseEvent, getClientIpAddress } from '@/lib/meta-conversions';
import { getFacebookTrackingData } from '@/utils/facebook-tracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      value,
      currency,
      contentIds,
      contentNames,
      contentCategory,
      numItems,
      attributionShare,
      originalEventName,
      originalEventTime,
      eventId
    } = body;

    // Validar campos requeridos
    if (!orderId || !value || !currency) {
      return NextResponse.json(
        { error: 'orderId, value y currency son requeridos' },
        { status: 400 }
      );
    }

    // Obtener datos de tracking de Facebook
    const trackingData = getFacebookTrackingData(request);
    
    // Obtener IP del cliente
    const clientIpAddress = getClientIpAddress(request);
    
    // Obtener User-Agent
    const userAgent = request.headers.get('user-agent') || undefined;

    // Enviar evento de Purchase a Meta Conversions API
    await sendPurchaseEvent({
      orderId,
      value: parseFloat(value),
      currency,
      contentIds,
      contentNames,
      contentCategory,
      numItems: numItems ? parseInt(numItems) : undefined,
      userAgent,
      clientIpAddress,
      fbp: trackingData.fbp,
      fbc: trackingData.fbc,
      email: trackingData.email,
      phone: trackingData.phone,
      firstName: trackingData.firstName,
      externalId: trackingData.externalId,
      attributionShare,
      originalEventName,
      originalEventTime,
      eventId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error enviando evento Purchase:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}