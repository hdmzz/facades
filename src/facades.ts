import * as THREE from 'three';
import earcut from "earcut";
import * as turf from '@turf/turf';

export type ThreePoint = [number, number, number];
export type FlattenConfig = {
  u: ThreePoint;
  v: ThreePoint;
  o: ThreePoint;
};


// Calculer le vecteur normal au plan formé par les points a, b, c
export function normalVector(
  a: ThreePoint,
  b: ThreePoint,
  c: ThreePoint,
): ThreePoint {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  return [
    ab[1] * ac[2] - ab[2] * ac[1],
    ab[2] * ac[0] - ab[0] * ac[2],
    ab[0] * ac[1] - ab[1] * ac[0],
  ];
}

export function subtract(a: ThreePoint, b: ThreePoint): ThreePoint {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}


export function normalize(v: ThreePoint): ThreePoint {
  const length = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);

  if (length === 0) {
    return [0, 0, 0];
  }

  return [v[0] / length, v[1] / length, v[2] / length];
}


export function dotProduct(v1: ThreePoint, v2: ThreePoint): number {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

export function flattenPolygon(
  polygon: ThreePoint[][],
  u: ThreePoint,
  v: ThreePoint,
  origin: ThreePoint,
): [number, number][][] {
  if (polygon.length === 0 || polygon[0].length < 3) {
    throw new Error(
      'Un polygone doit avoir un contour extérieur avec au moins 3 points.',
    );
  }

  // Projeter les points sur le plan 2D (u, v)
  return polygon.map((ring) =>
    ring.map((point) => {
      const d = subtract(point, origin);
      return [dotProduct(u, d), dotProduct(v, d)];
    }),
  );
}

// Fonction pour transformer un point 2D en 3D
export function unprojectPoint(
  u: ThreePoint,
  v: ThreePoint,
  origin: ThreePoint,
  point: [number, number],
): ThreePoint {
  return [
    origin[0] + point[0] * u[0] + point[1] * v[0],
    origin[1] + point[0] * u[1] + point[1] * v[1],
    origin[2] + point[0] * u[2] + point[1] * v[2],
  ];
}

// Fonction pour transformer un polygone 2D en 3D
export function unflattenPolygon(
  cell: [number, number][][],
  u: ThreePoint,
  v: ThreePoint,
  origin: ThreePoint,
): ThreePoint[][] {
  if (cell.length === 0 || cell[0].length < 3) {
    throw new Error(
      'Un polygone doit avoir un contour extérieur avec au moins 3 points.',
    );
  }

  return cell.map((ring) =>
    ring.map((point) => unprojectPoint(u, v, origin, point)),
  );
}

/** 
 * Fonction pour trianguler un polygone 3D afin d'obtenir une liste d'indices pour créer un BufferGeometry
 * @param polygon
 * @returns
 */
export const getPolygoneTrianglatedIndices = (
  polygon: ThreePoint[][],
): number[] => {
  const mainRing = polygon[0];

  // aplatir le polygone
  const A = subtract(mainRing[1], mainRing[0]);
  const B = subtract(mainRing[2], mainRing[0]);

  // Orthonormalisation de Gram-Schmidt
  let u = normalize(A);
  let v = subtract(B, [dotProduct(u, B) * u[0], dotProduct(u, B) * u[1], dotProduct(u, B) * u[2]]);
  v = normalize(v);
  const o = mainRing[0];

  let flatVertices: number[] = [];
  polygon.forEach((ring) => {
    const flattened = flattenPolygon([ring], u, v, o)[0];
    flatVertices = flatVertices.concat(flattened.flat());
  });

  const holeIndices = [];
  let indexCount = mainRing.length;
  for (let i = 1; i < polygon.length; i++) {
    holeIndices.push(indexCount);
    indexCount += polygon[i].length;
  }

  const triangulatedIndices = earcut(flatVertices, holeIndices);

  return triangulatedIndices;
};

/**
 * Creates a THREE.BufferGeometry from a 3D polygon represented as an array of rings.
 * Each ring is an array of 3D points (ThreePoint[]).
 *
 * @param polygon - The 3D polygon represented as an array of rings.
 * @returns A THREE.BufferGeometry representing the 3D polygon.
 */
export function createBufferGeometryFromPolygon(
  polygon: ThreePoint[][],
): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];

  // Remplir le tableau des sommets
  for (const ring of polygon) {
    for (const point of ring) {
      vertices.push(...[point[0], point[1], point[2]].reverse());
  }
  }

  // Utiliser earcut pour obtenir les indices de triangle
  const earcutIndices = getPolygoneTrianglatedIndices(
    polygon.map((r) => r.map((p) => [p[0], p[1], p[2]] as ThreePoint)),
  );

  // Remplir le tableau des indices
  for (const index of earcutIndices) {
    indices.push(index);
  }

  // Créer un BufferGeometry et attribuer les attributs
  const bufferGeometry = new THREE.BufferGeometry();
  bufferGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  bufferGeometry.setIndex(
    new THREE.BufferAttribute(new Uint32Array(indices), 1),
  );
  bufferGeometry.computeVertexNormals();

  // Vérifier et ajuster l'orientation des normales
  ensureNormalsPointUpwards(bufferGeometry);

  return bufferGeometry;
}

/**
 * Fonction qui vérifie si la normale de la géométrie pointe vers le haut si la géométrie est parallèle au sol
 * @param bufferGeometry
 */
export function ensureNormalsPointUpwards(
  bufferGeometry: THREE.BufferGeometry,
): void {
  const positions = bufferGeometry.attributes.position.array as Float32Array;
  const numVertices = positions.length / 3;

  // 1. Vérifiez si la géométrie est parallèle au sol
  let isParallel = true;
  const firstZ = positions[2];
  for (let i = 1; i < numVertices && isParallel; i++) {
    if (positions[i * 3 + 2] !== firstZ) {
      isParallel = false;
    }
  }

  if (isParallel) {
    // 2. Calculez la normale d'une face
    // Prenez simplement les trois premiers points pour calculer la normale
    const a: ThreePoint = [positions[0], positions[1], positions[2]];
    const b: ThreePoint = [positions[3], positions[4], positions[5]];
    const c: ThreePoint = [positions[6], positions[7], positions[8]];
    const norm = normalize(normalVector(a, b, c));

    // 3. Vérifiez la direction de la normale
    if (norm[2] < 0) {
      // 4. Corrigez l'orientation de la géométrie
      const indices = bufferGeometry.index?.array as Uint32Array;
      for (let i = 0; i < indices.length; i += 3) {
        const tmp = indices[i];
        indices[i] = indices[i + 1];
        indices[i + 1] = tmp;
      }
      if (bufferGeometry.index) {
        bufferGeometry.index.needsUpdate = true;
      }
      bufferGeometry.computeVertexNormals();
    }
  }
}

export function intersectPolygons(
  polygon1: [number, number][][],
  polygon2: [number, number][][],
  ): [number, number][][] | null {
    const geojsonPolygon1 = turf.polygon(polygon1);
    const geojsonPolygon2 = turf.polygon(polygon2);


    const featureCollection = turf.featureCollection([geojsonPolygon1, geojsonPolygon2]);

    const intersection = turf.intersect(featureCollection);

    if (intersection && Array.isArray(intersection.geometry.coordinates)) {
      return intersection.geometry.coordinates as [number, number][][];
    }

    return null;
}
