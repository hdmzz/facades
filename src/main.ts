import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import earcut from 'earcut';
import { dotProduct, flattenPolygon, normalize, subtract } from './facades';
import { constructBat } from './Constructor';
import { createGeometry } from './vertices';
const url = "/Bat.json"

const bat = await constructBat();

const gridHelper = new THREE.GridHelper(10, 10);

// Création de la scène
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Création de la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
scene.add(gridHelper);

// Création du rendu
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

export interface Point {
  x: number;
  y: number;
  z: number;
}
const polygons = bat.getPolygonFromPolyhedron();

console.log("Polygons", polygons);

const test = polygons[0].toGeojsonCoordinates();
const polygon = test[0];//[number, number,number][][]

console.log("Polygon", polygon);

function drawFlattenPolygon(polygonArr: [number, number][][]) {
  const polygon = polygonArr[0];
  const shape = new THREE.Shape();
  shape.moveTo(polygon[0][0], polygon[0][1]); // Move to the first point
  for (let i = 1; i < polygon.length; i++) {
        shape.lineTo(polygon[i][0], polygon[i][1]);
    }
    shape.lineTo(polygon[0][0], polygon[0][1]); // Close the shape

    // Create the geometry and material
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, side: THREE.DoubleSide });

    // Create the mesh and add it to the scene
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}
    
    // Render loop
    function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

animate();


// Extraire les vecteurs uniques de l'objet

const objFlat = polygon.flat().map(point => JSON.stringify(point)).filter((v, i, a) => a.indexOf(v) === i).map(point => JSON.parse(point));

console.log("ObjFlat", objFlat);
const A = subtract(objFlat[1], objFlat[0]);
const B = subtract(objFlat[2], objFlat[0]);

console.log("A", A);
console.log("B", B); 

let u = normalize(A);
let v = subtract(B, [dotProduct(u, B) * u[0], dotProduct(u, B) * u[1], dotProduct(u, B) * u[2]]);
v = normalize(v);
const o = polygon[0][0];

const vertices = flattenPolygon([objFlat], u, v, o);

console.log("Vertices", vertices);

drawFlattenPolygon(vertices);
