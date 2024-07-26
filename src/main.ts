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
const rightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

rightGeometry.setAttribute('position', batimentGeometry.getAttribute('position'));
rightGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indexOfThePointsByNormal.get("righty")!), 1));
const rightMesh = new THREE.Mesh(rightGeometry, rightMaterial);

const leftGeometry = new THREE.BufferGeometry();
const leftMaterial = new THREE.MeshBasicMaterial({ color: "red", side: THREE.DoubleSide });

leftGeometry.setAttribute('position', batimentGeometry.getAttribute('position'));
leftGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indexOfThePointsByNormal.get("lefty")!), 1))
const leftMesh = new THREE.Mesh(leftGeometry, leftMaterial);

const topGeometry = new THREE.BufferGeometry();
const topMaterial = new THREE.MeshBasicMaterial({ color: "orange", side: THREE.DoubleSide });

topGeometry.setAttribute('position', batimentGeometry.getAttribute('position'));
topGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indexOfThePointsByNormal.get("topy")!), 1))
const topMesh = new THREE.Mesh(topGeometry, topMaterial);


const backouestGeometry = new THREE.BufferGeometry();
const backouestMaterial = new THREE.MeshBasicMaterial({ color: "violet", side: THREE.DoubleSide });

backouestGeometry.setAttribute('position', batimentGeometry.getAttribute('position'));
backouestGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indexOfThePointsByNormal.get("backouesty")!), 1))
const backouestMesh = new THREE.Mesh(backouestGeometry, backouestMaterial);

const backGeometry = new THREE.BufferGeometry();
const backMaterial = new THREE.MeshBasicMaterial({ color: "pink", side: THREE.DoubleSide });

backGeometry.setAttribute('position', batimentGeometry.getAttribute('position'));
backGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indexOfThePointsByNormal.get("backy")!), 1))
const backMesh = new THREE.Mesh(backGeometry, backMaterial);


scene.add(rightMesh, leftMesh, topMesh, backouestMesh, backMesh);

function positionCameraNextToMesh(camera: THREE.PerspectiveCamera, mesh: THREE.Mesh, offset: THREE.Vector3) {
  // Calculer le centre de la mesh
  const boundingBox = new THREE.Box3().setFromObject(mesh);
  const center = boundingBox.getCenter(new THREE.Vector3());

  // Positionner la caméra à côté de la mesh en utilisant l'offset
  camera.position.set(center.x + offset.x, center.y + offset.y, center.z + offset.z);

  // Orienter la caméra pour qu'elle regarde vers le centre de la mesh
  camera.lookAt(center);
}

// Exemple d'utilisation avec une des meshes et un offset
const offset = new THREE.Vector3(10, 0, 0); // Déplacer la caméra de 10 unités sur l'axe X
positionCameraNextToMesh(camera, rightMesh, offset);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}
animate();
