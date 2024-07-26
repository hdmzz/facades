import * as THREE from 'three';

// Fonction pour comparer deux normales
function normalKey(normal: number[]): string {
    return normal.join(',');
}

export const getOnlyFacadesGeometry = (geometry: THREE.BufferGeometry): Map<string, number[]> => {
    //je dois recuperer les index corrrespondqnt a des faces sur le cube donc dont les normal sont non nul
    const normals = geometry.getAttribute('normal').array as Float32Array;
    const indexes = geometry.getIndex()!.array as Uint16Array;

    const pointsGroupByNormal: Map<string, number[]> = new Map();

    for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i];
        const normal = [normals[index * 3], normals[index * 3 + 1], normals[index * 3 + 2]];

        if (normal[0] < 0 && normal[1] === 0 && normal[2] >= 0) {
            const key = "lefty";
            if (!pointsGroupByNormal.get(key)) {
                pointsGroupByNormal.set(key, [index]);
            } else {
                pointsGroupByNormal.get(key)!.push(index);
            }
        }
        else if (normal[0] > 0 && normal[1] === 0 && normal[2] >= 0) {
            const key = "righty";
            if (!pointsGroupByNormal.get(key)) {
                pointsGroupByNormal.set(key, [index]);
            } else {
                pointsGroupByNormal.get(key)!.push(index);
            }
        }
        else if (normal[0] <= 0 && normal[1] === 0 && normal[2] >= 0) {
            const key = "fronty";
            if (!pointsGroupByNormal.get(key)) {
                pointsGroupByNormal.set(key, [index]);
            } else {
                pointsGroupByNormal.get(key)!.push(index);
            }
        }
        else if (normal[0] >= 0 && normal[1] < 0 && normal[2] >= 0) {
            const key = "topy";
            if (!pointsGroupByNormal.get(key)) {
                pointsGroupByNormal.set(key, [index]);
            } else {
                pointsGroupByNormal.get(key)!.push(index);
            }
        }

        else if (normal[0] < 0 && normal[1] === 0 && normal[2] < 0) {
            const key = "backy";

            if (!pointsGroupByNormal.get(key)) {
                pointsGroupByNormal.set(key, [index]);
            } else {
                pointsGroupByNormal.get(key)!.push(index);
            }
        }
        if (normal[0] > 0 && normal[1] === 0 && normal[2] < 0) {
            const key = "backouesty";

            if (!pointsGroupByNormal.get(key)) {
                pointsGroupByNormal.set(key, [index]);
            } else {
                pointsGroupByNormal.get(key)!.push(index);
            }
        }
        
    }

    console.log('pointsGroupByNormal', pointsGroupByNormal);

    return (pointsGroupByNormal);
}


