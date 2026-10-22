/** An accessible object action. Non-scaling stroke keeps the target usable on a small SVG. */
export default function SceneAction({
  x,
  y,
  label,
  onActivate,
}: {
  x: number
  y: number
  label: string
  onActivate: () => void
}) {
  return (
    <circle
      cx={x}
      cy={y}
      r="4"
      fill="transparent"
      stroke="transparent"
      strokeWidth="44"
      vectorEffect="non-scaling-stroke"
      className="spum-scene-action"
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onActivate()
        }
      }}
    >
      <title>{label}</title>
    </circle>
  )
}
