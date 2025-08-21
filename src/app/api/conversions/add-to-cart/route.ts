import { NextRequest, NextResponse } from 'next/server';
import { sendAddToCartEvent } from '@/lib/meta-conversions';

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
      fbc: bodyFbc
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
    const clientIpAddress = request.headers.get('x-forwarded-for') || 
                            request.headers.get('x-real-ip') || 
                            undefined;
    
    // Obtener cookies de Facebook si están disponibles
    const cookieFbp = request.cookies.get('_fbp')?.value;
    const cookieFbc = request.cookies.get('_fbc')?.value;

    // Priorizar fbc/fbp del body sobre las cookies (más actualizado)
    const fbp = bodyFbp || cookieFbp;
    const fbc = bodyFbc || cookieFbc;

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