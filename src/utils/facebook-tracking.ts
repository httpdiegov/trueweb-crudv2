/**
 * Utilidades para el tracking de Facebook (Meta Pixel y Conversions API)
 * Maneja la captura y conversión de parámetros de tracking de Facebook
 */

/**
 * Extrae el parámetro fbclid de la URL actual
 * @returns El valor de fbclid si existe, undefined si no
 */
export function getFbclidFromUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('fbclid') || undefined;
}

/**
 * Convierte fbclid a formato fbc según las especificaciones de Meta
 * El formato fbc es: fb.{subdominio}.{timestamp}.{fbclid}
 * @param fbclid El identificador de clic de Facebook
 * @returns El valor fbc formateado
 */
export function convertFbclidToFbc(fbclid: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const subdomain = getSubdomain();
  return `fb.${subdomain}.${timestamp}.${fbclid}`;
}

/**
 * Obtiene el subdominio actual o '1' como fallback
 * @returns El subdominio o '1' si no hay subdominio
 */
function getSubdomain(): string {
  if (typeof window === 'undefined') return '1';
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Si hay más de 2 partes, el primer elemento es el subdominio
  if (parts.length > 2) {
    return parts[0];
  }
  
  // Fallback para dominios sin subdominio
  return '1';
}

/**
 * Obtiene el valor fbc desde cookies o genera uno nuevo desde fbclid
 * @returns El valor fbc si está disponible
 */
export function getFbc(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  // Primero intentar obtener fbc de las cookies
  const fbcFromCookie = getCookie('_fbc');
  if (fbcFromCookie) {
    return fbcFromCookie;
  }
  
  // Si no hay fbc en cookies, intentar generar desde fbclid
  const fbclid = getFbclidFromUrl();
  if (fbclid) {
    const fbc = convertFbclidToFbc(fbclid);
    // Guardar en cookie para futuras referencias
    setCookie('_fbc', fbc, 90); // 90 días como recomienda Meta
    return fbc;
  }
  
  return undefined;
}

/**
 * Obtiene el valor fbp desde cookies
 * @returns El valor fbp si está disponible
 */
export function getFbp(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return getCookie('_fbp');
}

/**
 * Obtiene el valor de una cookie
 * @param name Nombre de la cookie
 * @returns El valor de la cookie o undefined
 */
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
}

/**
 * Establece una cookie
 * @param name Nombre de la cookie
 * @param value Valor de la cookie
 * @param days Días hasta la expiración
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Obtiene los datos de tracking de Facebook para enviar a la API de conversiones
 * @returns Objeto con fbp y fbc si están disponibles
 */
export function getFacebookTrackingData(): { fbp?: string; fbc?: string } {
  return {
    fbp: getFbp(),
    fbc: getFbc()
  };
}

/**
 * Inicializa el tracking de Facebook capturando fbclid si está presente
 * Debe llamarse al cargar la página
 */
export function initializeFacebookTracking(): void {
  if (typeof window === 'undefined') return;
  
  // Capturar fbc al cargar la página si hay fbclid
  const fbclid = getFbclidFromUrl();
  if (fbclid) {
    const fbc = convertFbclidToFbc(fbclid);
    setCookie('_fbc', fbc, 90);
    
    // Limpiar fbclid de la URL para evitar que se propague
    const url = new URL(window.location.href);
    url.searchParams.delete('fbclid');
    window.history.replaceState({}, document.title, url.toString());
  }
}