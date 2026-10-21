import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ShaderMaterial, Vector2 } from 'three'

const fragment = `
precision highp float;
varying vec2 vUv;
uniform vec2 uSize;
uniform float uTime;
uniform float uRadius;
uniform float uBath;
uniform float uEmission;
uniform float uAbsorption;
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
void main() {
  vec2 p=(vUv-.5)*vec2(uSize.x/uSize.y,1.)*2.;
  float r=length(p);
  float a=atan(p.y,p.x);
  vec3 col=vec3(.024,.039,.058);
  col+=vec3(.014,.028,.035)*exp(-r*r*.75);
  vec2 starUv=vUv*uSize/5.;
  vec2 cell=floor(starUv);
  vec2 point=fract(starUv)-.5;
  float star=pow(hash(cell),100.)*exp(-dot(point,point)*70.)*.6;
  col+=star*vec3(.6,.8,1.);
  // A schematic coordinate sheet, not numerically integrated GR light rays.
  vec2 sheet=vec2(p.x,p.y*2.6+.15);
  float sr=length(sheet);
  float ring=pow(.5+.5*cos(log(1.+sr*3.)*35.),32.);
  float spoke=pow(.5+.5*cos(atan(sheet.y,sheet.x)*20.),64.);
  col+=vec3(.065,.20,.23)*(ring*.21+spoke*.14)*exp(-sr*.7);
  // Fixed radius reference remains on the same screen scale across comparisons.
  float referenceDelta=(r-.32)/.0018;
  float reference=exp(-referenceDelta*referenceDelta)*step(.2,sin(a*65.));
  float outside=smoothstep(uRadius-.001,uRadius+.006,r);
  float rimDelta=(r-uRadius)/.006;
  float rim=exp(-rimDelta*rimDelta);
  float glow=exp(-abs(r-uRadius)*22.);
  col+=vec3(.94,.62,.28)*(rim*(.35+uEmission)+glow*(.05+uEmission*.28))*outside;
  col+=vec3(.18,.48,.9)*glow*uAbsorption*.25*outside;
  col+=vec3(.10,.24,.27)*exp(-abs(r-uRadius)*7.)*.12*outside;
  // Bounded, amplified power controls brightness/speed; these are not photon paths.
  // Polar cells evaluate one marker per fragment, avoiding a loop over all particles.
  float lane=(a+3.14159265)/6.2831853*40.;
  float seed=hash(vec2(floor(lane),7.));
  float angular=(fract(lane)-.5)*6.2831853/40.*max(r,.1);
  float t=fract(uTime*(.025+uEmission*.16)+seed);
  float distance=uRadius+.045+t*1.15;
  float radial=r-distance;
  float trailRadial=r-distance*.989;
  float dotlight=exp(-(radial*radial+angular*angular)*4000.);
  float trail=exp(-(trailRadial*trailRadial+angular*angular)*1800.);
  col+=vec3(1.,.65,.32)*(dotlight+trail*.3)*(uEmission*1.8)*sin(t*3.14159)*outside;
  if(uBath>.5) {
    float ti=fract(uTime*(.025+uAbsorption*.16)+seed*.73);
    float incoming=uRadius+.04+(1.-ti)*1.25;
    float incomingDelta=r-incoming;
    col+=vec3(.3,.65,1.)*exp(-(incomingDelta*incomingDelta+angular*angular)*3000.)*uAbsorption*2.*sin(ti*3.14159)*outside;
  }
  col=mix(vec3(.006,.009,.014),col,outside);
  col+=vec3(.30,.54,.58)*reference*.65;
  col*=1.-.28*smoothstep(.7,1.7,length(p));
  gl_FragColor=vec4(col,1.);
}`

interface FieldProps {
  radius: number
  bath: boolean
  moving: boolean
  emission: number
  absorption: number
}
function Field({ radius, bath, moving, emission, absorption }: FieldProps) {
  const material = useRef<ShaderMaterial>(null)
  const time = useRef(0)
  const invalidate = useThree((state) => state.invalidate)
  const uniforms = useMemo(
    () => ({
      uSize: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uRadius: { value: 0.32 },
      uBath: { value: 0 },
      uEmission: { value: 0.45 },
      uAbsorption: { value: 0 },
    }),
    [],
  ) // Values below update without reallocating shader resources.
  useEffect(() => {
    invalidate()
  }, [radius, bath, moving, emission, absorption, invalidate])
  useFrame(({ size }, delta) => {
    if (!material.current) return
    if (moving) time.current += Math.min(delta, 0.1)
    material.current.uniforms.uSize.value.set(size.width, size.height)
    material.current.uniforms.uTime.value = time.current
    material.current.uniforms.uRadius.value = radius
    material.current.uniforms.uBath.value = bath ? 1 : 0
    material.current.uniforms.uEmission.value = emission
    material.current.uniforms.uAbsorption.value = absorption
  })
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader="varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}"
        fragmentShader={fragment}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

class VisualBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children
  }
}
function Fallback() {
  return (
    <div className="hk-visual-fallback">
      <span />
      <p>Vista sin WebGL. Los cálculos, gráficos y retos siguen disponibles.</p>
    </div>
  )
}
export default function Horizon({
  ratio,
  bath,
  moving,
  emission,
  absorption,
}: {
  ratio: number
  bath: boolean
  moving: boolean
  emission: number
  absorption: number
}) {
  const limited = ratio < 0.22 || ratio > 2.2
  return (
    <>
      <VisualBoundary>
        <Canvas
          dpr={[1, 1.5]}
          frameloop={moving ? 'always' : 'demand'}
          gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
          fallback={<Fallback />}
          aria-label="Representación esquemática del horizonte y flujos de energía"
        >
          <Field
            radius={0.32 * Math.min(2.2, Math.max(0.22, ratio))}
            bath={bath}
            moving={moving}
            emission={emission}
            absorption={absorption}
          />
        </Canvas>
      </VisualBoundary>
      <div className="hk-scale-note">
        {limited
          ? 'Tamaño comprimido fuera del rango ×0,22–×2,2. Usá las medidas.'
          : 'Radio a escala de la referencia punteada'}
      </div>
    </>
  )
}
