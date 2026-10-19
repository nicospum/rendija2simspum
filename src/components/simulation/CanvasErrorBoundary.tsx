import { Component, type ErrorInfo, type ReactNode } from 'react'

/** Keep the controls, theory and recorded results usable if WebGL fails. */
export class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('No se pudo mostrar el banco 3D.', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      this.props.fallback ?? (
        <div className="canvas-error" role="alert">
          <h3>No se pudo iniciar la vista 3D</h3>
          <p>
            Los controles, las detecciones y el gráfico siguen disponibles. Probá reabrir el banco
            virtual.
          </p>
          <button type="button" onClick={() => this.setState({ hasError: false })}>
            Reintentar la vista 3D
          </button>
        </div>
      )
    )
  }
}
