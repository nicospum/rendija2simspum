export default function ExperimentIllustration({ kind }: { kind: 'doble-rendija' | 'prisma' }) {
  return (
    <svg viewBox="0 0 560 296" aria-hidden="true" className="experiment-illustration">
      <defs>
        <pattern id={`${kind}-grid`} width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="#9dafaa" strokeOpacity=".08" strokeWidth=".8" />
        </pattern>
        <linearGradient id={`${kind}-fade`}>
          <stop stopColor="#babdfc" stopOpacity=".65" />
          <stop offset="1" stopColor="#babdfc" stopOpacity=".08" />
        </linearGradient>
        <linearGradient id={`${kind}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#dcefe5" stopOpacity=".25" />
          <stop offset=".6" stopColor="#dcefe5" stopOpacity=".03" />
          <stop offset="1" stopColor="#dcefe5" stopOpacity=".2" />
        </linearGradient>
        <clipPath id={`${kind}-field`}>
          <path d="M233 50H490V260H233z" />
        </clipPath>
      </defs>
      <path fill={`url(#${kind}-grid)`} d="M0 0h560v296H0z" />
      <path d="M44 257H516" stroke="#71887b" strokeOpacity=".3" />
      {kind === 'doble-rendija' ? (
        <>
          <g
            clipPath={`url(#${kind}-field)`}
            fill="none"
            stroke={`url(#${kind}-fade)`}
            strokeWidth="1.1"
          >
            {Array.from({ length: 13 }, (_, i) => (
              <g key={i}>
                <circle cx="232" cy="120" r={24 + i * 25} />
                <circle cx="232" cy="183" r={24 + i * 25} />
              </g>
            ))}
          </g>
          <g stroke="#a5acf3" strokeOpacity=".32" fill="none">
            {[45, 79, 113].map((r) => (
              <path
                key={r}
                d={`M${85 + r * 0.7} ${151 - r}Q${85 + r * 1.4} 151 ${85 + r * 0.7} ${151 + r}`}
              />
            ))}
          </g>
          <path d="M88 151H224" stroke="#d1d1ff" strokeWidth="1.6" strokeDasharray="3 7" />
          <circle
            cx="82"
            cy="151"
            r="22"
            fill="#929cfc"
            fillOpacity=".08"
            stroke="#969fea"
            strokeOpacity=".45"
          />
          <circle cx="82" cy="151" r="9" fill="#c7cbff" />
          <path d="M231 64V110m0 20v43m0 20v49" stroke="#687784" strokeWidth="9" />
          <path d="M231 110v20m0 43v20" stroke="#cbcfff" strokeWidth="3" />
          <path d="M491 62v181" stroke="#647a79" strokeWidth="5" />
          {Array.from({ length: 75 }, (_, i) => {
            const y = 70 + i * 2.2
            const brightness =
              Math.pow(Math.cos((y - 151) / 12), 2) * Math.exp(-Math.pow((y - 151) / 85, 2))
            return (
              <path
                key={i}
                d={`M${483 - (i % 3)} ${y}h8`}
                stroke="#c9ccff"
                strokeWidth="1.6"
                opacity={brightness}
              />
            )
          })}
          <g fill="#91a5a3" fontFamily="Consolas, monospace" fontSize="8" letterSpacing="1.3">
            <text x="59" y="281">
              EMISOR
            </text>
            <text x="198" y="281">
              RENDIJAS
            </text>
            <text x="462" y="281">
              PANTALLA
            </text>
          </g>
        </>
      ) : (
        <>
          <path d="M61 170H216" stroke="#f7f5de" strokeOpacity=".08" strokeWidth="17" />
          <path d="M61 170H216" stroke="#f7f5de" strokeOpacity=".32" strokeWidth="5" />
          <path d="M61 170H216" stroke="#f7f5de" strokeWidth="1.5" />
          <path
            d="m250 57-89 169h178L250 57Z"
            fill={`url(#${kind}-glass)`}
            stroke="#adc9c0"
            strokeOpacity=".66"
            strokeWidth="1.2"
          />
          <path
            d="m250 57 18 161 71 8m-178 0 107-8"
            fill="none"
            stroke="#b9d7cb"
            strokeOpacity=".17"
          />
          {['#b29cf1', '#8b9df0', '#72bad7', '#86c6aa', '#bbce81', '#e4c777', '#df947b'].map(
            (color, i) => (
              <g key={color}>
                <path
                  d={`M191 170 294 ${174 + i * 2} 466 ${107 + i * 15}`}
                  fill="none"
                  stroke={color}
                  strokeOpacity=".09"
                  strokeWidth="12"
                />
                <path
                  d={`M191 170 294 ${174 + i * 2} 466 ${107 + i * 15}`}
                  fill="none"
                  stroke={color}
                  strokeOpacity=".85"
                  strokeWidth="1.3"
                />
                <path d={`M466 ${103 + i * 15}v9`} stroke={color} strokeWidth="5" />
              </g>
            ),
          )}
          <path d="M470 67v177" stroke="#8aa39b" strokeOpacity=".44" strokeWidth="3" />
          <path d="M42 158v24h20v-24H42Z" fill="#a9b9a9" />
          <path d="M38 151v38M52 182v60m-17 0h35" stroke="#71877c" strokeWidth="3" />
          <g fill="#91a5a3" fontFamily="Consolas, monospace" fontSize="8" letterSpacing="1.3">
            <text x="35" y="281">
              LUZ BLANCA
            </text>
            <text x="232" y="281">
              PRISMA
            </text>
            <text x="445" y="281">
              ESPECTRO
            </text>
          </g>
        </>
      )}
    </svg>
  )
}
