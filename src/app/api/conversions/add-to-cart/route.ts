import { NextRequest, NextResponse } from 'next/server';
import { sendAddToCartEvent, getClientIpAddress } from '@/lib/meta-conversions';
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
      email, // Email sin hashear (se hasheará en sendAddToCartEvent)
      phone, // Teléfono sin hashear (se hasheará en sendAddToCartEvent)
      firstName, // Nombre sin hashear (se hasheará en sendAddToCartEvent)
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

    // Obtener información del navegador y IP (mejorado para mejor calidad de coincidencias)
    const userAgent = request.headers.get('user-agent') || undefined;
    const clientIpAddress = getClientIpAddress(request);
    
    // Obtener cookies de Facebook si están disponibles
    const cookieFbp = request.cookies.get('_fbp')?.value;
    const cookieFbc = request.cookies.get('_fbc')?.value;

    // Priorizar fbc/fbp del body sobre las cookies (más actualizado)
    const fbp = bodyFbp || cookieFbp;
    const fbc = bodyFbc || cookieFbc;

    // Generar external_id si no se proporciona uno
    const externalId = bodyExternalId || generateExternalId(userId, sessionId, clientIpAddress);

    // Enviar evento a la API de conversiones de Meta
    try {
      await sendAddToCartEvent({
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
        externalId,
        // Nuevos parámetros
        attributionShare,
        originalEventName,
        originalEventTime,
        orderId,
        eventId
      });

      return NextResponse.json({ success: true, message: 'Evento AddToCart enviado correctamente' });
    } catch (error) {
      console.error('Error al enviar evento AddToCart:', error);
      return NextResponse.json({ success: false, message: 'Error al enviar evento AddToCart' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error en endpoint AddToCart:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}