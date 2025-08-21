import { NextRequest, NextResponse } from 'next/server';
import { sendViewContentEvent, getClientIpAddress } from '@/lib/meta-conversions';
import { generateExternalId } from '@/utils/hashing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      productName,
      category,
      value,
      currency = 'USD',
      fbp: bodyFbp,
      fbc: bodyFbc,
      email, // Email sin hashear (se hasheará en sendViewContentEvent)
      phone, // Teléfono sin hashear (se hasheará en sendViewContentEvent)
      firstName, // Nombre sin hashear (se hasheará en sendViewContentEvent)
      externalId: bodyExternalId,
      userId,
      sessionId,
      // Nuevos parámetros según documentación oficial de Meta
      attributionShare,
      originalEventName,
      originalEventTime,
      orderId,
      eventId
    } = body;

    // Validar datos requeridos
    if (!productId || !productName) {
      return NextResponse.json(
        { error: 'productId y productName son requeridos' },
        { status: 400 }
      );
    }

    // Obtener información del navegador y IP
    const userAgent = request.headers.get('user-agent') || undefined;
    const clientIpAddress = getClientIpAddress(request);
    
    // Obtener cookies de Facebook si están disponibles
    const cookieFbp = request.cookies.get('_fbp')?.value;
    const cookieFbc = request.cookies.get('_fbc')?.value;

    // Priorizar fbc/fbp del body sobre las cookies (más actualizado)
    const fbp = bodyFbp || cookieFbp;
    const fbc = bodyFbc || cookieFbc;

    // Generar external_id si no se proporciona
    const finalExternalId = bodyExternalId || generateExternalId(userId, sessionId, clientIpAddress);

    // Enviar evento a la API de conversiones de Meta
    try {
      await sendViewContentEvent({
        productId,
        productName,
        category,
        value,
        currency,
        userAgent,
        clientIpAddress,
        fbp,
        fbc,
        email, // Se hasheará automáticamente en la función
        phone, // Se hasheará automáticamente en la función
        firstName, // Se hasheará automáticamente en la función
        externalId: finalExternalId,
        // Nuevos parámetros
        attributionShare,
        originalEventName,
        originalEventTime,
        orderId,
        eventId
      });

      return NextResponse.json({ success: true, message: 'Evento ViewContent enviado correctamente' });
    } catch (error) {
      console.error('Error al enviar evento ViewContent:', error);
      return NextResponse.json({ success: false, message: 'Error al enviar evento ViewContent' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error en endpoint ViewContent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}