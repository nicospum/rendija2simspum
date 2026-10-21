export interface ObservationStep {
  label: string
  done: boolean
}

/** Describe the current trial, independently of achievements from previous visits. */
export function challengeGuide(
  prediction: string | undefined,
  steps: readonly ObservationStep[],
  automatic = false,
) {
  const missing = steps.find((step) => !step.done)
  if (prediction === undefined)
    return {
      phase: 'predict',
      prompt:
        'Elegí qué creés que va a pasar. No necesitás saber la respuesta: después podés cambiar de idea.',
      action: 'Elegir mi predicción ↓',
    }
  if (missing)
    return {
      phase: 'observe',
      prompt: `Te falta probar: ${missing.label}`,
      action: 'Volver a mi pregunta ↓',
    }
  return {
    phase: 'explain',
    prompt: automatic
      ? 'Comparación lista. Volvé a la pregunta: revisá tu idea con el resultado. La huella se guarda cuando la explicación coincide.'
      : 'Comparación lista. Volvé a la pregunta y tocá «Comprobar» para revisar tu explicación y guardar el descubrimiento.',
    action: 'Revisar mi explicación ↓',
  }
}
