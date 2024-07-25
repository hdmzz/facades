import * as THREE from 'three';

// Fonction pour comparer deux normales
function normalKey(normal: number[]): string {
    return normal.join(',');
}

export const getOnlyFacadesGeometry = (geometry: THREE.BufferGeometry): THREE.BufferGeometry => {
    //je dois recuperer les index corrrespondqnt a des faces sur le cube donc dont les normal sont non nul
    const positions = geometry.getAttribute('position').array as Float32Array;
    const normals = geometry.getAttribute('normal').array as Float32Array;
    const indexes = geometry.getIndex()!.array as Uint16Array;

    const pointsGroupByNormal: Map<string, number[]> = new Map();

    for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i];
        const normal = [normals[index * 3], normals[index * 3 + 1], normals[index * 3 + 2]];

        const key = normalKey(normal);
        if (!pointsGroupByNormal.get(key)) {
            pointsGroupByNormal.set(key, [index]);
        } else {
            pointsGroupByNormal.get(key)!.push(index);
        }
    }

    console.log('pointsGroupByNormal', pointsGroupByNormal);

    const indexesFacades = 0;

    console.log('indexesFacades', indexesFacades); 
    
    const newGeometryFacades = new THREE.BufferGeometry();
    newGeometryFacades.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    newGeometryFacades.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    newGeometryFacades.setIndex(new THREE.BufferAttribute(indexesFacades, 1));

    console.log('newGeometryFacades', newGeometryFacades);

    return newGeometryFacades;
}


