import * as turf from '@turf/turf';
import RBush from 'rbush';

interface BBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    square: [number, number][][];
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

export const getFlatGridPoints = (
    polygon: [number, number][][],
    resolution: number,
  ): [number, number][][][][] => {
    let grid: [number, number][][][][] = [];
  
    // Calculate the bounding box of the polygon
    const bbox = turf.bbox(turf.polygon(polygon));
    const [minX, minY, maxX, maxY] = bbox;
  
    const ratio = resolution;
  
    // Create the R-tree spatial index
    const rtree = new RBush<BBox>();
  
    // Populate the R-tree with the grid cells
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
  
        // Calculate the bounding box for the grid cell
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
  
    // Query the R-tree with the polygon's bounding box
    const queryBBox = {
      minX,
      minY,
      maxX,
      maxY,
    };
  
    // Get all the cells that might intersect with the polygon
    const potentialCells = rtree.search(queryBBox);
    
    console.log("potentialCells", potentialCells);

    // Iterate over the potential cells and check for actual intersection
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

  