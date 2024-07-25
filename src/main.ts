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
const url = "/Bat.json"
const batiment = await fetch(url).then(response => response.json()).then(data => {return data.geometries[0].geometry;});//ok

console.log(batiment);

const gridHelper = new THREE.GridHelper(10, 10);

const loader = new THREE.BufferGeometryLoader();
const batimentGeometry = loader.parse(batiment);

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

const indexOfThePointsByNormal = getOnlyFacadesGeometry(batimentGeometry);  

const rightGeometry = new THREE.BufferGeometry();

rightGeometry.setAttribute('position', batimentGeometry.getAttribute('position'));
rightGeometry.setAttribute('normal', batimentGeometry.getAttribute('normal'));
rightGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indexOfThePointsByNormal.get("0,-1,0")!), 1));

const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

const testMesh = new THREE.Mesh(rightGeometry, greenMaterial);

scene.add(testMesh);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}
animate();
