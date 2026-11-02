import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { registerSceneHelp } from './sceneHelp'
import { pickThreeScene, threeSceneItems } from './sceneHelpThree'

export default function SceneHelpR3F() {
  const { gl, scene, camera } = useThree()
  useEffect(
    () =>
      registerSceneHelp(gl.domElement, {
        pick: (point) =>
          pickThreeScene(scene, camera, gl.domElement.getBoundingClientRect(), point),
        items: () => threeSceneItems(scene, camera),
      }),
    [gl, scene, camera],
  )
  return null
}
