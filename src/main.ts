import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import earcut from 'earcut';
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


interface Point {
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
  
  // Usage:
  const facePoints = extractFacePoints(data);

  function createFace(points: Point[]): THREE.Mesh {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(points.flatMap(p => [p.x, p.y, p.z]));
    const indices = earcut(vertices, [], 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xFFFFFF << 0, side: THREE.DoubleSide });    return new THREE.Mesh(geometry, material);
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

// Create and add each face to the scene
groupedFaces.forEach((faces, _normal) => {
    faces.forEach(face => {
        const faceMesh = createFace(face);
        scene.add(faceMesh);
    });
});

//regrouper les face par normales
// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}

animate();
