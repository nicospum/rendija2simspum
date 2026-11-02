import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import HelpMode from './HelpMode'
import { isLabPath } from './helpPolicy'

/** The tutor has its own root and never owns the simulation state. */
export function mountLabHelp() {
  if (!isLabPath(location.pathname) || document.getElementById('spum-lab-help')) return
  const host = document.createElement('div')
  host.id = 'spum-lab-help'
  document.body.prepend(host)
  createRoot(host).render(createElement(HelpMode))
}
