import { redirect } from 'next/navigation';

// Esta página redirige automáticamente según el estado de autenticación
// El middleware se encarga de la lógica de redirección
export default function AdminRootPage() {
  // Esta página nunca se renderiza porque el middleware siempre redirige
  return null;
}
