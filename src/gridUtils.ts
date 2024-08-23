import { dotProduct, flattenPolygon, normalize, normalVector, subtract, ThreePoint } from "./facades";
import * as THREE from "three";
import earcut from "earcut"; 
import { ConvexGeometry } from "three/examples/jsm/Addons.js";
import { generateRandomColor } from "./main";

export const truncateNumber = (num: number, decimalPlaces: number): number => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.floor(num * factor) / factor;
};

/**
 * Fonction qui vérifie si un polygone est orienté dans le sens horaire
 * @param points
 * @returns true si le polygone est orienté dans le sens horaire, false sinon
 */
export const ringClockwise = (ring: ThreePoint[]): boolean => {
    // aplatir le polygone
    const A = subtract(ring[1], ring[0]);
    const B = subtract(ring[2], ring[0]);

    const normal = normalVector(ring[0], ring[1], ring[2]);

    // Orthonormalisation de Gram-Schmidt
    let u = normalize(A);
    let v = subtract(B, [dotProduct(u, B) * u[0], dotProduct(u, B) * u[1], dotProduct(u, B) * u[2]]);
    v = normalize(v);
    const o = ring[0];

    let flattened = flattenPolygon([ring], u, v, o);
    flattened = flattened.map((r) =>
        r.map((p) => [truncateNumber(p[0], 0), truncateNumber(p[1], 0)]),
    );

    let area = 0;
    const n = flattened.length;

    for (let i = 0; i < n; i++) {
        const x1 = flattened[0][i][0];
        const y1 = flattened[0][i][1];
        const x2 = flattened[0][(i + 1) % n][0]; // % n assure que l'indice revient à 0 pour le dernier point
        const y2 = flattened[0][(i + 1) % n][1];

        area += x1 * y2 - x2 * y1;
    }

    const signedArea = area / 2;
    const isClockwiseFlattened = signedArea < 0;

    // Si le polygone aplati est dans le sens horaire et que le vecteur normal pointe vers le haut,
    // cela signifie que le polygone 3D est également dans le sens horaire. Sinon, il est antihoraire.
    const isClockwise = normal[2] >= 0 === isClockwiseFlattened;

    return isClockwise;
};


export const ringClockwise2 = (ring: ThreePoint[]): boolean => {
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
    const normals: number[] = [];

    // Flatten the vertices array
    const flatVertices = verticesArray.flat();

    // Use earcut to triangulate the polygon
    const indices = earcut(flatVertices, [], 3);

    // Calculate normals for each triangle
    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];

        const vertexA = new THREE.Vector3(flatVertices[a * 3], flatVertices[a * 3 + 1], flatVertices[a * 3 + 2]);
        const vertexB = new THREE.Vector3(flatVertices[b * 3], flatVertices[b * 3 + 1], flatVertices[b * 3 + 2]);
        const vertexC = new THREE.Vector3(flatVertices[c * 3], flatVertices[c * 3 + 1], flatVertices[c * 3 + 2]);

        const normal = new THREE.Vector3().crossVectors(
            new THREE.Vector3().subVectors(vertexB, vertexA),
            new THREE.Vector3().subVectors(vertexC, vertexA)
        ).normalize();

        normals.push(normal.x, normal.y, normal.z);
        normals.push(normal.x, normal.y, normal.z);
        normals.push(normal.x, normal.y, normal.z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(flatVertices), 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    geometry.setIndex(indices);
    
    const material = new THREE.MeshBasicMaterial({ color: generateRandomColor(), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;}


//debut fix try number 1 need to be done for each fcking polygone 
export function createTriangles(vertices: any[]): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry(); 
    const position: number[] = [];
    const colors: number[] = [];

    console.log("create TRINAGLEs", vertices);

    const color = new THREE.Color();
    for (let i = 0; i < vertices.length; i += 4) {
        const v1 = vertices[i * 4];
        const v2 = vertices[i * 4 + 1];
        const v3 = vertices[i * 4 + 2];
        const v4 = vertices[i * 4 + 3];

        //premier triangle
        position.push(v1[0], v1[1], v1[2], v2[0], v2[1], v2[2], v3[0], v3[1], v3[2]);
        console.log(position);
        color.set(Math.random() * 0xffffff);
        for (let j = 0; j < 3; j++) {
            colors.push(color.r, color.g, color.b);
        }
        //deuxieme triangle
        position.push(v1[0], v1[1], v1[2], v3[0], v3[1], v3[2], v4[0], v4[1], v4[2]);
        color.set(Math.random() * 0xffffff);
        for (let j = 0; j < 3; j++) {
            colors.push(color.r, color.g, color.b);
        }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position), 3));

    console.log(geometry);

    return geometry;
}

export function flattenData(data: any[][][][][]): THREE.Vector3[] {
    const vertices: THREE.Vector3[] = [];

    data.forEach((layer) => {
        layer.forEach((square) => {
            square.forEach((point) => {
                vertices.push(new THREE.Vector3(point[0] as unknown as number, point[1] as unknown as number, point[2] as unknown as number));
            });
        });
    });
    return vertices;
}


