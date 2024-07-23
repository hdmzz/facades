import *  as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

interface BatimentData {
  data: {
    attributes: {
      position: {
        array: number[];
      };
      normal: {
        array: number[];
      };
    };
  };
}

//recuperer le batiment
const url = "/Bat.json"
const batiment = await fetch(url)
  .then(response => response.json()).then(data => {return data.geometries[0].geometry;});//ok
//conversion des donnes json en buffergeometry

const normals = batiment.data.attributes.normal.array;
const indices = batiment.data.index.array;
const positions = batiment.data.attributes.position.array;

//recupertion des facades 
function getFacades<T extends BatimentData>(batiment: T) {
  const faces = [];
  const normals = [];

  const vertices = batiment.data.attributes.position.array;
  const facesNormals = batiment.data.attributes.normal.array; 

  for (let i = 0 ; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];

    if (facesNormals[i + 1] != 0) continue;

    faces.push(x, y, z);
    normals.push(facesNormals[i], facesNormals[i + 1], facesNormals[i + 2]);
  };
  return {faces, normals};
}

function extractFacades(normals: number[], indices: number[], positions: number[]) {
  const facades = [];//stock les vertex; positions
  const normals2 = [];//stock les normales; normal
  const indexes = [];//stock les indices; index

  // Parcourir les indices par groupes de 3 (chaque groupe représente une face)
  for (let i = 0; i < indices.length; i += 3) {
      const normalIndex = indices[i] * 3;
      const normal = [normals[normalIndex], normals[normalIndex + 1], normals[normalIndex + 2]];

      // Vérifier si la normale est horizontale (composante y = 0)
      if (normal[1] === 0) {
          const faceIndices = [indices[i], indices[i + 1], indices[i + 2]];
          const faceVertices = faceIndices.map(index => {
              const vertexIndex = index * 3;
              return [
                  positions[vertexIndex],
                  positions[vertexIndex + 1],
                  positions[vertexIndex + 2]
              ];
          });
          facades.push(...faceVertices);
          normals2.push(...normal);
          indexes.push(...faceIndices);
      }
  }

  return {facades, normals2, indexes};
}

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

//render looop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

const facades = extractFacades(normals, indices, positions);
const onlyFacadesGeometry = new THREE.BufferGeometry();

const vertices = new Float32Array(facades.facades.flat());
const normals2 = new Float32Array(facades.normals2);

const geometry = loader.parse(batiment);

geometry.scale(0.09, 0.09, 0.09);
// Compute the bounding box of the geometry
geometry.computeBoundingBox();
const boundingBox = geometry.boundingBox;

// Calculate the center of the bounding box
const center = new THREE.Vector3();
boundingBox?.getCenter(center);

const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
material.side = THREE.DoubleSide;

geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
geometry.setAttribute("normal", new THREE.BufferAttribute(normals2, 3));

const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh, gridHelper);

mesh.position.sub(center);

// Set the camera position and look at the center
camera.position.set(center.x, center.y, center.z + 10);
camera.lookAt(center);

const facadesMesh = new THREE.Mesh(onlyFacadesGeometry, material);


scene.add(facadesMesh);

animate();

