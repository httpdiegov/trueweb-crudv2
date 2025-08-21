'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getFacebookTrackingData } from '@/utils/facebook-tracking';

export default function PurchaseConfirmationPage() {
  const searchParams = useSearchParams();
  const [eventSent, setEventSent] = useState(false);
  
  // Obtener parámetros de la URL
  const orderId = searchParams.get('orderId');
  const value = searchParams.get('value');
  const currency = searchParams.get('currency') || 'PEN';
  const productName = searchParams.get('productName');
  const sku = searchParams.get('sku');
  
  useEffect(() => {
    // Enviar evento Purchase solo una vez cuando se carga la página
    if (!eventSent && orderId && value) {
      sendPurchaseEvent();
    }
  }, [eventSent, orderId, value]);
  
  const sendPurchaseEvent = async () => {
    try {
      // Obtener datos de tracking de Facebook
      const trackingData = getFacebookTrackingData();
      
      // Enviar evento Purchase a Meta Conversions API
      const response = await fetch('/api/conversions/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          value: parseFloat(value || '0'),
          currency,
          productName,
          sku,
          email: trackingData.email,
          phone: trackingData.phone,
          firstName: trackingData.firstName,
          externalId: trackingData.externalId
        }),
      });
      
      if (response.ok) {
        console.log('Evento Purchase enviado correctamente');
        setEventSent(true);
        
        // También enviar al Meta Pixel si está disponible
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Purchase', {
            value: parseFloat(value || '0'),
            currency: currency,
            content_name: productName,
            content_ids: [sku],
            content_type: 'product'
          });
        }
      } else {
        console.error('Error al enviar evento Purchase');
      }
    } catch (error) {
      console.error('Error al enviar evento Purchase:', error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-600 mb-2">¡Compra Confirmada!</h1>
        <p className="text-muted-foreground">
          Tu pedido ha sido procesado exitosamente
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalles del Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="flex justify-between">
              <span className="font-medium">Número de Pedido:</span>
              <Badge variant="outline">{orderId}</Badge>
            </div>
          )}
          
          {productName && (
            <div className="flex justify-between">
              <span className="font-medium">Producto:</span>
              <span className="text-right">{productName}</span>
            </div>
          )}
          
          {sku && (
            <div className="flex justify-between">
              <span className="font-medium">SKU:</span>
              <Badge variant="secondary">{sku}</Badge>
            </div>
          )}
          
          {value && (
            <div className="flex justify-between">
              <span className="font-medium">Total:</span>
              <span className="text-lg font-bold text-green-600">
                {currency} {parseFloat(value).toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-green-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Próximos Pasos</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Nos pondremos en contacto contigo por WhatsApp para confirmar los detalles</li>
                <li>• Te enviaremos información sobre el envío y tiempo de entrega</li>
                <li>• Recibirás actualizaciones del estado de tu pedido</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          ¿Tienes alguna pregunta? Contáctanos por WhatsApp
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Link>
          </Button>
          
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <a 
              href="https://wa.me/51940866278" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contactar por WhatsApp
            </a>
          </Button>
        </div>
      </div>
      
      {eventSent && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 text-center">
            ✓ Evento de compra registrado correctamente
          </p>
        </div>
      )}
    </div>
  );
}