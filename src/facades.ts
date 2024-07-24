import { buffer } from 'stream/consumers';
import * as THREE from 'three';

export const getOnlyFacadesGeometry = (geometry: THREE.BufferGeometry): THREE.BufferGeometry => {
    //je dois recuperer les index corrrespondqnt a des faces sur le cube donc dont les normal sont non nul
    const positions = geometry.getAttribute('position').array as Float32Array;
    const normals = geometry.getAttribute('normal').array as Float32Array;
    const indexes = geometry.getIndex()!.array as Uint16Array;
    console.log('norm', normals);
    console.log('indexes', indexes);
    //pour le moment recupere la face gauch ;
    const leftFaceIndices = [];
    for (let i = 0; i < indexes.length; i += 3) {
      const a = indexes[i];
      const b = indexes[i + 1];
      const c = indexes[i + 2];
    
      const normalA = new THREE.Vector3(normals[a * 3], normals[a * 3 + 1], normals[a * 3 + 2]);
      const normalB = new THREE.Vector3(normals[b * 3], normals[b * 3 + 1], normals[b * 3 + 2]);
      const normalC = new THREE.Vector3(normals[c * 3], normals[c * 3 + 1], normals[c * 3 + 2]);
    
      const leftNormal = new THREE.Vector3(-1, 0, 0);
      
    
      if (normalA.equals(leftNormal) && normalB.equals(leftNormal) && normalC.equals(leftNormal)) {
        leftFaceIndices.push(a, b, c);
      }
    }

    const indexesFacades = new Uint16Array(leftFaceIndices);

    console.log('indexesFacades', indexesFacades); 
    
    const newGeometryFacades = new THREE.BufferGeometry();
    newGeometryFacades.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    newGeometryFacades.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    newGeometryFacades.setIndex(new THREE.BufferAttribute(indexesFacades, 1));

    console.log('newGeometryFacades', newGeometryFacades);

    return newGeometryFacades;
}

