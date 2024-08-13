import * as turf from '@turf/turf';

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

export const getFlatGridPointsOptimized = (
    polygon: [number, number][][],
    resolution: number,
  ): [number, number][][][][] => {
    let grid: [number, number][][][][] = [];
  
    // Reduce bounding box to the necessary area only
    let bbox = turf.bbox(turf.polygon(polygon));
  
    // Create a quadtree or R-tree spatial index
    // const spatialIndex = createSpatialIndex(polygon); // Example placeholder function
  
    const [minX, minY, maxX, maxY] = bbox;
    const ratio = resolution;
  
    // Iterate over the grid with a possible early-exit based on spatial index checks
    for (let x = minX; x <= maxX; x += ratio) {
      const column: [number, number][][][] = [];
      for (let y = minY; y <= maxY; y += ratio) {
        let square: [number, number][][] = [
          [
            [x, y],
            [x + ratio, y],
            [x + ratio, y + ratio],
            [x, y + ratio],
            [x, y],
          ],
        ];
  
        // Check spatial index first before performing expensive intersection
        // if (!spatialIndex.mightIntersect(square)) continue;
  
        let newPolygon = intersectPolygons(polygon, square);
  
        if (!newPolygon || newPolygon[0].length < 3) {
          continue;
        }
        column.push(newPolygon);
      }
      grid.push(column);
    }
  
    return grid;
  };
