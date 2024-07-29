import *  as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const url = "/Bat.json"

const gridHelper = new THREE.GridHelper(10, 10);

// Création de la scène
const scene = new THREE.Scene();

// Création de la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
scene.add(gridHelper);

// Création du rendu
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);


// Importer la bibliothèque three.js

// Fonction pour charger et dessiner le bâtiment
async function dessinerBatiment() {
  // Charger le fichier JSON
  const response = await fetch(url);
  const batiment = await response.json();

  // Fonction pour dessiner un segment
  function dessinerSegment(segment: {
      x: number | undefined;
      y: number | undefined; z: number | undefined; 
}[]) {
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const points = [];
    points.push(new THREE.Vector3(segment[0].x, segment[0].y, segment[0].z));
    points.push(new THREE.Vector3(segment[1].x, segment[1].y, segment[1].z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
  }

  // Parcourir les polyèdres et les polygones pour dessiner les segments
  batiment.polyhedron.forEach((polyhedron: { polygon: any[]; }) => {
    polyhedron.polygon.forEach((polygon: any[]) => {
      polygon.forEach((segment: { segment: { x: number, y: number, z: number; }[]; }) => {
        dessinerSegment(segment.segment);
      });
    });
  });

   // Calculer le centre de la géométrie
  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());

  // Positionner la caméra pour centrer la scène
  camera.position.set(-10, 500,0);
  camera.lookAt(center);

  // Fonction d'animation
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
  }

  animate();
}

// Appeler la fonction pour dessiner le bâtiment
dessinerBatiment();
