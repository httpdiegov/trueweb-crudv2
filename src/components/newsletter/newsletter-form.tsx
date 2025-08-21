'use client';

import { useState } from 'react';
import { saveUserData } from '@/utils/facebook-tracking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, User, Gift } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function NewsletterForm({ variant = 'full', className = '' }: NewsletterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validar que al menos el email esté presente
      if (!formData.email.trim()) {
        throw new Error('El email es requerido');
      }

      // Guardar datos de usuario para tracking de Meta
      saveUserData({
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        firstName: formData.firstName.trim() || undefined
      });

      // Simular envío a newsletter (aquí puedes integrar con tu servicio de email)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSubmitted(true);
      
      // Limpiar formulario después de 3 segundos
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ email: '', phone: '', firstName: '' });
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al suscribirse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError(''); // Limpiar error al escribir
  };

  if (isSubmitted) {
    return (
      <Card className={`bg-green-50 border-green-200 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <Gift className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ¡Gracias por suscribirte!
            </h3>
            <p className="text-green-700">
              Te enviaremos las mejores ofertas de ropa vintage americana.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg ${className}`}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="text-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              🎉 Ofertas Exclusivas
            </h3>
            <p className="text-sm text-gray-600">
              Suscríbete y recibe descuentos especiales
            </p>
          </div>
          
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? 'Enviando...' : 'Suscribir'}
            </Button>
          </div>
          
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
        </form>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Mail className="h-5 w-5" />
          Newsletter True Vintage
        </CardTitle>
        <CardDescription>
          Suscríbete para recibir ofertas exclusivas, nuevos productos y tendencias de moda vintage americana.
          <br />
          <span className="text-xs text-purple-600 font-medium">
            ✨ Suscriptores reciben 10% de descuento en su primera compra
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre (opcional)
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Tu nombre"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono (opcional)
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+51 999 999 999"
              value={formData.phone}
              onChange={handleInputChange('phone')}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Suscribiendo...' : 'Suscribirse al Newsletter'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Al suscribirte, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default NewsletterForm;