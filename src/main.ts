import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { dotProduct, flattenPolygon, normalize, subtract, createBufferGeometryFromPolygon, ThreePoint, unflattenPolygon } from './facades';
import { constructBat } from './Constructor';
import { getFlatGridPoints } from './grid';
import Polygon from './Polygon';
import { create } from 'domain';
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

const BatPoints = bat.getPolygonFromPolyhedron().map((polygon) => polygon.toGeojsonCoordinates());

const bufferGeometries: THREE.BufferGeometry[] = [];
let firstPoint: [number, number, number] | null = null;

/**
 * Fonction pour obtenir une grille de cellule à l'intérieur d'un polygone 3D
 * @param polygon Le polygone 3D est un polygone dont tous les points sont sur le même plan
 * @param resolution la taille maximale du côté d'une cellule
 * @return Une grille de cellules qui prend la place de la face
 */

//!!!fonction reprendre depuis poc imbrque
const createPolygonFromPoints = (cell: any[]) => {
  let polygon = [];
  polygon = cell.map((ring: any[]) => {
    return ring.map((point) => {
      return [point[0], point[1], point[2]];
    });
  });
  return polygon;
}

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
export const getGridPoints = (originalBatPoints: any, ratio: number) => {
  originalBatPoints.forEach((polygon: any[], _i: number) => {
    console.log("polygon", _i);
    const newPolygon: [number, number, number][][] = [];
    polygon.forEach((ring: any[]) => {
      const newRing: [number, number, number][] = [];
      ring.forEach((segment: any[]) => {
        segment.map((point: [number, number, number]) => {
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
  
    // Applatissement
    const A = subtract(newPolygon[0][1], newPolygon[0][0]);
    const B = subtract(newPolygon[0][2], newPolygon[0][0]);
  
    let u = normalize(A);
    let v = subtract(B, [dotProduct(u, B) * u[0], dotProduct(u, B) * u[1], dotProduct(u, B) * u[2]]);
    v = normalize(v);
    const o = newPolygon[0][0];
  
    const flattenedPolygon = flattenPolygon(newPolygon, u, v, o);

    const grid = getFlatGridPoints(flattenedPolygon, ratio);

    let unflattenGrid = grid.map((col) => {
      return col.map((cell)  => {
        return unflattenPolygon(cell, u, v, o)
      });
    });


    const unflatG = unflattenGrid.map((col) => {
      return createPolygonFromPoints(col);
    })

    console.log("unflatG", unflatG);//unflatG correspond a une face 
    //une question demeure quqnd qppeler cette fonction
  });
};


getGridPoints(BatPoints, 1);

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

animate();

