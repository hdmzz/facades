import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import earcut from 'earcut';
import { dot, flattenPolygon, normalize, substract } from './facades';
const url = "/Bat.json"

const gridHelper = new THREE.GridHelper(10, 10);

const response = fetch(url);
const data = await (await response).json();

console.log(data);
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

function extractFacePoints(data: any): Point[][] {
  const faces: Point[][] = [];

  data.polyhedron.forEach((item: any) => {
    item.polygon.forEach((poly: any) => {
      const facePoints: Point[] = [];
      poly.forEach((segment: any) => {
        segment.segment.forEach((point: any) => {
          facePoints.push({
            x: point.x,
            y: point.y,
            z: point.z
          });
        });
      });
      // Remove duplicate points
      const uniquePoints = facePoints.filter((point, index, self) =>
        index === self.findIndex((t) => 
          t.x === point.x && t.y === point.y && t.z === point.z
        )
      );
      faces.push(uniquePoints);
    });
  });

  return faces;
}

const facePoints = extractFacePoints(data);

  function createFace(points: Point[]): THREE.Mesh {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(points.flatMap(p => [p.x, p.y, p.z]));//on prend l'ensemble des points de chaque face et on creer un tableau de sommet 
  const indices = earcut(vertices, [], 3);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xFFFFFF << 0, side: THREE.DoubleSide });   
  return new THREE.Mesh(geometry, material);
}

function calculateNormal(face: Point[]): THREE.Vector3 {
  if (face.length < 3) {
      return new THREE.Vector3(0, 1, 0); // Default normal if face is invalid
  }
  const v1 = new THREE.Vector3().subVectors(
      new THREE.Vector3(face[1].x, face[1].y, face[1].z),
      new THREE.Vector3(face[0].x, face[0].y, face[0].z)
  );
  const v2 = new THREE.Vector3().subVectors(
      new THREE.Vector3(face[2].x, face[2].y, face[2].z),
      new THREE.Vector3(face[0].x, face[0].y, face[0].z)
  );
  return new THREE.Vector3().crossVectors(v1, v2).normalize();
}

function areNormalsSimilar(normal1: THREE.Vector3, normal2: THREE.Vector3, tolerance: number = 0.01): boolean {
  return normal1.dot(normal2) > 1 - tolerance;
}

function groupFacesByNormal(faces: Point[][]): Map<string, Point[][]> {
  const groupedFaces = new Map<string, Point[][]>();

  faces.forEach(face => {
      const normal = calculateNormal(face);
      let added = false;

      for (const [key, group] of groupedFaces.entries()) {
          const groupNormal = new THREE.Vector3().fromArray(key.split(',').map(Number));
          if (areNormalsSimilar(normal, groupNormal)) {
              group.push(face);
              added = true;
              break;
          }
      }

      if (!added) {
          groupedFaces.set(normal.toArray().join(','), [face]);
      }
  });

  return groupedFaces;
}

const groupedFaces = groupFacesByNormal(facePoints);
console.log(groupedFaces);

//* pour etude on dessine les faces 
// Create and add each face to the scene
//groupedFaces.forEach((faces, _normal) => {
//  faces.forEach(face => {
//      const faceMesh = createFace(face);
//      scene.add(faceMesh);
//  });
//});

//!! 1er pour chaque face u batiment faire cela 
const dataToTransform = groupedFaces.get("0.4679582055497792,0,0.8837505970909614");//equivaut polygon dans fction POC
if (!dataToTransform) {
  throw new Error("No face with the specified normal found");
}

const polygonPoint = dataToTransform[0];
console.log(polygonPoint);

const A = substract(polygonPoint[1], polygonPoint[0]);
const B = substract(polygonPoint[2], polygonPoint[0]);

let u = normalize({x: A.x, y: A.y, z: A.z});
let v = substract(B, {x: dot(u, B) * u.x, y: dot(u, B) * u.y, z: dot(u, B) * u.z});
v = normalize(v);
const o = polygonPoint[0];

const flattenedPolygon = flattenPolygon(dataToTransform, u, v, o);

//flatten polygon 2D est juste un tableu de plusieurs sommets(vertices) c'est un quadrilatere
//on peut donc dessiner les lignes sur le canvas


function drawFlattenPolygon(polygonArr: [number, number][][], color: string = 'black') {
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


//! on dessine la face 2D pour test
//!loop pour chaque face de la shape on utilise THREE Shape pour cela 

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

animate();

drawFlattenPolygon(flattenedPolygon);
