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

export function createGeometry(vertices: [number, number, number][]): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();

    const flatVertices = vertices.flat(1);//prend la profondeur du tableau et l'aplatit

    const verticesArray = new Float32Array(flatVertices);
    geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
    return ( geometry );

}
