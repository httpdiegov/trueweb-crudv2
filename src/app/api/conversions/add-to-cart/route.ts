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
      currency = 'USD'
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
    const fbp = request.cookies.get('_fbp')?.value;
    const fbc = request.cookies.get('_fbc')?.value;

    // Enviar evento a la API de conversiones de Meta
    try {
      await sendAddToCartEvent({
        productId,
        productName,
        category,
        value,
        currency,
        userAgent: request.headers.get('user-agent') || undefined,
        clientIpAddress,
        fbp: request.headers.get('x-fbp') || undefined,
        fbc: request.headers.get('x-fbc') || undefined,
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