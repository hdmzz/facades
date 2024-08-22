import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { constructBat } from './Constructor';
import {  getGridPoints } from './grid';
import { createPolygon } from './gridUtils';
// gridHelper.rotation.x = Math.PI / 2;

const gridHelper = new THREE.GridHelper(100, 30);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(-50, 50, -70); // Positionner la caméra pour qu'elle puisse voir la scène

scene.add(gridHelper);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

export interface Point {
  x: number;
  y: number;
  z: number;
}


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const bat = await constructBat();

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const colors = ["#E50E0E", "#4ED339", "#A62AC5", "#114B9C", "#CED6CD", "#F84C12","#121806","#FA30BA64" ];

const originialBatPoints = bat.getPolygonFromPolyhedron().map((polygon) => polygon.toGeojsonCoordinates());

const bufferGeometries: THREE.BufferGeometry[] = [];

export function generateRandomColor(): string {
  // Génère un nombre aléatoire entre 0 et 16777215 (le plus grand nombre hexadécimal pour une couleur)
  const randomNumber = Math.floor(Math.random() * 16777215);
  // Convertit ce nombre en une chaîne hexadécimale et ajoute les zéros en tête si nécessaire
  const randomColor = "#" + randomNumber.toString(16).padStart(6, '0');
  return randomColor;
  
}

// Render loop
function animate() {
  controls.update();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();


originialBatPoints.forEach((polygon, _i) => {
  const grid = getGridPoints(polygon, 1);
  grid.forEach(polygonSet => {
    polygonSet.forEach(polygon => {
        polygon.forEach((verticesArray) => {
          const mesh = createPolygon(verticesArray);
          scene.add(mesh);
        });
    });
  });
});
