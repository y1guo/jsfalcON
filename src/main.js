import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { Body, NBody } from "./jsfalcON";

let container, stats;

let camera, scene, renderer, controls;

let points, nbody;

let lastTime = 0;

init();
requestAnimationFrame(animate);

function init() {
    container = document.getElementById("container");

    //

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 100;

    scene = new THREE.Scene();

    //

    const npoint = 100000;
    const radius = 50;

    const bodyArray = [];

    for (let i = 0; i < npoint; i++) {
        const mass = 1;

        const x = (2 * Math.random() - 1) * radius;
        const y = (2 * Math.random() - 1) * radius;
        const z = (2 * Math.random() - 1) * radius;

        bodyArray.push(new Body(mass, [x, y, z], [0, 0, 0]));
    }

    nbody = new NBody(bodyArray);
    nbody.softening = 1;

    //

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(Array(3 * npoint).fill(0), 3)
    );
    geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(Array(3 * npoint).fill(0), 3)
    );

    //

    const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
    });

    points = new THREE.Points(geometry, material);
    updateGeometry();
    scene.add(points);

    //

    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    //

    controls = new OrbitControls(camera, renderer.domElement);

    //

    stats = new Stats();
    container.appendChild(stats.dom);

    //

    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate(currentTime) {
    requestAnimationFrame(animate);

    let deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    controls.update();
    render(deltaTime);
    stats.update();
}

function render(deltaTime) {
    nbody.update(deltaTime / 1000);
    updateGeometry();
    points.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

function updateGeometry() {
    const position = points.geometry.attributes.position.array;
    const color = points.geometry.attributes.color.array;
    for (let i = 0; i < nbody.num; i++) {
        const body = nbody.bodyArray[i];
        for (let j = 0; j < 3; j++) {
            position[3 * i + j] = body.pos[j];
            color[3 * i + j] = body.color[j];
        }
    }
}
