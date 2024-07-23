import *  as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

//recuperer le batiment
const url = "/Bat.json"
const batiment = await fetch(url)
  .then(response => response.json()).then(data => {return data;});//ok
//conversion des donnes json en buffergeometry

//recupertion des 

const renderer = new THREE.WebGLRenderer();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);

document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); 
camera.position.set(0, 0, 5);
//camera.lookAt(0, 0, 0);//look at the origin
const controls = new OrbitControls(camera, renderer.domElement);

const scene = new THREE.Scene();

const gridHelper = new THREE.GridHelper(10, 10);

const loader = new THREE.BufferGeometryLoader();
console.log(batiment);
const geometry = loader.parse(batiment.geometries[0].geometry);

geometry.scale(0.09, 0.09, 0.09);
// Compute the bounding box of the geometry
geometry.computeBoundingBox();
const boundingBox = geometry.boundingBox;

// Calculate the center of the bounding box
const center = new THREE.Vector3();
boundingBox?.getCenter(center);

const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
material.side = THREE.DoubleSide;

const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh, gridHelper);

mesh.position.sub(center);

// Set the camera position and look at the center
camera.position.set(center.x, center.y, center.z + 10);
camera.lookAt(center);

//render looop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

animate();
 