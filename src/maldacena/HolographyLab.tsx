import { lazy, useEffect, useState } from 'react'
import { HolographyContext } from './HolographyContext'
import { resolveHolographySection } from './catalog'
import type { HolographySection } from './catalog'

const Geometry = lazy(() => import('./geometry/GeometryLab'))
const Duality = lazy(() => import('./geometry/DualityLab'))
const Thermal = lazy(() => import('./thermal/ThermalLab'))

export default function HolographyLab() {
  const [section, setSection] = useState(() =>
    resolveHolographySection(location.pathname, location.hash, location.search),
  )
  const [focusScene, setFocusScene] = useState(false)
  useEffect(() => {
    const sync = () => {
      const next = resolveHolographySection(
        location.pathname,
        location.hash,
        location.search,
      )
      setSection(next)
      // Keep the section when native scene/challenge anchors replace the hash.
      if (location.pathname.replace(/\/$/, '') === '/holografia') {
        const params = new URLSearchParams(location.search)
        params.set('seccion', next)
        history.replaceState(null, '', `/holografia/?${params}${location.hash}`)
      }
    }
    sync()
    addEventListener('popstate', sync)
    addEventListener('hashchange', sync)
    return () => {
      removeEventListener('popstate', sync)
      removeEventListener('hashchange', sync)
    }
  }, [])
  const navigate = (next: HolographySection, focusScene: boolean) => {
    if (next === section) return
    history.pushState(
      null,
      '',
      `/holografia/?seccion=${next}${focusScene ? '#md-challenges' : ''}`,
    )
    setFocusScene(focusScene)
    setSection(next)
  }
  return (
    <HolographyContext.Provider value={{ section, focusScene, navigate }}>
      {section === 'geometria' ? (
        <Geometry />
      ) : section === 'diccionario' ? (
        <Duality />
      ) : (
        <Thermal />
      )}
    </HolographyContext.Provider>
  )
}
