import { Polygon as GeoJsonPolygon } from "geojson";
import { v4 as uuidv4 } from "uuid";
import { Object3D } from "./Object3d";
import type Point from "./Point";
import type Segment from "./Segment";

/**
 * Represents a polygon in 3D space.
 *
 * @class Polygon
 * @implements {Object3D}
 */
class Polygon implements Object3D {
  public id: string;
  public isVisible: boolean;
  public isMovable: boolean;

  public polygon: Segment[][];

  constructor() {
    this.id = uuidv4();
    this.isVisible = true;
    this.isMovable = true;
    this.polygon = [[]];
  }

  /**
   * Moves the polygon by the specified amount in the x, y, and z directions.
   *
   * @param {number} x - The amount to move in the x direction.
   * @param {number} y - The amount to move in the y direction.
   * @param {number} z - The amount to move in the z direction.
   * @memberof Polygon
   */
  public move(x: number, y: number, z: number) {
    this.polygon.forEach((array) => {
      array.forEach((segment) => {
        segment.move(x, y, z);
      });
    });
  }

  /**
   * Adds a segment to the polygon.
   *
   * @param segments - The segment to add to the polygon.
   * @returns The updated polygon.
   * @memberof Polygon
   */
  public fromSegment(segments: Segment): Polygon {
    this.polygon[0].push(segments);
    return this;
  }

  /**
   * Adds holes to the polygon by pushing the given segments to the holes array.
   * @param segments - The segments to be added as holes.
   * @returns The updated polygon array.
   * @memberof Polygon
   */
  public addHoles(segments: Segment) {
    if (this.polygon.length == 1) this.newHoleTable();
    return this.polygon[this.polygon.length - 1].push(segments);
  }

  /**
   * Adds a new hole table to the polygon.
   * @memberof Polygon
   */
  public newHoleTable(): void {
    this.polygon.push(new Array<Segment>());
  }

  //----------CONVERT FUNCTION------------//

  /**
   * Converts the polygon to GeoJSON Polygon format.
   *
   * @return {GeoJsonPolygon} The GeoJSON representation of the polygon.
   * @memberof Polygon
   */
  public toGeojsonPolygon(): GeoJsonPolygon {
    const coordinates: number[][][] = [];

    this.getPointsFromPlygon().forEach((array) => {
      const points: number[][] = [];
      array.forEach((point) => {
        points.push([point.getPosition().x, point.getPosition().z]);
      });
    });

    // Convert inner rings (holes)
    for (let i = 1; i < this.polygon.length - 1; i++) {
      const innerRing: number[][] = [];
      const segment = this.polygon[1][i];
      const segmentPoints = segment.getPointFromSegment();

      for (let j = 0; j < segmentPoints.length; j++) {
        const point = segmentPoints[j];
        innerRing.push([point.getPosition().x, point.getPosition().z]);
      }

      coordinates.push(innerRing);
    }

    return {
      type: "Polygon",
      coordinates: coordinates,
    };
  }

  /**
   * Converts the polygon to GeoJSON coordinates format.
   * point : [longitude, altitude, latitude]
   */
  public toGeojsonCoordinates(): [number, number, number][][][] {
    const coordinates: [number, number, number][][][] = this.polygon.map((ring) => {
      return ring.map((segment) => {
        return segment.segment.map((point) => {
          return [point.x, point.y, point.z];
        });
    })});

    return coordinates;
  }

  //----------GETTERS------------//

  /**
   * Gets the ID of the polygon.
   *
   * @return {*}  {string} - The ID of the polygon.
   * @memberof Polygon
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Retrieves the points from the polygon.
   * @returns An array of arrays of points representing the polygon.
   * @memberof Polygon
   */
  public getPointsFromPlygon(): Point[][] {
    const segments = this.getSegmentFromPolygon();
    const points: Point[][] = [];
    const pointIds = new Set<string>(); // Use a set to store the IDs of the points

    segments.forEach((array) => {
      points.push(new Array<Point>());
      array.forEach((segment) => {
        const segmentPoints = segment.getPointFromSegment();
        segmentPoints.forEach((point) => {
          if (!pointIds.has(point.getId())) {
            // Check if the point is already in the set
            points[points.length - 1].push(point);
            pointIds.add(point.getId()); // Add the ID of the point to the set
          }
        });
      });
    });

    return points;
  }

  /**
   * Gets the segments that make up the polygon.
   *
   * @return {*}  {Segment[]} - The segments that make up the polygon.
   * @memberof Polygon
   */
  public getSegmentFromPolygon(): Segment[][] {
    return this.polygon;
  }

  /**
   * Checks if the polygon is visible.
   *
   * @return {*}  {boolean} - True if the polygon is visible, false otherwise.
   * @memberof Polygon
   */
  public getIsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Checks if the polygon is movable.
   *
   * @return {*}  {boolean} - True if the polygon is movable, false otherwise.
   * @memberof Polygon
   */
  public getIsMovable(): boolean {
    return this.isMovable;
  }

  //----------SETTERS------------//

  /**
   * Sets the ID of the polygon.
   *
   * @param {string} value - The new ID of the polygon.
   * @memberof Polygon
   */
  public setId(value: string) {
    this.id = value;
  }

  /**
   * Gets the polygon.
   *
   * @param {Segment[]} value - The value to set the polygon to.
   * @memberof Polygon
   */
  public setPolygon(value: Segment[][]) {
    this.polygon = value;
  }

  /**
   * Sets the visibility of the polygon.
   *
   * @memberof Polygon
   */
  public toggleIsVisible(): void {
    this.isVisible = !this.isVisible;
  }

  /**
   * Sets the movability of the polygon.
   *
   * @memberof Polygon
   */
  public toggleIsMovable(): void {
    this.isMovable = !this.isMovable;
  }
}

export default Polygon;
