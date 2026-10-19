export default function DoubleSlitDiscovery() {
  return (
    <section className="q-discovery" aria-labelledby="discovery-title">
      <div>
        <p className="q-eyebrow">POR QUÉ CAMBIÓ LA FÍSICA</p>
        <h2 id="discovery-title">De las ondas de luz a las probabilidades cuánticas.</h2>
        <p>
          Primero, la interferencia ayudó a entender la luz como onda. Después, los experimentos con
          partículas individuales plantearon otra pregunta: ¿cómo se forma un patrón de
          interferencia a partir de impactos que llegan de a uno?
        </p>
        <p className="q-history-scope">
          Los retos exploran un modelo ideal de esas ideas. No reproducen un único montaje histórico
          ni demuestran por sí solos una interpretación de la mecánica cuántica.
        </p>
      </div>
      <div className="q-history-body">
        <div className="q-discovery-cards">
          <article>
            <span>01 / EL PASO CLÁSICO</span>
            <h3>Luz más luz puede dar oscuridad</h3>
            <p>
              Dos ondas pueden reforzarse o cancelarse según su fase. Young explicó fenómenos de
              interferencia con una teoría ondulatoria de la luz, presentada en 1801 y publicada en
              1802. Las franjas aportaban una forma de poner esa teoría a prueba.
            </p>
            <a
              className="q-history-source"
              href="https://doi.org/10.1098/rstl.1802.0004"
              target="_blank"
              rel="noreferrer"
            >
              Young · trabajo original ↗
            </a>
          </article>
          <article>
            <span>02 / EL PASO CUÁNTICO</span>
            <h3>Un impacto a la vez, un patrón al acumular</h3>
            <p
              className="q-equation"
              role="math"
              aria-label="La probabilidad es proporcional al módulo cuadrado de la suma de las amplitudes A uno y A dos"
            >
              P ∝ |A₁ + A₂|²
            </p>
            <p>
              Sin información que distinga los caminos, se suman sus amplitudes. La probabilidad
              presenta máximos y mínimos, aunque cada detección sea localizada. Esa regla permite
              predecir estadísticas que no se obtienen sumando probabilidades de caminos clásicos.
            </p>
            <p>
              En 1989, Tonomura y colaboradores registraron esa acumulación con electrones
              individuales. Usaron un biprisma electrónico, que crea dos contribuciones coherentes;
              no una placa con dos rendijas como la de este esquema.
            </p>
            <a
              className="q-history-source"
              href="https://doi.org/10.1119/1.16104"
              target="_blank"
              rel="noreferrer"
            >
              Tonomura y colaboradores · 1989 ↗
            </a>{' '}
            <a
              className="q-history-source"
              href="https://www.hitachi.com/rd/research/materials/quantum/doubleslit/index.html"
              target="_blank"
              rel="noreferrer"
            >
              Hitachi · ver el registro ↗
            </a>
          </article>
          <article>
            <span>03 / QUÉ CAMBIA AL MEDIR</span>
            <h3>El registro del camino modifica el patrón</h3>
            <p
              className="q-equation"
              role="math"
              aria-label="La probabilidad es proporcional a la suma del módulo cuadrado de A uno y del módulo cuadrado de A dos"
            >
              P ∝ |A₁|² + |A₂|²
            </p>
            <p>
              Un detector ideal que distingue completamente las dos alternativas elimina sus
              términos de interferencia. Queda la difracción de cada abertura. El cambio requiere
              una interacción física que deje información del camino; no depende de que una persona
              lea el registro.
            </p>
            <a
              className="q-history-source"
              href="https://www.feynmanlectures.caltech.edu/III_03.html#Ch3-S2"
              target="_blank"
              rel="noreferrer"
            >
              Feynman · amplitudes y medición ↗
            </a>
          </article>
        </div>
        <div className="q-history-faq" aria-label="Preguntas para interpretar el experimento">
          <details>
            <summary>¿Basta con mirar la pantalla para quitar la interferencia?</summary>
            <p>
              La pantalla siempre registra dónde llega cada partícula. El detector de los retos
              añade otra medición: por cuál abertura pasa. Mirar los impactos no aporta ese registro
              del camino ni cambia por sí solo la distribución.
            </p>
          </details>
          <details>
            <summary>¿El detector borra los puntos anteriores?</summary>
            <p>
              Los impactos ya registrados permanecen. Aquí, cambiar un parámetro físico inicia otra
              corrida para comparar montajes sin mezclar sus datos. Limpiar la pantalla es una
              acción de la aplicación; no un efecto retroactivo del detector.
            </p>
          </details>
          <details>
            <summary>¿Podemos saber por dónde pasó una partícula sin medirlo?</summary>
            <p>
              Un punto en la pantalla no reconstruye su trayectoria. Este modelo calcula
              probabilidades de llegada y no asigna un camino oculto a cada evento. El campo
              dibujado ilustra fases, no el recorrido observado de una partícula.
            </p>
          </details>
          <details>
            <summary>¿La simulación es una prueba experimental?</summary>
            <p>
              Los impactos se sortean según las probabilidades del modelo. Los retos permiten
              entender sus consecuencias y distinguir predicciones de datos acumulados; la evidencia
              física procede de experimentos reales.
            </p>
            <a
              className="q-history-source"
              href="https://www.feynmanlectures.caltech.edu/III_01.html#Ch1-S5"
              target="_blank"
              rel="noreferrer"
            >
              Feynman · cómo interpretar la interferencia ↗
            </a>
          </details>
        </div>
      </div>
    </section>
  )
}
