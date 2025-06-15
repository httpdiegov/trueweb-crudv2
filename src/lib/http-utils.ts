// Configuración global para deshabilitar la verificación de certificados en desarrollo
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  // Agregar polyfill para fetch global si es necesario
  if (!global.fetch) {
    global.fetch = require('node-fetch');
  }
}

export function normalizeImageUrl(url: string | undefined): string {
  const placeholderUrl = 'https://placehold.co/400x400.png';
  
  if (!url) return placeholderUrl;
  
  try {
    // Si la URL ya es válida, usarla directamente
    new URL(url);
    
    // No forzar ningún protocolo, dejar que el navegador maneje http/https
    // Solo asegurarnos de que el dominio sea consistente
    let normalizedUrl = url;
    

    
    return normalizedUrl;
  } catch (e) {
    // Si la URL no es válida, intentar arreglarla
    try {
      // Si falta el protocolo, agregar https
    
    
      
      // Verificar que la URL sea válida
      new URL(url);
      return url;
    } catch (e) {
      console.error('Error normalizando URL:', url, e);
      return placeholderUrl;
    }
  }
}

export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Si la respuesta es exitosa, retornarla
    if (response.ok) return response;
    
    // Si hay un error 404 y tenemos reintentos disponibles, intentar con el dominio alternativo

    
    return response;
  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
}
