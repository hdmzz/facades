import *  as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const url = "/Bat.json"

const gridHelper = new THREE.GridHelper(10, 10);

const response = fetch(url);
const data = await (await response).json();

console.log(data);
// Création de la scène
const scene = new THREE.Scene();

// Création de la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = -50;
camera.position.y = 250;
camera.position.x = -80;
scene.add(gridHelper);

// Création du rendu
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);


function extractVertices(polyhedron: any[]) {
    const vertices: THREE.Vector3[] = [];
    polyhedron.forEach((item: { polygon: any[]; }) => {
        item.polygon.forEach((polygon: any[]) => {
            polygon.forEach((segment: { segment: any[]; }) => {
                segment.segment.forEach((vertex: { x: number | undefined; y: number | undefined; z: number | undefined; }) => {
                    vertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
                });
            });
        });
    });
    return vertices;
}

const vertices = extractVertices(data.polyhedron);

// Create geometry and add vertices
const geometry = new THREE.BufferGeometry().setFromPoints(vertices);

console.log(geometry);

// Create material
const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

// Create line
const line = new THREE.Line(geometry, material);

// Add line to scene
scene.add(line);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}

animate();
