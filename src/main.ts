import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import colors from "nice-color-palettes/100.json"

function hashCode(str: string) {
	// java String#hashCode
	var hash = 0
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash)
	}
	return hash
}

function intToRGB(i: any) {
	var c = (i & 0x00ffffff).toString(16).toUpperCase()

	return "00000".substring(0, 6 - c.length) + c
}

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!

const scene = new THREE.Scene()

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(2, 2, -1)
scene.add(directionalLight)

directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 6

/**
 * Materials
 */
// const material = new THREE.MeshNormalMaterial()
const materialLine = new THREE.LineBasicMaterial({ color: 0xbababa })

/**
 * Objects
 */
// Sphere

const objects = new THREE.Group()
const len = 10
const COLORS = colors.flat(5)

for (let i = 0; i < len; i++) {
	for (let j = 0; j < len; j++) {
		const material = new THREE.MeshMatcapMaterial({
			color: `#${intToRGB(hashCode(COLORS[j * i + 1]))}`,
			matcap: new THREE.TextureLoader().load("./texture.jpg"),
		})
		// const geo = new THREE.BoxGeometry(1, j + 1, 1)
		// geo.translate(0, (i + 1) / 2, 0)
		const geo = new THREE.SphereGeometry(0.5, 32, 32)
		const sphere = new THREE.Mesh(geo, new THREE.MeshNormalMaterial())
		sphere.position.x = i + 0.5
		sphere.position.y = .5
		sphere.position.z = j + 0.5
		objects.add(sphere)
	}
}

scene.add(objects)

// Lines
const planeAxes = new THREE.Group()

for (let i = 0; i <= len; i++) {
	const geometryH = new THREE.BufferGeometry().setFromPoints([
		new THREE.Vector3(0, i * 2, 0),
		new THREE.Vector3(len * 2, i * 2, 0),
	])
	const geometryV = new THREE.BufferGeometry().setFromPoints([
		new THREE.Vector3(i * 2, 0, 0),
		new THREE.Vector3(i * 2, len * 2, 0),
	])
	const lineH = new THREE.Line(geometryH, materialLine)
	const lineV = new THREE.Line(geometryV, materialLine)
	planeAxes.add(lineH, lineV)
}

const yPlaneAxes = planeAxes.clone().rotateY(-Math.PI / 2)
const zPlaneAxes = planeAxes.clone().rotateX(Math.PI / 2)

scene.add(planeAxes)
scene.add(yPlaneAxes)
scene.add(zPlaneAxes)

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	// Update camera
	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()

	// Update renderer
	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	300
)
camera.position.x = 15
camera.position.y = 8
camera.position.z = 15
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.shadowMap.enabled = true

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
	// Update controls
	controls.update()
	const elapsedTime = clock.getElapsedTime()
	objects.children.forEach((sphere, i) => {
		setTimeout(() => {
			const odd = i % 2
			sphere.position.y +=
				Math.sin(elapsedTime) * Math.cos(elapsedTime) * 0.1
		}, i * 10)
	})
	// Render
	renderer.render(scene, camera)

	// Call tick again on the next frame
	window.requestAnimationFrame(tick)
}

tick()
