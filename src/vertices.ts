import earcut from 'earcut';
import * as THREE from 'three';
import { ConvexGeometry, ConvexHull } from 'three/examples/jsm/Addons.js';

function generateKey(normal: [number, number, number]): string {
    return normal.join(',');
};

export function isolateFaces(vertices: THREE.Vector3[]): THREE.BufferGeometry {//vertices doit etre un tableau de vecteurs 3D
    // Generate the geometry using ConvexGeometry
    console.log(vertices);
    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);

    console.log(geometry);
    return geometry;

    //const faces = new Map<string, number[]>();
    //for (let i = 0; i < norm.length; i += 3) {
    //const key = generateKey([norm[i], norm[i + 1], norm[i + 2]]);
    //if (!faces.has(key)) {
    //    faces.set(key, []);
    //}
    //faces.get(key)!.push(posi[i], posi[i + 1], posi[i + 2]);
    //};
}


export function createFace(face: number[]): THREE.Mesh {
    //create a geometry for the array of indices int arguments
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(face);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const faceMesh = new THREE.Mesh(geometry, material);
    return ( faceMesh );
}

export function createGeometry(vertices: [number, number, number][][]): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();

    const flatVertices = vertices.flat(2);//prend la profondeur du tableau et l'aplatit

    const verticesArray = new Float32Array(flatVertices);
    geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
    return ( geometry );

}
