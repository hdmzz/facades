import * as turf from '@turf/turf';
import RBush from 'rbush';
import { dotProduct, flattenPolygon, normalize, subtract, ThreePoint, unflattenPolygon } from './facades';

interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  square: [number, number][][];
}

const comparePoint = (a: [number, number, number], b: [number, number, number]) => {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

const tableIncludePoint = (table: [number, number, number][], point: [number, number, number]) => {
  for (let i = 0; i < table.length; i++) {
    if (comparePoint(table[i], point)) return true;
  }
  return false;
}

/**
 * Calculates the intersection of two polygons.
 *
 * @param polygon1 - The first polygon as an array of coordinate pairs.
 * @param polygon2 - The second polygon as an array of coordinate pairs.
 * @returns The intersection of the two polygons as an array of coordinate pairs, or `null` if there is no intersection.
 */
export function intersectPolygons(
    polygon1: [number, number][][],
    polygon2: [number, number][][],
  ): [number, number][][] | null {
    const geojsonPolygon1 = turf.polygon(polygon1);
    const geojsonPolygon2 = turf.polygon(polygon2);
  
    
    const featurCollection = turf.featureCollection([geojsonPolygon1, geojsonPolygon2]);
    const intersection = turf.intersect(featurCollection);
  
    if (intersection && intersection.geometry && Array.isArray(intersection.geometry.coordinates)) {

        return intersection.geometry.coordinates as [number, number][][];
    }
  
    return null;
}

function getThreePoints(ring: any[]): ThreePoint[] {
  return ring.map((point) => {
    return [...point];
  }) as ThreePoint[];
}

const formatHoles = (polygon: any[]) => {
  let extreriorRingClockwise: boolean = true;
  for (let i = 0; i < polygon.length; i++) {
    const threePoints = getThreePoints(polygon[i]);
    //const isClockwise = ringClockwise(
    //  threePoints.map((point: any) => {return point.slice(0, 2)}),
    //);
    //console.log(`isClockwise ${i} `, isClockwise);
    //if (i === 0) extreriorRingClockwise = isClockwise;
    //else if (isClockwise === extreriorRingClockwise)
    //  polygon[i].reverse();
  }
};

/**
 * Fonction pour obtenir une grille de cellule à l'intérieur d'un polygone 3D
 * @param polygon Le polygone 3D est un polygone dont tous les points sont sur le même plan
 * @param resolution la taille maximale du côté d'une cellule
 * @return Une grille de cellules qui prend la place de la face
 */
const createPolygonFromPoints = (cell: any[]) => {
  let polygon = [];
  polygon = cell.map((ring: any[]) => {
    return ring.map((point) => {
      return [point[0], point[1], point[2]];
    });
  });
  //CCW
  formatHoles(polygon);//RAF formatHoles
  return polygon;
}

export const getFlatGridPoints = (
    polygon: [number, number][][],
    resolution: number,
  ): [number, number][][][][] => {
  let grid: [number, number][][][][] = [];

  const bbox = turf.bbox(turf.polygon(polygon));
  const [minX, minY, maxX, maxY] = bbox;

  const ratio = resolution;

  const rtree = new RBush<BBox>();

  for (let x = minX; x <= maxX; x += ratio) {
    for (let y = minY; y <= maxY; y += ratio) {
      //creation of the square cell
      const square: [number, number][][] = [
        [
          [x, y],
          [x + ratio, y],
          [x + ratio, y + ratio],
          [x, y + ratio],
          [x, y],
        ],
      ];

      const cellBBox = {
        minX: x,
        minY: y,
        maxX: x + ratio,
        maxY: y + ratio,
        square,
      };

      rtree.insert(cellBBox);
    }
  }

  const queryBBox = {
    minX,
    minY,
    maxX,
    maxY,
  };

  const potentialCells = rtree.search(queryBBox);
  
  for (const cell of potentialCells) {
    const newPolygon = intersectPolygons(polygon, cell.square);

    if (newPolygon && newPolygon[0].length >= 3) {
      const columnIndex = Math.floor((cell.minX - minX) / ratio);
      if (!grid[columnIndex]) grid[columnIndex] = [];
      grid[columnIndex].push(newPolygon);
    }
  }

  return grid;
};

/**
 * Generates a grid of points from a set of polygons, using a specified ratio.
 *
 * @param originalBatPoints - An array of polygons, where each polygon is an array of points.
 * @param ratio - The ratio to use when generating the grid.
 * @returns A grid of polygons, where each polygon is an array of points.
 */
export const getGridPoints = (polygon: any[], ratio: number): [number, number, number][][][][] => {
  let firstPoint: [number, number, number] | null = null;
  const newPolygon: [number, number, number][][] = [];
  polygon.forEach((ring: any[], i) => {
    if (i > polygon.length - 1) return;
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

  const A = subtract(newPolygon[0][1], newPolygon[0][0]);
  const B = subtract(newPolygon[0][2], newPolygon[0][0]);

  let u = normalize(A);
  let v = subtract(B, [dotProduct(u, B) * u[0], dotProduct(u, B) * u[1], dotProduct(u, B) * u[2]]);
  v = normalize(v);
  const o = newPolygon[0][0];

  const flattenedPolygon = flattenPolygon(newPolygon, u, v, o);

  const grid = getFlatGridPoints(flattenedPolygon, ratio);

  console.log(grid);
  
  let unflattenGrid = grid.map((col) => {
    return col.map((cell)  => {
      return unflattenPolygon(cell, u, v, o)
    });
  });

  
  const unflatG = unflattenGrid.map((col) => {
    return createPolygonFromPoints(col);
  })
  return unflatG;
};
  