export type ArtifactKind =
  | 'clock'
  | 'light'
  | 'train'
  | 'map'
  | 'cabin'
  | 'scale'
  | 'earth'
  | 'orbit'
  | 'metal'
  | 'meter'
  | 'mirror'
  | 'horizon'
  | 'disk'
  | 'heat'
  | 'area'
export default function Artifact({ kind }: { kind: ArtifactKind }) {
  return (
    <svg viewBox="0 0 140 110" aria-hidden="true" className="en-artifact">
      <circle cx="70" cy="55" r="48" fill="currentColor" opacity=".08" />
      {kind === 'clock' && (
        <>
          <circle
            cx="70"
            cy="55"
            r="33"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M70 32V55L90 66M70 17V22M70 88V93M32 55H37M103 55H108"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle cx="70" cy="55" r="4" fill="currentColor" />
        </>
      )}
      {kind === 'light' && (
        <>
          <path
            d="M20 58Q30 22 40 58T60 58T80 58T100 58T120 58"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle cx="52" cy="47" r="7" fill="currentColor" />
          <path
            d="M95 23H117L108 14M117 23 108 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </>
      )}
      {kind === 'train' && (
        <>
          <rect
            x="22"
            y="31"
            width="96"
            height="43"
            rx="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          {[35, 57, 79, 101].map((x) => (
            <rect
              key={x}
              x={x}
              y="41"
              width="11"
              height="14"
              rx="2"
              fill="currentColor"
              opacity=".5"
            />
          ))}
          <path d="M15 87H125" stroke="currentColor" strokeWidth="2" />
          {[40, 100].map((x) => (
            <circle key={x} cx={x} cy="77" r="7" fill="currentColor" />
          ))}
        </>
      )}
      {kind === 'map' && (
        <>
          <path
            d="M30 91V18M30 91 110 55 30 18M24 24 30 18 36 24M30 91H120"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M30 72 110 55"
            stroke="currentColor"
            strokeDasharray="4 5"
          />
          <circle cx="110" cy="55" r="5" fill="currentColor" />
        </>
      )}
      {kind === 'cabin' && (
        <>
          <rect
            x="31"
            y="19"
            width="78"
            height="74"
            rx="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M70 4V19M39 91H101M52 35V65M85 35V65"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="3 4"
          />
          <circle cx="52" cy="65" r="7" fill="currentColor" />
          <circle cx="85" cy="65" r="7" fill="currentColor" opacity=".5" />
        </>
      )}
      {kind === 'scale' && (
        <>
          <path
            d="M70 26V91M41 91H99M25 31H115M38 31 23 63H53ZM102 31 87 63H117Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <circle cx="70" cy="25" r="6" fill="currentColor" />
        </>
      )}
      {kind === 'earth' && (
        <>
          <circle
            cx="60"
            cy="61"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="m43 37 18 9 1 15 17 9-12 16-10-16-15-4Z"
            fill="currentColor"
            opacity=".5"
          />
          <ellipse
            cx="60"
            cy="61"
            rx="55"
            ry="41"
            fill="none"
            stroke="currentColor"
            strokeDasharray="4 5"
          />
          <path d="M102 25H117V40H102Z" fill="currentColor" />
          <path
            d="M91 26V39M126 26V39"
            stroke="currentColor"
            strokeWidth="5"
          />
        </>
      )}
      {kind === 'orbit' && (
        <>
          <ellipse
            cx="70"
            cy="55"
            rx="50"
            ry="29"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <ellipse
            cx="70"
            cy="55"
            rx="50"
            ry="29"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            transform="rotate(-25 55 55)"
            opacity=".5"
          />
          <circle cx="55" cy="55" r="9" fill="currentColor" />
          <circle cx="120" cy="55" r="4" fill="currentColor" />
        </>
      )}
      {kind === 'metal' && (
        <>
          <path d="M35 25V85H51V25Z" fill="currentColor" opacity=".5" />
          <path
            d="M110 20 52 53M110 72H62M110 87H62"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 5"
          />
          <circle cx="87" cy="72" r="5" fill="currentColor" />
          <circle cx="107" cy="87" r="5" fill="currentColor" />
        </>
      )}
      {kind === 'meter' && (
        <>
          <path
            d="M19 66H40M100 66H121"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle
            cx="70"
            cy="59"
            r="31"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M50 53Q70 33 90 53M70 68 84 47"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </>
      )}
      {kind === 'mirror' && (
        <>
          <path
            d="M36 20H104M36 90H104"
            stroke="currentColor"
            strokeWidth="5"
          />
          <path
            d="M70 83V27L63 37M70 27 77 37"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="70" cy="56" r="6" fill="currentColor" />
        </>
      )}
      {kind === 'horizon' && (
        <>
          <circle
            cx="70"
            cy="55"
            r="33"
            fill="#06111e"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="70"
            cy="55"
            r="43"
            fill="none"
            stroke="currentColor"
            strokeDasharray="3 5"
            opacity=".4"
          />
          <path
            d="M110 55H133M111 47 103 55 111 63"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </>
      )}
      {kind === 'disk' && (
        <>
          <ellipse
            cx="70"
            cy="59"
            rx="56"
            ry="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
          />
          <circle cx="70" cy="52" r="22" fill="#06111e" />
          <path
            d="M45 53a25 25 0 0 1 50 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            d="M16 59Q70 85 124 59"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
        </>
      )}
      {kind === 'heat' && (
        <>
          <path
            d="M27 83Q10 64 27 45T27 11M70 99Q53 80 70 61T70 27M113 83Q96 64 113 45T113 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle
            cx="70"
            cy="64"
            r="17"
            fill="#06111e"
            stroke="currentColor"
          />
        </>
      )}
      {kind === 'area' && (
        <>
          <circle
            cx="70"
            cy="55"
            r="38"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <ellipse
            cx="70"
            cy="55"
            rx="17"
            ry="38"
            fill="none"
            stroke="currentColor"
          />
          <ellipse
            cx="70"
            cy="55"
            rx="38"
            ry="14"
            fill="none"
            stroke="currentColor"
          />
          <path
            d="M43 28 97 82M43 82 97 28"
            stroke="currentColor"
            opacity=".5"
          />
        </>
      )}
    </svg>
  )
}
