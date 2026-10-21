import './einstein.css'
export default function EinsteinNavigation() {
  return (
    <nav className="es-navigation" aria-label="Índice del especial Einstein">
      <a href="/einstein/">
        <span>ESPECIAL EINSTEIN</span> Espacio, tiempo y gravedad{' '}
        <b>Ver el recorrido ↗</b>
      </a>
      <div>
        <span>01 · Relatividad especial</span>
        <a href="/reloj-de-luz/" aria-current="page">
          El reloj de luz
        </a>
        <a href="/agujeros-negros/">Conectar con agujeros negros →</a>
      </div>
    </nav>
  )
}
