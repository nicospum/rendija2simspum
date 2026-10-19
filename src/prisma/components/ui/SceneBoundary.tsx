import { Component, type ReactNode } from 'react'

export default class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error) { console.error('No se pudo iniciar la escena WebGL:', error) }
  render() {
    return this.state.failed ? <div className="scene-fallback"><strong>No se pudo iniciar la vista 3D</strong><p>Activá la aceleración gráfica o probá otro navegador. Los controles y las lecturas del modelo siguen disponibles.</p><button className="button" onClick={() => this.setState({ failed: false })}>Reintentar vista 3D</button></div> : this.props.children
  }
}
