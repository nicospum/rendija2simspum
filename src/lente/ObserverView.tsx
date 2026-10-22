import { useSurfaceScrub } from '../shared/useSurfaceScrub'
import { pickedDirection } from './interaction'
import { Component, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { DataTexture, FloatType, NearestFilter, RGBAFormat, ShaderMaterial, Vector2 } from 'three'
import { degrees, directionForPixel, HALF_FOV, MAX_ANGLE, radians } from './physics'
import type { Setup } from './learning'
import type { Transfer } from './useTransfer'

const fragment = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uMap;
uniform float uCount;
uniform float uCritical;
uniform float uMaximum;
uniform float uTanFov;
uniform float uSource;
uniform float uYaw;
uniform float uGrid;
uniform vec2 uSize;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 sky(vec3 n){
  vec2 uv=vec2(atan(n.y,n.x)/6.283185307+.5,acos(clamp(n.z,-1.,1.))/3.141592654);
  vec2 scaled=uv*vec2(260.,130.);
  vec2 cell=floor(scaled);
  vec2 pos=fract(scaled)-vec2(.2+.6*hash(cell+17.),.2+.6*hash(cell+83.));
  float stars=exp(-dot(pos,pos)*95.)*pow(hash(cell),12.);
  float band=exp(-pow((n.z+.22*n.y)/.19,2.));
  float dust=.65+.35*sin(n.x*53.+n.y*37.)*sin(n.z*41.-n.y*29.);
  vec3 color=vec3(.007,.014,.027)+vec3(.025,.05,.068)*band*dust;
  color+=mix(vec3(.48,.72,1.),vec3(1.,.76,.47),hash(cell+4.))*stars*1.8;
  vec3 source=vec3(-cos(uSource),sin(uSource),0.);
  float d=max(0.,1.-dot(n,source));
  color+=vec3(1.,.61,.25)*exp(-d/.0003)*3.;
  color+=vec3(1.,.76,.45)*exp(-d/.0015)*.14;
  if(uGrid>.5){
    float gx=abs(sin(uv.x*6.283185307*12.));
    float gy=abs(sin(uv.y*3.141592654*12.));
    float width=max(fwidth(uv.x)*75.,.006);
    float grid=1.-smoothstep(width,width*1.8,min(gx,gy));
    color+=vec3(.06,.19,.22)*grid;
  }
  return color;
}
void main(){
  vec2 p=(vUv-.5)*2.*vec2(uSize.x/uSize.y,1.);
  float tangent=length(p)*uTanFov;
  float angle=atan(tangent);
  if(angle<uCritical){gl_FragColor=vec4(.001,.002,.004,1.);return;}
  float f=sqrt(clamp((angle-uCritical)/(uMaximum-uCritical),0.,1.))*(uCount-1.);
  float lo=floor(f),hi=min(lo+1.,uCount-1.);
  vec4 a=texture2D(uMap,vec2((lo+.5)/uCount,.5));
  vec4 b=texture2D(uMap,vec2((hi+.5)/uCount,.5));
  if(min(a.g,b.g)<.5){gl_FragColor=vec4(.006,.008,.013,1.);return;}
  float phi=mix(a.r,b.r,fract(f));
  vec2 e=length(p)>.000001?normalize(p):vec2(1.,0.);
  vec3 observer=vec3(cos(uYaw),sin(uYaw),0.);
  vec3 right=vec3(-sin(uYaw),cos(uYaw),0.);
  vec3 n=cos(phi)*observer+sin(phi)*(e.x*right+vec3(0.,0.,e.y));
  vec3 color=sky(normalize(n));
  color=1.-exp(-color*1.5);
  gl_FragColor=vec4(pow(color,vec3(.4545)),1.);
}`

function Field({ transfer, setup, grid }: { transfer: Transfer; setup: Setup; grid: boolean }) {
  const ref = useRef<ShaderMaterial>(null)
  const invalidate = useThree((state) => state.invalidate)
  const texture = useMemo(() => {
    const value = new DataTexture(transfer.data, transfer.data.length / 4, 1, RGBAFormat, FloatType)
    value.minFilter = NearestFilter
    value.magFilter = NearestFilter
    value.needsUpdate = true
    return value
  }, [transfer.data])
  useEffect(() => () => texture.dispose(), [texture])
  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uCount: { value: transfer.data.length / 4 },
      uCritical: { value: transfer.critical },
      uMaximum: { value: MAX_ANGLE },
      uTanFov: { value: Math.tan(HALF_FOV) },
      uSource: { value: 0 },
      uYaw: { value: 0 },
      uGrid: { value: 0 },
      uSize: { value: new Vector2(1, 1) },
    }),
    [texture, transfer.critical, transfer.data.length],
  )
  useEffect(() => {
    invalidate()
  }, [texture, setup.source, setup.yaw, grid, invalidate])
  useFrame(({ size }) => {
    if (!ref.current) return
    ref.current.uniforms.uSize.value.set(size.width, size.height)
    ref.current.uniforms.uSource.value = radians(setup.source)
    ref.current.uniforms.uYaw.value = radians(setup.yaw)
    ref.current.uniforms.uGrid.value = grid ? 1 : 0
  })
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={ref}
        uniforms={uniforms}
        vertexShader="varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}"
        fragmentShader={fragment}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}
function Fallback() {
  return (
    <div className="ln-fallback">
      <strong>El visor WebGL no está disponible.</strong>
      <p>El diagrama, los controles y los cálculos físicos siguen funcionando.</p>
    </div>
  )
}
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children
  }
}
export default function ObserverView({
  transfer,
  setup,
  grid,
  pending,
  onPick,
}: {
  transfer: Transfer | null
  setup: Setup
  grid: boolean
  pending: boolean
  onPick: (angle: number, azimuth: number) => void
}) {
  const area = useRef<HTMLDivElement>(null)
  const [aspect, setAspect] = useState(1.6)
  useEffect(() => {
    const element = area.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0)
        setAspect(entry.contentRect.width / entry.contentRect.height)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const drag = useSurfaceScrub(area, (p) => {
    if (pending) return
    const v = pickedDirection(p.x, p.y, aspect)
    if (v) onPick(v.angle, v.azimuth)
  })
  const alpha = radians(setup.rayAngle)
  const x =
    50 +
    (50 * Math.tan(alpha) * Math.cos(setup.azimuth)) /
      (Math.tan(HALF_FOV) * aspect)
  const y =
    50 -
    (50 * Math.tan(alpha) * Math.sin(setup.azimuth)) / Math.tan(HALF_FOV)
  const visible = x > 0 && x < 100 && y > 0 && y < 100
  return (
    <div ref={area} className="ln-observer-image">
      {transfer && (
        <Boundary>
          <Canvas
            frameloop="demand"
            dpr={[1, 1.5]}
            gl={{
              antialias: false,
              alpha: false,
              powerPreference: 'low-power',
            }}
            fallback={<Fallback />}
            aria-label="Imagen del observador calculada con geodésicas de Schwarzschild"
          >
            <Field transfer={transfer} setup={setup} grid={grid} />
          </Canvas>
        </Boundary>
      )}
      <button
        className="ln-pick-surface"
        aria-label="Elegir un rayo en la imagen; Enter selecciona la dirección de 14 grados"
        disabled={pending}
        onClick={(event) => {
          if (event.detail === 0) {
            onPick(14, 0)
            return
          }
          const bounds = event.currentTarget.getBoundingClientRect()
          const px = (2 * (event.clientX - bounds.left)) / bounds.width - 1
          const py = 1 - (2 * (event.clientY - bounds.top)) / bounds.height
          const direction = directionForPixel(
            px,
            py,
            bounds.width / bounds.height,
          )
          onPick(degrees(direction.angle), direction.azimuth)
        }}
      />
      <div className="ln-image-top">
        <span>
          <i /> {setup.gravity ? 'CON LENTE' : 'CONTROL · SIN GRAVEDAD'}
        </span>
        <span>CAMPO VERTICAL 60°</span>
      </div>
      {visible && (
        <button
          {...drag}
          type="button"
          className="ln-selected-pixel ln-ray-handle"
          disabled={pending}
          style={{ left: `${x}%`, top: `${y}%` }}
          aria-label="Mover el rayo: arrastrá o usá las flechas; Enter vuelve a 14 grados"
          onClick={(e) => {
            if (e.detail === 0) onPick(14, 0)
          }}
          onKeyDown={(e) => {
            const delta = (
              {
                ArrowLeft: [-0.025, 0],
                ArrowRight: [0.025, 0],
                ArrowUp: [0, -0.025],
                ArrowDown: [0, 0.025],
              } as Record<string, number[]>
            )[e.key]
            if (delta) {
              e.preventDefault()
              const v = pickedDirection(
                x / 100 + delta[0],
                y / 100 + delta[1],
                aspect,
              )
              if (v) onPick(v.angle, v.azimuth)
            }
          }}
        />
      )}
      <p className="ln-image-bottom">
        {visible
          ? 'Tocá la imagen: cada dirección tiene un recorrido.'
          : 'El rayo elegido está fuera del visor; seguí su recorrido en el diagrama.'}
      </p>
      {pending && (
        <div className="ln-calculating" role="status">
          Integrando trayectorias…{' '}
          {transfer ? 'Se conserva la imagen anterior.' : ''}
        </div>
      )}
    </div>
  )
}
