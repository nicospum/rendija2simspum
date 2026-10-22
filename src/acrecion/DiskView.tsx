import { useSurfaceScrub } from '../shared/useSurfaceScrub'
import { scrubKey } from '../shared/sceneInteraction'
import { dialValue } from './interaction'
import { Component, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  DataTexture,
  FloatType,
  LinearFilter,
  RedFormat,
  ShaderMaterial,
  Vector2,
} from 'three'
import {
  buildDiskMap,
  MAX_ANGLE,
  MAX_PHI,
  OBSERVER,
  PEAK_RADIUS,
} from './physics'
import type { Setup } from './physics'

const fragment = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uMap;
uniform vec2 uMapSize;
uniform vec2 uSize;
uniform float uInclination,uGas,uDoppler,uLens,uTime;
const float PI=3.141592653589793;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 sky(vec2 p){
  vec2 q=p*vec2(130.,100.);vec2 cell=floor(q);
  vec2 delta=fract(q)-vec2(.2+.6*hash(cell),.2+.6*hash(cell+43.));
  float star=exp(-dot(delta,delta)*160.)*pow(hash(cell+8.),18.);
  float cloud=exp(-pow((p.y-.3*p.x+.12)/.22,2.));
  return vec3(.0003,.0006,.0014)+vec3(.001,.002,.004)*cloud+vec3(.5,.65,.85)*star;
}
float radiusAt(float angle,float phi){
  vec2 t=vec2(angle/${MAX_ANGLE},phi/${MAX_PHI});
  vec2 uv=(clamp(t,0.,1.)*(uMapSize-1.)+.5)/uMapSize;
  float u=texture2D(uMap,uv).r;
  return u>.00001?1./u:1000.;
}
void main(){
  float aspect=uSize.x/uSize.y;
  vec2 p=(vUv-.5)*2.*vec2(aspect,1.);
  float tanFov=.70/min(aspect,1.5);
  float angle=atan(length(p)*tanFov);
  vec2 e=length(p)>.000001?normalize(p):vec2(1.,0.);
  float si=sin(uInclination),co=cos(uInclination);
  vec3 O=vec3(0.,-si,co),E=vec3(e.x,e.y*co,e.y*si);
  vec3 hit=vec3(0.);float r=1000.;float phi=0.;
  float impact=${OBSERVER}.*sin(angle)/sqrt(1.-1./${OBSERVER}.);
  if(uLens>.5){
    float first=atan(-co,e.y*si);
    if(first<=0.)first+=PI;
    for(int k=0;k<3;k++){
      float trial=first+float(k)*PI;
      float candidate=radiusAt(angle,trial);
      if(candidate>3.002&&candidate<14.){
        r=candidate;phi=trial;hit=r*(cos(phi)*O+sin(phi)*E);break;
      }
    }
  }else{
    vec3 d=-cos(angle)*O+sin(angle)*E;
    float t=-${OBSERVER}.*co/d.z;
    vec3 candidate=${OBSERVER}.*O+t*d;
    float radius=length(candidate);
    float closest=${OBSERVER}.*cos(angle);
    float b=${OBSERVER}.*sin(angle);
    bool occulted=b<1.&&t>closest-sqrt(max(0.,1.-b*b));
    if(t>0.&&radius>3.002&&radius<14.&&!occulted){r=radius;hit=candidate;}
  }
  vec3 color=sky(p);
  float shadow=uLens>.5?2.598076211:1.;
  if(impact<shadow)color=vec3(.0001,.0002,.0005);
  if(r<15.&&uGas>0.){
    float az=atan(hit.y,hit.x);
    float omega=1./sqrt(2.*r*r*r);
    float g=sqrt((1.-1./r)/(1.-1./${OBSERVER}.));
    if(uDoppler>.5){
      // lambda = -impact * sin(i) * screen-right component.
      g=sqrt((1.-1.5/r)/(1.-1./${OBSERVER}.))/(1.+omega*impact*si*e.x);
    }
    float flux=pow(${PEAK_RADIUS}/r,3.)*(1.-sqrt(3./r))/(1.-sqrt(3./${PEAK_RADIUS}));
    // Differential orbital advection; visual time is slowed, not physical seconds.
    float phase=az-uTime*omega*20.;
    float texture=.76+.13*sin(phase*19.+r*10.)+.08*sin(phase*41.-r*17.);
    float bands=.93+.07*sin(r*42.+sin(phase*7.));
    float intensity=max(0.,flux)*uGas*pow(g,4.)*texture*bands;
    // False color distinguishes received frequency shifts; not an RGB spectrum.
    vec3 warm=mix(vec3(1.,.22,.035),vec3(1.,.78,.35),clamp((g-.5)*1.6,0.,1.));
    vec3 hue=mix(warm,vec3(.48,.8,1.),smoothstep(.98,1.3,g));
    color+=hue*intensity*4.;
  }
  color=1.-exp(-color*1.7);
  gl_FragColor=vec4(pow(color,vec3(.4545)),1.);
}`

type Map = ReturnType<typeof buildDiskMap>
function Field({
  map,
  setup,
  playing,
}: {
  map: Map
  setup: Setup
  playing: boolean
}) {
  const ref = useRef<ShaderMaterial>(null)
  const invalidate = useThree((s) => s.invalidate)
  const time = useRef(0)
  const texture = useMemo(() => {
    const t = new DataTexture(
      map.data,
      map.width,
      map.height,
      RedFormat,
      FloatType,
    )
    t.minFilter = LinearFilter
    t.magFilter = LinearFilter
    t.needsUpdate = true
    return t
  }, [map])
  useEffect(() => () => texture.dispose(), [texture])
  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uMapSize: { value: new Vector2(map.width, map.height) },
      uSize: { value: new Vector2(1, 1) },
      uInclination: { value: 0 },
      uGas: { value: 0 },
      uDoppler: { value: 1 },
      uLens: { value: 1 },
      uTime: { value: 0 },
    }),
    [texture, map.width, map.height],
  )
  useEffect(() => {
    invalidate()
  }, [setup, playing, invalidate])
  useFrame(({ size }, delta) => {
    if (!ref.current) return
    const u = ref.current.uniforms
    if (playing) time.current += Math.min(delta, 0.05)
    u.uTime.value = time.current
    u.uSize.value.set(size.width, size.height)
    u.uInclination.value = (setup.inclination * Math.PI) / 180
    u.uGas.value = (setup.gas / 100) * (4 / setup.mass) ** 2
    u.uDoppler.value = Number(setup.doppler)
    u.uLens.value = Number(setup.lens)
    if (playing) invalidate()
  })
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={ref}
        uniforms={uniforms}
        fragmentShader={fragment}
        vertexShader="varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}"
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}
function Fallback() {
  return (
    <p className="ac-fallback">
      El visor necesita WebGL 2. Los controles, la órbita y los cálculos
      siguen disponibles. Probá recargar o usar otro navegador para ver el
      disco.
    </p>
  )
}
class Boundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children
  }
}
export default function DiskView({
  setup,
  playing,
  onTune,
}: {
  setup: Setup
  playing: boolean
  onTune?: (patch: Partial<Setup>) => void
}) {
  const area = useRef<HTMLDivElement>(null)
  const tilt = useSurfaceScrub(area, (p) => {
    const v = dialValue(p.y, 82)
    if (v !== null) onTune?.({ inclination: v })
  })
  const gas = useSurfaceScrub(area, (p) => {
    const v = dialValue(p.y, 100)
    if (v !== null) onTune?.({ gas: v })
  })
  const [map, setMap] = useState<Map | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let cancelled = false
    let worker: Worker | undefined
    const fallback = () => {
      if (cancelled) return
      try {
        setMap(buildDiskMap(256, 384))
      } catch {
        setError(true)
      }
    }
    try {
      worker = new Worker(new URL('./rayWorker.ts', import.meta.url), {
        type: 'module',
      })
      worker.onmessage = ({
        data,
      }: MessageEvent<Map & { error?: boolean }>) => {
        if (cancelled) return
        if (data.error) fallback()
        else setMap(data)
        worker?.terminate()
      }
      worker.onerror = () => {
        worker?.terminate()
        fallback()
      }
      worker.postMessage({})
    } catch {
      fallback()
    }
    return () => {
      cancelled = true
      worker?.terminate()
    }
  }, [])
  return (
    <div
      className="ac-disk"
      ref={area}
      aria-label="Imagen del disco de acreción calculada con trayectorias de luz de Schwarzschild"
    >
      {map ? (
        <Boundary>
          <Canvas
            role="img"
            aria-label="Disco de acreción: imagen calculada con geodésicas de Schwarzschild"
            frameloop="demand"
            dpr={[1, 1.5]}
            gl={{
              antialias: false,
              alpha: false,
              powerPreference: 'low-power',
            }}
            fallback={<Fallback />}
          >
            <Field
              map={map}
              setup={setup}
              playing={playing && setup.gas > 0}
            />
          </Canvas>
        </Boundary>
      ) : (
        <p role="status" className="ac-fallback">
          {error
            ? 'No se pudieron calcular las trayectorias. Recargá para volver a intentar.'
            : 'Calculando caminos de luz…'}
        </p>
      )}
      {onTune && (
        <>
          <div className="bh-dial-caption" style={{ left: '12%' }}>
            Gas
          </div>
          <button
            {...gas}
            className="bh-image-dial"
            style={{ left: '12%', top: `${75 - setup.gas / 2}%` }}
            role="slider"
            aria-label="Alimentar el disco desde la escena"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={setup.gas}
            onKeyDown={(e) => {
              const v = scrubKey(e.key, setup.gas, 0, 100, 5)
              if (v !== undefined) {
                e.preventDefault()
                onTune({ gas: v })
              }
            }}
          >
            {setup.gas}%
          </button>
          <div className="bh-dial-caption" style={{ left: '88%' }}>
            Inclinar
          </div>
          <button
            {...tilt}
            className="bh-image-dial"
            style={{
              left: '88%',
              top: `${75 - (setup.inclination / 82) * 50}%`,
            }}
            role="slider"
            aria-label="Inclinar el disco desde la escena"
            aria-valuemin={0}
            aria-valuemax={82}
            aria-valuenow={setup.inclination}
            onKeyDown={(e) => {
              const v = scrubKey(e.key, setup.inclination, 0, 82, 5)
              if (v !== undefined) {
                e.preventDefault()
                onTune({ inclination: v })
              }
            }}
          >
            {setup.inclination}°
          </button>
        </>
      )}
    </div>
  )
}
