import *  as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { getOnlyFacadesGeometry } from './facades';
import { get } from 'http';

//interface BatimentData {
//  data: {
//    attributes: {
//      position: {
//        array: number[];
//      };
//      normal: {
//        array: number[];
//      };
//    };
//  };
//}

//recuperer le batiment
//const url = "/Bat.json"
//const batiment = await fetch(url).then(response => response.json()).then(data => {return data.geometries[0].geometry;});//ok

//console.log(batiment);

//const renderer = new THREE.WebGLRenderer();
//renderer.setPixelRatio(window.devicePixelRatio);
//renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.setClearColor(0xffffff);

//document.body.appendChild(renderer.domElement);

//const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); 
//camera.position.set(0, 0, 5);

//const controls = new OrbitControls(camera, renderer.domElement);

//const scene = new THREE.Scene();

//const gridHelper = new THREE.GridHelper(10, 10);

//const loader = new THREE.BufferGeometryLoader();
//const geometry = loader.parse(batiment);

//console.log(geometry);

//geometry.scale(0.09, 0.09, 0.09);


////nouvelle  pproche regrouper les points partagean le meme plan la meme normale  et les recuperer dans un tableau
//function groupPositionsByPlan(geometry: any) {
//  const position = geometry.attributes.position.array;
//  const normal = geometry.attributes.normal.array;

//  const faces = [];

//  for (let i = 0; i < normal.length; i += 3) {
//    let normal1 = new THREE.Vector3(normal[i], normal[i+1], normal[i+2]);
//    for (let j = i; j < normal.length; j+=3) {
//      let normal2 = new THREE.Vector3(normal[j], normal[j+1], normal[j+2]);
//      if (normal1.equals(normal2)) {
//        console.log("same normal");
//        continue;
//      }
//      i = j;
//      console.log("different normal");
//    }
  
//  }
//}

//groupPositionsByPlan(geometry);
//// Compute the bounding box of the geometry
//geometry.computeBoundingBox();
//const boundingBox = geometry.boundingBox;

//// Calculate the center of the bounding box
//const center = new THREE.Vector3();
//boundingBox?.getCenter(center);

//const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//material.side = THREE.DoubleSide;

//const mesh = new THREE.Mesh(geometry, material);

//scene.add(mesh, gridHelper);

//mesh.position.sub(center);

//camera.position.set(center.x, center.y, center.z + 10);
//camera.lookAt(center);





////render looop
//function animate() {
//  requestAnimationFrame(animate);
//  renderer.render(scene, camera);
//  controls.update();
//}
//animate();

// Création de la scène
const scene = new THREE.Scene();

// Création de la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Création du rendu
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Définition des positions des sommets pour un cube
const positions = new Float32Array([
  // Face avant
  -1, -1,  1,
   1, -1,  1,
   1,  1,  1,
  -1,  1,  1,
  // Face arrière
  -1, -1, -1,
  -1,  1, -1,
   1,  1, -1,
   1, -1, -1,
  // Face supérieure
  -1,  1, -1,
  -1,  1,  1,
   1,  1,  1,
   1,  1, -1,
  // Face inférieure
  -1, -1, -1,
   1, -1, -1,
   1, -1,  1,
  -1, -1,  1,
  // Face droite
   1, -1, -1,
   1,  1, -1,
   1,  1,  1,
   1, -1,  1,
  // Face gauche
  -1, -1, -1,
  -1, -1,  1,
  -1,  1,  1,
  -1,  1, -1
]);

// Définition des normales pour chaque sommet du cube
const normals = new Float32Array([
  // Face avant
   0,  0,  1,
   0,  0,  1,
   0,  0,  1,
   0,  0,  1,
  // Face arrière
   0,  0, -1,
   0,  0, -1,
   0,  0, -1,
   0,  0, -1,
  // Face supérieure
   0,  1,  0,
   0,  1,  0,
   0,  1,  0,
   0,  1,  0,
  // Face inférieure
   0, -1,  0,
   0, -1,  0,
   0, -1,  0,
   0, -1,  0,
  // Face droite
   1,  0,  0,
   1,  0,  0,
   1,  0,  0,
   1,  0,  0,
  // Face gauche
  -1,  0,  0,
  -1,  0,  0,
  -1,  0,  0,
  -1,  0,  0
]);

// Définition des indices pour les faces du cube
const indices = new Uint16Array([
  0,  1,  2,   0,  2,  3,  // Face avant
  4,  5,  6,   4,  6,  7,  // Face arrière
  8,  9,  10,  8,  10, 11, // Face supérieure
  12, 13, 14,  12, 14, 15, // Face inférieure
  16, 17, 18,  16, 18, 19, // Face droite
  20, 21, 22,  20, 22, 23  // Face gauche
]);

// Création des attributs de position et de normale
const positionAttribute = new THREE.BufferAttribute(positions, 3);
const normalAttribute = new THREE.BufferAttribute(normals, 3);

// Création de la géométrie et ajout des attributs
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', positionAttribute);
geometry.setAttribute('normal', normalAttribute);

// Création du matériau
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });


geometry.setIndex(new THREE.BufferAttribute(indices, 1));

const newGeometry = getOnlyFacadesGeometry(geometry);  


const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

const testMesh = new THREE.Mesh(newGeometry, greenMaterial);

scene.add(testMesh);




// Création du maillage
//const mesh = new THREE.Mesh(geometry, material);
//scene.add(mesh);

// Ajout de la lumière
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

// Fonction d'animation
function animate() {
  requestAnimationFrame(animate);
  //renderer.render(scene, camera);
  controls.update();
}
animate();
