import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Componente ErrorBoundary específico para capturar errores en el Canvas de Three.js
 * Previene que errores en Three.js colapsen toda la aplicación y ofrece información
 * más detallada para facilitar la depuración.
 */
export class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Actualiza el estado para que el siguiente renderizado muestre la UI alternativa
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Registrar el error para diagnóstico
    console.error('Error en componente Canvas:', error);
    console.error('Stack trace:', errorInfo.componentStack);
    
    // Actualizar el estado con la información del error
    this.setState({
      errorInfo
    });
  }

  handleRetry = (): void => {
    // Limpiar el estado de error y forzar una re-renderización
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Renderizar UI alternativa con información de error
      return this.props.fallback || (
        <div className="canvas-error">
          <h3>Error en la visualización 3D</h3>
          <p>Ha ocurrido un problema al renderizar la escena.</p>
          {this.state.error && (
            <details>
              <summary>Detalles del error (para desarrolladores)</summary>
              <p>{this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <pre>{this.state.errorInfo.componentStack}</pre>
              )}
            </details>
          )}
          <button 
            onClick={this.handleRetry}
            className="error-reset-button"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 