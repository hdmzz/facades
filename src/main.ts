import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { dotProduct, flattenPolygon, normalize, subtract, createBufferGeometryFromPolygon, ThreePoint, unflattenPolygon } from './facades';
import { constructBat } from './Constructor';
import { getFlatGridPoints } from './grid';
const gridHelper = new THREE.GridHelper(100, 30);
// gridHelper.rotation.x = Math.PI / 2;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.z = 20;
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

const comparePoint = (a: [number, number, number], b: [number, number, number]) => {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

const tableIncludePoint = (table: [number, number, number][], point: [number, number, number]) => {
  for (let i = 0; i < table.length; i++) {
    if (comparePoint(table[i], point)) return true;
  }
  return false;
}

const originalBatPoints = bat.getPolygonFromPolyhedron().map((polygon) => polygon.toGeojsonCoordinates());

const bufferGeometries: THREE.BufferGeometry[] = [];
let firstPoint: [number, number, number] | null = null;
const faces: Array<[number, number][][]> = [];



//!U V O
let v: ThreePoint = [0,0,0];
let u: ThreePoint = [0,0,0];
let o: any = [0,0,0];

originalBatPoints.forEach((polygon, i) => {
  const newPolygon: [number, number, number][][] = [];
  polygon.forEach((ring) => {
    const newRing: [number, number, number][] = [];
    ring.forEach((segment) => {
      segment.map((point) => {
        if (!tableIncludePoint(newRing, point))
          newRing.push(point);
        if (!firstPoint) {
          firstPoint = point;
        }
      })
    })
    newRing.push(newRing[0]);
    newPolygon.push(newRing);
  })
  const material = new THREE.MeshBasicMaterial({ color: colors[i] });
  material.side = THREE.DoubleSide;

  const faceGeom = createBufferGeometryFromPolygon(newPolygon);
  const mesh = new THREE.Mesh(faceGeom, material);
  bufferGeometries.push(faceGeom);

  if (firstPoint) {
    mesh.position.x = -firstPoint[0];
    mesh.position.y = -firstPoint[1];
    mesh.position.z = -firstPoint[2];
  }
  
  //scene.add(mesh);

  // Applatissement
  const A = subtract(newPolygon[0][1], newPolygon[0][0]);
  const B = subtract(newPolygon[0][2], newPolygon[0][0]);

  u = normalize(A);
  v = subtract(B, [dotProduct(u, B) * u[0], dotProduct(u, B) * u[1], dotProduct(u, B) * u[2]]);
  v = normalize(v);
  o = newPolygon[0][0];

  const flatVertices = flattenPolygon(newPolygon, u, v, o);
  faces.push(flatVertices);

  //// ! Applatissement
  //const displayableVertices: [number, number, number][][] = flatVertices.map((ring) => ring.map((point) => [point[0], 0, point[1]]));
  
  //const flatGeom = createBufferGeometryFromPolygon(displayableVertices as ThreePoint[][]);
  //const flatMesh = new THREE.Mesh(flatGeom, material);
  //flatMesh.position.x = (i * 15) - 50;
  // scene.add(flatMesh);
});

const matrixCells = getFlatGridPoints(faces[0], 3);

console.log(matrixCells);

function generateRandomColor(): string {
  // Génère un nombre aléatoire entre 0 et 16777215 (le plus grand nombre hexadécimal pour une couleur)
  const randomNumber = Math.floor(Math.random() * 16777215);
  // Convertit ce nombre en une chaîne hexadécimale et ajoute les zéros en tête si nécessaire
  const randomColor = "#" + randomNumber.toString(16).padStart(6, '0');
  return randomColor;
}

//drawmatrix(matrixCells);

function drawmatrix(matrixCells: any[]) {
  matrixCells.forEach((col: any[]) => {
    col.forEach((cell: any[]) => {
      const material = new THREE.MeshBasicMaterial({ color: generateRandomColor() });
      material.side = THREE.DoubleSide;
      const cellGeom = createBufferGeometryFromPolygon(cell.map((ring: any[]) => ring.map((point: any[]) => [point[0], 0, point[1]])));
      const cellMesh = new THREE.Mesh(cellGeom, material);
      scene.add(cellMesh);
    });
  });
}

let unflattenedGrid = matrixCells.map((column) =>
  column.map((cell) => unflattenPolygon(cell, u, v, o)),
);



// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

animate();

