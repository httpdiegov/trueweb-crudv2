import crypto from 'crypto';

/**
 * Normaliza y hashea un email con SHA-256 para Meta Conversions API
 * Según Meta: +42.4% aumento en conversiones adicionales registradas
 * @param email - Email a hashear
 * @returns Email hasheado con SHA-256 o null si es inválido
 */
export function hashEmail(email: string | null | undefined): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  // Normalizar email según las especificaciones de Meta:
  // 1. Convertir a minúsculas
  // 2. Remover espacios en blanco
  const normalizedEmail = email.toLowerCase().trim();

  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return null;
  }

  // Hashear con SHA-256
  return crypto.createHash('sha256').update(normalizedEmail).digest('hex');
}

/**
 * Normaliza y hashea un número de teléfono con SHA-256 para Meta Conversions API
 * Según Meta: +11.56% aumento en conversiones adicionales registradas
 * @param phone - Número de teléfono a hashear
 * @returns Teléfono hasheado con SHA-256 o null si es inválido
 */
export function hashPhone(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  // Normalizar teléfono según las especificaciones de Meta:
  // 1. Remover todos los caracteres no numéricos excepto el +
  // 2. Mantener el código de país si está presente
  let normalizedPhone = phone.replace(/[^\d+]/g, '');

  // Si no empieza con +, asumir que es un número local
  // Para números mexicanos, agregar +52 si no tiene código de país
  if (!normalizedPhone.startsWith('+')) {
    // Verificar si parece un número mexicano (10 dígitos)
    if (normalizedPhone.length === 10) {
      normalizedPhone = '+52' + normalizedPhone;
    } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('1')) {
      // Número de EE.UU. sin código de país
      normalizedPhone = '+' + normalizedPhone;
    }
  }

  // Validar que tenga al menos 10 dígitos (sin contar el +)
  const digitsOnly = normalizedPhone.replace(/[^\d]/g, '');
  if (digitsOnly.length < 10) {
    return null;
  }

  // Hashear con SHA-256
  return crypto.createHash('sha256').update(normalizedPhone).digest('hex');
}

/**
 * Genera un external_id único basado en la sesión o datos del usuario
 * Según Meta: +5.83% aumento en conversiones adicionales registradas
 * @param userId - ID del usuario si está disponible
 * @param sessionId - ID de sesión si está disponible
 * @param clientIp - IP del cliente como fallback
 * @returns External ID único o null
 */
export function generateExternalId(
  userId?: string | null,
  sessionId?: string | null,
  clientIp?: string | null
): string | null {
  // Priorizar userId si está disponible
  if (userId && typeof userId === 'string' && userId.trim()) {
    return `user_${userId.trim()}`;
  }

  // Usar sessionId como segunda opción
  if (sessionId && typeof sessionId === 'string' && sessionId.trim()) {
    return `session_${sessionId.trim()}`;
  }

  // Como último recurso, crear un ID basado en IP y timestamp
  if (clientIp && typeof clientIp === 'string' && clientIp.trim()) {
    const timestamp = Date.now();
    const ipHash = crypto.createHash('md5').update(clientIp.trim()).digest('hex').substring(0, 8);
    return `ip_${ipHash}_${timestamp}`;
  }

  return null;
}

/**
 * Valida y limpia un external_id proporcionado por el usuario
 * @param externalId - External ID a validar
 * @returns External ID limpio o null si es inválido
 */
export function validateExternalId(externalId: string | null | undefined): string | null {
  if (!externalId || typeof externalId !== 'string') {
    return null;
  }

  const cleaned = externalId.trim();
  
  // Debe tener al menos 1 carácter y máximo 64 caracteres
  if (cleaned.length === 0 || cleaned.length > 64) {
    return null;
  }

  // Solo permitir caracteres alfanuméricos, guiones y guiones bajos
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(cleaned)) {
    return null;
  }

  return cleaned;
}