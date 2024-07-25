import * as THREE from 'three';

// Fonction pour comparer deux normales
function compareNormals(a:number[], b: number[]): boolean {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
};

function convertToTriplet(arr: number[]): number[][] {
    const triplets: number[][] = [];

    for (let i = 0; i < arr.length; i += 3){
        triplets.push(arr.slice(i, i + 3));
    };
    return (triplets);
}

export const getOnlyFacadesGeometry = (geometry: THREE.BufferGeometry): THREE.BufferGeometry => {
    //je dois recuperer les index corrrespondqnt a des faces sur le cube donc dont les normal sont non nul
    const positions = geometry.getAttribute('position').array as Float32Array;
    const normals = geometry.getAttribute('normal').array as Float32Array;
    const indexes = geometry.getIndex()!.array as Uint16Array;
    //

    const uniqueTriplets = convertToTriplet(Array.from(normals));

    //pour le moment recupere la face gauch ;
    const matchingIndices = [];
    for (let i = 0; i < indexes.length; i += 3) {
      const a = indexes[i];
      const b = indexes[i + 1];
      const c = indexes[i + 2];
  
      const normalA = [normals[a * 3], normals[a * 3 + 1], normals[a * 3 + 2]];
      const normalB = [normals[b * 3], normals[b * 3 + 1], normals[b * 3 + 2]];
      const normalC = [normals[c * 3], normals[c * 3 + 1], normals[c * 3 + 2]];
  
      if (compareNormals(normalA, normal) && compareNormals(normalB, normal) && compareNormals(normalC, normal)) {
        matchingIndices.push(a, b, c);
      }
    }
    const indexesFacades = new Uint16Array(facesIndices);

    console.log('indexesFacades', indexesFacades); 
    
    const newGeometryFacades = new THREE.BufferGeometry();
    newGeometryFacades.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    newGeometryFacades.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    newGeometryFacades.setIndex(new THREE.BufferAttribute(indexesFacades, 1));

    console.log('newGeometryFacades', newGeometryFacades);

    return newGeometryFacades;
}

