'use client';

import { lazy, Suspense, ComponentType } from 'react';
import { cn } from '@/lib/utils';

/**
 * 🚀 LAZY LOADING INTELIGENTE
 * Componente para cargar dinámicamente otros componentes con fallbacks
 */

interface LazyComponentProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  className?: string;
  errorFallback?: React.ReactNode;
  delay?: number;
  [key: string]: any;
}

// Componente de loading por defecto
const DefaultLoadingFallback = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center p-8", className)}>
    <div className="flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Cargando...</p>
    </div>
  </div>
);

// Componente de error por defecto
const DefaultErrorFallback = ({ error, retry }: { error?: Error; retry?: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-12 h-12 text-red-500 mb-4">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar</h3>
    <p className="text-sm text-gray-600 mb-4">
      {error?.message || 'No se pudo cargar este contenido'}
    </p>
    {retry && (
      <button
        onClick={retry}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Intentar de nuevo
      </button>
    )}
  </div>
);

/**
 * Hook para lazy loading con retry
 */
export function useLazyComponent(
  loader: () => Promise<{ default: ComponentType<any> }>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  
  const loadWithRetry = async (retryCount = 0): Promise<{ default: ComponentType<any> }> => {
    try {
      return await loader();
    } catch (error) {
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return loadWithRetry(retryCount + 1);
      }
      throw error;
    }
  };
  
  return lazy(() => loadWithRetry());
}

/**
 * Componente LazyLoad inteligente
 */
export function LazyLoad({
  loader,
  fallback = <DefaultLoadingFallback />,
  errorFallback,
  className,
  delay = 0,
  ...props
}: LazyComponentProps) {
  const LazyComponent = useLazyComponent(loader);
  
  return (
    <Suspense 
      fallback={
        <div className={className}>
          {delay > 0 ? (
            <DelayedFallback delay={delay} fallback={fallback} />
          ) : (
            fallback
          )}
        </div>
      }
    >
      <ErrorBoundary fallback={errorFallback}>
        <LazyComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
}

/**
 * Componente para retrasar el fallback
 */
function DelayedFallback({ delay, fallback }: { delay: number; fallback: React.ReactNode }) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return show ? <>{fallback}</> : null;
}

/**
 * Error Boundary para componentes lazy
 */
class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <DefaultErrorFallback 
          error={this.state.error}
          retry={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }
    
    return this.props.children;
  }
}

/**
 * Presets de lazy loading para componentes comunes
 */
export const LazyPresets = {
  // Para modales y dialogs
  modal: (loader: () => Promise<{ default: ComponentType<any> }>) => (
    <LazyLoad
      loader={loader}
      fallback={
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <DefaultLoadingFallback />
          </div>
        </div>
      }
      delay={200}
    />
  ),
  
  // Para secciones de página
  section: (loader: () => Promise<{ default: ComponentType<any> }>) => (
    <LazyLoad
      loader={loader}
      fallback={<DefaultLoadingFallback className="min-h-[200px]" />}
      delay={100}
    />
  ),
  
  // Para componentes administrativos
  admin: (loader: () => Promise<{ default: ComponentType<any> }>) => (
    <LazyLoad
      loader={loader}
      fallback={
        <div className="p-6 bg-gray-50 rounded-lg">
          <DefaultLoadingFallback />
        </div>
      }
    />
  ),
};

// Utilidades para preload
export const preloadComponent = (loader: () => Promise<{ default: ComponentType<any> }>) => {
  const componentImport = loader();
  return componentImport;
};

import { useState, useEffect, Component } from 'react';
