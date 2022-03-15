import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import NBody from "./jsfalcON";

// create the scene
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 50);

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

const controls = new OrbitControls(camera, renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

// generate points
const mass = [];
const position = [];
const velocity = [];
const npoint = 1000;

for (let i = 0; i < npoint; i++) {
    const m = 1;
    const x = THREE.MathUtils.randFloatSpread(100);
    const y = THREE.MathUtils.randFloatSpread(100);
    const z = THREE.MathUtils.randFloatSpread(100);
    const vx = 0;
    const vy = 0;
    const vz = 0;

    mass.push(m);
    position.push(x, y, z);
    velocity.push(vx, vy, vz);
}

// show points
const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(position, 3)
);
geometry.setAttribute(
    "velocity",
    new THREE.Float32BufferAttribute(velocity, 3)
);
const nbody = new NBody(
    mass,
    geometry.attributes.position.array,
    geometry.attributes.velocity.array
);
nbody.softening = 1;

const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });

const stars = new THREE.Points(geometry, material);
scene.add(stars);

// animate
let lastTime = 0;
function animate(currentTime) {
    let deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    nbody.update(deltaTime / 1000);
    stars.geometry.attributes.position.needsUpdate = true;

    controls.update();

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
