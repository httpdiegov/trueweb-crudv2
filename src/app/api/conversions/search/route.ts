import { NextRequest, NextResponse } from 'next/server';
import { sendSearchEvent, getClientIpAddress } from '@/lib/meta-conversions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      searchTerm, 
      fbp, 
      fbc, 
      email, 
      phone, 
      firstName, 
      externalId,
      // Nuevos parámetros según documentación oficial de Meta
      attributionShare,
      originalEventName,
      originalEventTime,
      orderId,
      eventId
    } = body;

    // Validar datos requeridos
    if (!searchTerm) {
      return NextResponse.json(
        { error: 'searchTerm es requerido' },
        { status: 400 }
      );
    }

    // Obtener información del cliente
    const clientIpAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Priorizar fbp y fbc del cuerpo de la solicitud sobre las cookies
    const fbpValue = fbp || request.cookies.get('_fbp')?.value;
    const fbcValue = fbc || request.cookies.get('_fbc')?.value;

    // Generar externalId si no se proporciona
    const finalExternalId = externalId || `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Enviar evento de búsqueda a Meta
    await sendSearchEvent({
      searchTerm,
      userAgent,
      clientIpAddress,
      fbp: fbpValue,
      fbc: fbcValue,
      email,
      phone,
      firstName,
      externalId: finalExternalId,
      // Nuevos parámetros
      attributionShare,
      originalEventName,
      originalEventTime,
      orderId,
      eventId
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Evento Search enviado correctamente',
      eventData: {
        searchTerm,
        fbp: fbpValue,
        fbc: fbcValue,
        externalId: finalExternalId,
        clientIpAddress,
        userAgent
      }
    });
  } catch (error) {
    console.warn('Error en /api/conversions/search:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}