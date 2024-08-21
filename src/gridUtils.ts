import { dotProduct, flattenPolygon, normalize, normalVector, subtract, ThreePoint } from "./facades";
import * as THREE from "three";
import earcut from "earcut"; 
import { ConvexGeometry } from "three/examples/jsm/Addons.js";

export const truncateNumber = (num: number, decimalPlaces: number): number => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.floor(num * factor) / factor;
};

/**
 * Fonction qui vérifie si un polygone est orienté dans le sens horaire
 * @param points
 * @returns true si le polygone est orienté dans le sens horaire, false sinon
 */
//export const ringClockwise = (ring: ThreePoint[]): boolean => {
//    // aplatir le polygone
//    const A = subtract(ring[1], ring[0]);
//    const B = subtract(ring[2], ring[0]);

//    const normal = normalVector(ring[0], ring[1], ring[2]);

//    // Orthonormalisation de Gram-Schmidt
//    let u = normalize(A);
//    let v = subtract(B, [dotProduct(u, B) * u[0], dotProduct(u, B) * u[1], dotProduct(u, B) * u[2]]);
//    v = normalize(v);
//    const o = ring[0];

//    let flattened = flattenPolygon([ring], u, v, o);
//    flattened = flattened.map((r) =>
//        r.map((p) => [truncateNumber(p[0], 0), truncateNumber(p[1], 0)]),
//    );

//    let area = 0;
//    const n = flattened.length;

//    for (let i = 0; i < n; i++) {
//        const x1 = flattened[0][i][0];
//        const y1 = flattened[0][i][1];
//        const x2 = flattened[0][(i + 1) % n][0]; // % n assure que l'indice revient à 0 pour le dernier point
//        const y2 = flattened[0][(i + 1) % n][1];

//        area += x1 * y2 - x2 * y1;
//    }

//    const signedArea = area / 2;
//    const isClockwiseFlattened = signedArea < 0;

//    // Si le polygone aplati est dans le sens horaire et que le vecteur normal pointe vers le haut,
//    // cela signifie que le polygone 3D est également dans le sens horaire. Sinon, il est antihoraire.
//    const isClockwise = normal[2] >= 0 === isClockwiseFlattened;

//    return isClockwise;
//};


export const ringClockwise = (ring: ThreePoint[]): boolean => {
    if (ring.length < 3) return false;

    const v1 = subtract(ring[1], ring[0]);
    const v2 = subtract(ring[2], ring[0]);
    const crossProduct = [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    ];

    // If the z-component of the cross product is positive, it's clockwise
    return crossProduct[2] > 0;
};

//!! for developement purpose only
const buildIndices = (polygon: ThreePoint[][]): number[] => {
    // Flatten the polygon
    let flatVertices: number[] = [];
    polygon.forEach(ring => {
      flatVertices = flatVertices.concat(ring.flat());
    });
  
    // Identify hole indices
    const holeIndices = [];
    let indexCount = polygon[0].length;
    for (let i = 1; i < polygon.length; i++) {
      holeIndices.push(indexCount);
      indexCount += polygon[i].length;
    }
  
    // Use earcut to triangulate
    const indices = earcut(flatVertices, [], 3);
  
    return indices;
  };

export function createPolygon(verticesArray: any[]) {
    const geometry = new THREE.BufferGeometry();
    const vertices: any[] = [];

    verticesArray.forEach((vertex) => {
        vertices.push(...vertex);
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    const material = new THREE.MeshBasicMaterial({ color: "#FF0000", wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
   
    return mesh;
}
