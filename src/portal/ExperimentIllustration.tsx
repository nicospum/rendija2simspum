export default function ExperimentIllustration({
  kind,
}: {
  kind: 'doble-rendija' | 'prisma' | 'hawking' | 'lente-gravitacional' | 'entropia' | 'acrecion' | 'horizonte' | 'reloj-de-luz' | 'tren-de-einstein' | 'nos-vemos-a-la-vuelta'
}) {
  if(kind==='nos-vemos-a-la-vuelta')return <svg viewBox="0 0 560 296" aria-hidden="true" className="experiment-illustration">
    <path d="M100 223V43M100 223 320 133 100 43" stroke="#99e4db" strokeWidth="3" fill="none"/><path d="M100 223V43" stroke="#f2bd8c" strokeWidth="4"/><path d="m320 133-220 35" stroke="#eab4de" strokeDasharray="5 5"/><circle cx="100" cy="223" r="6" fill="#f2bd8c"/><circle cx="100" cy="43" r="6" fill="#9ee9df"/><path d="m297 123 34 10-34 10 5-10Z" fill="#bdeee1"/>
    {([['10',430,99,'#f2bd8c'],['6',430,195,'#99e4db']] as const).map(([value,x,y,color])=><g key={value}><circle cx={x} cy={y} r="37" fill="#123140" stroke={color}/><text x={x} y={Number(y)+8} textAnchor="middle" fill={color} fontFamily="Georgia" fontSize="26">{value}</text></g>)}
    <g fill="#afcbd6" fontFamily="Consolas,monospace" fontSize="10" letterSpacing="1.2"><text x="32" y="270">DOS RECORRIDOS / TIEMPO PROPIO</text><text x="407" y="270">CUATRO RETOS</text></g>
  </svg>
  if(kind==='tren-de-einstein')return <svg viewBox="0 0 560 296" aria-hidden="true" className="experiment-illustration">
    <path d="M30 201H530M30 214H530" stroke="#638a9c"/>{[50,90,130,170,210,250,290,330,370,410,450,490].map(x=><path key={x} d={`M${x} 200l14 17`} stroke="#486b7e"/>)}
    <rect x="100" y="105" width="360" height="82" rx="17" fill="#214355" stroke="#9cdad9"/>{[135,210,285,360,425].map(x=><g key={x}><rect x={x} y="121" width="25" height="24" rx="4" fill="#82cec9" opacity=".4"/><circle cx={x+10} cy="193" r="8" fill="#122635" stroke="#8ab3c2"/></g>)}
    <path d="M100 154H275m10 0H460" stroke="#e7c18d" strokeWidth="2" strokeDasharray="4 5"/><circle cx="210" cy="154" r="6" fill="#f4d3a0"/><circle cx="360" cy="154" r="6" fill="#eeb6ce"/>
    <path d="M100 91V79H460V91M240 61h70m-8-6 8 6-8 6" stroke="#a4dfd9" fill="none"/>
    <g fill="#afcbd6" fontFamily="Consolas,monospace" fontSize="10" letterSpacing="1.2"><text x="32" y="270">FECHAS / SEÑALES / LONGITUDES</text><text x="407" y="270">CUATRO RETOS</text></g>
  </svg>
  if (kind === 'reloj-de-luz') return <svg viewBox="0 0 560 296" aria-hidden="true" className="experiment-illustration">
    <g stroke="#7799a9" opacity=".2">{[75,125,175,225].map(y=><path key={y} d={`M25 ${y}H535`} />)}{[50,100,150,200,250,300,350,400,450,500].map(x=><path key={x} d={`M${x} 45V245`} />)}</g>
    <path d="M62 214h80M62 78h80" stroke="#a0eade" strokeWidth="4" /><path d="M102 214V78V214" stroke="#a0eade" strokeWidth="2" /><circle cx="102" cy="127" r="6" fill="#ecf9dc" />
    <path d="M249 214h64M351 78h64M453 214h64" stroke="#f3bd8d" strokeWidth="4" /><path d="M281 214 383 78 485 214" stroke="#f3bd8d" strokeWidth="2" strokeDasharray="5 5" fill="none" /><path d="M281 214 350 122" stroke="#f3bd8d" strokeWidth="3" fill="none" /><circle cx="350" cy="122" r="6" fill="#fff2c9" />
    <path d="M270 51H350m-8-6 8 6-8 6" stroke="#afcdd4" fill="none" />
    <g fill="#b1ced4" fontFamily="Consolas,monospace" fontSize="10" letterSpacing="1.2"><text x="45" y="270">UN PULSO / DOS SISTEMAS</text><text x="405" y="270">CUATRO RETOS</text></g>
  </svg>
  if (kind === 'horizonte') return <svg viewBox="0 0 560 296" aria-hidden="true" className="experiment-illustration">
    <defs><radialGradient id="hz-portal-glow"><stop offset=".6" stopColor="#091625" /><stop offset=".67" stopColor="#8de0d550" /><stop offset="1" stopColor="#0e243200" /></radialGradient></defs>
    <circle cx="190" cy="147" r="113" fill="url(#hz-portal-glow)" /><circle cx="190" cy="147" r="74" fill="#030a12" stroke="#8de0d5" />
    <path d="M280 147H450" stroke="#668a9a" strokeDasharray="4 7" />
    {[315,352,401].map((x,i)=><circle key={x} cx={x} cy="147" r="4" fill={['#f5896f','#efb889','#e8d39d'][i]} />)}
    <path d="M272 147L288 139H300V155H288Z" fill="#234756" stroke="#cbede2" /><path d="M441 126Q460 147 441 168M450 134Q461 147 450 160M460 147H481M481 124V170" stroke="#b4e9e0" fill="none" strokeWidth="1.6" />
    <g fill="#b4cbd4" fontFamily="Consolas,monospace" fontSize="10" letterSpacing="1.2"><text x="32" y="270">CAÍDA / RELOJES / LUZ</text><text x="403" y="270">CUATRO RETOS</text></g>
  </svg>
  if (kind === 'acrecion') return (
    <svg viewBox="0 0 560 296" aria-hidden="true" className="experiment-illustration">
      <defs><radialGradient id="ac-portal-glow"><stop stopColor="#f6dcaa" /><stop offset=".5" stopColor="#ed9c60" /><stop offset="1" stopColor="#dc965b00" /></radialGradient></defs>
      <ellipse cx="280" cy="152" rx="200" ry="67" fill="url(#ac-portal-glow)" opacity=".8" />
      <ellipse cx="280" cy="152" rx="171" ry="40" fill="none" stroke="#f0c893" strokeWidth="4" />
      <circle cx="280" cy="141" r="49" fill="#081221" />
      <path d="M226 144a54 54 0 0 1 108 0" fill="none" stroke="#f0c893" strokeWidth="5" />
      <path d="M110 153q170 57 340 0" fill="none" stroke="#fbe2b7" strokeWidth="4" />
      <g fill="#a9c3cc" fontFamily="Consolas,monospace" fontSize="10" letterSpacing="1.5"><text x="32" y="270">GAS / LUZ / MASA INVISIBLE</text><text x="407" y="270">CUATRO RETOS</text></g>
    </svg>
  )
  if (kind === 'entropia')
    return (
      <svg viewBox="0 0 560 296" aria-hidden="true" className="experiment-illustration">
        <defs>
          <radialGradient id="entropy-portal-body" cx="30%" cy="25%">
            <stop stopColor="#485648" />
            <stop offset="1" stopColor="#060f16" />
          </radialGradient>
          <clipPath id="entropy-portal-clip">
            <circle cx="207" cy="142" r="86" />
          </clipPath>
        </defs>
        <circle cx="207" cy="142" r="86" fill="url(#entropy-portal-body)" stroke="#dec187" />
        <g
          clipPath="url(#entropy-portal-clip)"
          fill="none"
          stroke="#cbb17b"
          strokeWidth=".8"
          opacity=".65"
        >
          {[28, 55, 77].map((r) => (
            <ellipse key={r} cx="207" cy="142" rx={r} ry="86" />
          ))}
          {[-62, -32, 0, 32, 62].map((y) => (
            <ellipse key={y} cx="207" cy={142 + y} rx="90" ry="17" />
          ))}
        </g>
        <path d="M315 142h35m-7-6 7 6-7 6" fill="none" stroke="#8caab8" />
        {Array.from({ length: 16 }, (_, i) => (
          <rect
            key={i}
            x={375 + (i % 4) * 15}
            y={108 + Math.floor(i / 4) * 15}
            width="13"
            height="13"
            fill="#e1c18820"
            stroke="#e1c188"
            strokeWidth=".7"
          />
        ))}
        <text
          x="404"
          y="201"
          textAnchor="middle"
          fill="#e1c188"
          fontSize="20"
          fontFamily="Georgia,serif"
        >
          S ∝ A
        </text>
        <g fill="#a9c3cc" fontFamily="Consolas,monospace" fontSize="9" letterSpacing="1.5">
          <text x="35" y="271">
            ÁREA / ENTROPÍA
          </text>
          <text x="346" y="271">
            CUATRO RETOS
          </text>
        </g>
      </svg>
    )
  if (kind === 'lente-gravitacional')
    return (
      <svg viewBox="0 0 560 296" aria-hidden="true" className="experiment-illustration">
        <defs>
          <radialGradient id="lens-portal-glow">
            <stop stopColor="#edbf7d" stopOpacity=".4" />
            <stop offset="1" stopColor="#edbf7d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="280" cy="150" r="105" fill="url(#lens-portal-glow)" />
        <circle
          cx="280"
          cy="150"
          r="78"
          fill="none"
          stroke="#f0c584"
          strokeWidth="2.5"
          opacity=".9"
        />
        <circle cx="280" cy="150" r="34" fill="#03080f" />
        {Array.from({ length: 32 }, (_, i) => (
          <circle
            key={i}
            cx={30 + ((i * 83) % 500)}
            cy={40 + ((i * 47) % 205)}
            r={i % 3 === 0 ? 1.6 : 0.8}
            fill="#afcbd7"
            opacity=".6"
          />
        ))}
        <path
          d="M475 150C340 148 350 20 276 40S154 136 62 104M475 150C340 152 350 280 276 260S154 164 62 196"
          fill="none"
          stroke="#77aebe"
          strokeWidth="1.4"
          opacity=".65"
        />
        <g fill="#a9c3cc" fontFamily="Consolas,monospace" fontSize="9" letterSpacing="1.5">
          <text x="35" y="271">
            CURVAR LA LUZ
          </text>
          <text x="359" y="271">
            DOS VISTAS / UNA FÍSICA
          </text>
        </g>
      </svg>
    )
  if (kind === 'hawking')
    return (
      <svg viewBox="0 0 560 296" aria-hidden="true" className="experiment-illustration">
        <defs>
          <radialGradient id="hawking-glow">
            <stop stopColor="#caa571" stopOpacity=".3" />
            <stop offset="1" stopColor="#caa571" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="280" cy="150" rx="235" ry="80" fill="none" stroke="#799a9f" opacity=".15" />
        {[65, 95, 130, 175, 225].map((radius) => (
          <ellipse
            key={radius}
            cx="280"
            cy="150"
            rx={radius}
            ry={radius * 0.37}
            fill="none"
            stroke="#799a9f"
            opacity=".18"
          />
        ))}
        <circle cx="280" cy="145" r="108" fill="url(#hawking-glow)" />
        <circle cx="280" cy="145" r="56" fill="#070e14" stroke="#dfbb84" strokeWidth="1.5" />
        {Array.from({ length: 23 }, (_, i) => {
          const angle = i * 2.39996,
            radius = 70 + (i % 5) * 22
          return (
            <circle
              key={i}
              cx={280 + Math.cos(angle) * radius}
              cy={145 + Math.sin(angle) * radius * 0.75}
              r={i % 3 === 0 ? 1.8 : 1}
              fill="#dfbb84"
              opacity=".7"
            />
          )
        })}
        <g fontFamily="Consolas, monospace" fontSize="9" fill="#9fb2b2" letterSpacing="1.5">
          <text x="42" y="271">
            T ∝ 1/M
          </text>
          <text x="365" y="271">
            MODELO TEÓRICO
          </text>
        </g>
      </svg>
    )
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
