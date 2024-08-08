import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import earcut from 'earcut';
import { dot, flattenPolygon, normalize, substract } from './facades';
import { constructBat } from './Constructor';
import { createGeometry } from './vertices';
const url = "/Bat.json"

const bat = await constructBat();
console.log("Bat", bat);


const gridHelper = new THREE.GridHelper(10, 10);



// Création de la scène
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

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

export interface Point {
  x: number;
  y: number;
  z: number;
}
const polygons = bat.getPolygonFromPolyhedron();
console.log("Polygons", polygons);

const test = polygons[7].toGeojsonCoordinates();
const polygon = test[0];
console.log("Polygon", polygon);

const geometry = createGeometry(polygon);

const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

const line = new THREE.LineLoop(geometry, material);
scene.add(line);

//const A = substract(polygon[1], polygon[0]);
//const B = substract(polygon[2], polygon[0]);
  
//let u = normalize({x: A.x, y: A.y, z: A.z});
//let v = substract(B, {x: dot(u, B) * u.x, y: dot(u, B) * u.y, z: dot(u, B) * u.z});
//v = normalize(v);
//const o = polygon[0];

//const vertices = flattenPolygon([polygon], u, v, o);


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
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true, side: THREE.DoubleSide });

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


