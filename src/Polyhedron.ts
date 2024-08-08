import { v4 as uuidv4 } from "uuid";
import type { Object3D } from "./Object3d";
import Point from "./Point";
import Segment from "./Segment";
import Polygon from "./Polygon";

/**
 * Represents a polyhedron in 3D space.
 */
class Polyhedron implements Object3D {
  public id: string;
  public isVisible: boolean;
  public isMovable: boolean;
  public height: number;

  public polyhedron: Polygon[];

  constructor() {
    this.id = uuidv4();
    this.isVisible = true;
    this.isMovable = true;
    this.polyhedron = [];
    this.height = 10; // default height is 10
  }

  /**
   * Moves the polyhedron by the specified amount in the x, y, and z directions.
   *
   * @param {number} x - The amount to move in the x direction.
   * @param {number} y - The amount to move in the y direction.
   * @param {number} z - The amount to move in the z direction.
   * @memberof Polyhedron
   */
  public move(x: number, y: number, z: number) {
    this.polyhedron.forEach((polygon) => {
      polygon.move(x, y, z);
    });
  }

  /**
   * Creates a polyhedron from the given polygon.
   * The polyhedron consists of the ground polygon, the roof polygon, and the walls.
   * The polyhedron is added to the polyhedron array.
   *
   * @param {Polygon} polygonGround - The polygon to create the polyhedron from.
   * @return {*}  {Polygon[]} - The polyhedron created from the given polygon.
   * @memberof Polyhedron
   */
  public fromPolygon(polygonGround: Polygon): Polygon[] {
    this.polyhedron.push(polygonGround);

    const polygonRoof = this.extrude(polygonGround);
    this.polyhedron.push(polygonRoof);

    const polygroundSegment = polygonGround.getSegmentFromPolygon();
    polygroundSegment.forEach((arraySegment, index) => {
      const polyroofSegment = polygonRoof.getSegmentFromPolygon()[index];
      for (let i = 0; i < arraySegment.length; i++) {
        polygonGround.setId(polygonGround.getId() + "_ground");
        this.polyhedron.push(this.addWall(arraySegment, polyroofSegment, i));
      }
    });
    return this.polyhedron;
  }

  /**
   * Extrudes the given polygon to create a roof.
   * The roof is created by moving the points of the polygon up by the height of the polyhedron.
   * The roof is returned.
   * The height of the polyhedron is set to 1 by default.
   *
   * @param {Polygon} polygon - The polygon to extrude.
   * @return {*}  {Polygon} - The roof created from the given polygon.
   * @memberof Polyhedron
   */
  public extrude(polygon: Polygon): Polygon {
    const polygonRoof = new Polygon();
    const newPoints: Point[][] = [];

    const polygonPoints = polygon.getPointsFromPlygon();
    polygonPoints.forEach((arrayPoint) => {
      const tempoPoints: Point[] = [];
      arrayPoint.forEach((point) => {
        const newPoint = new Point();
        const position = point.getPosition();
        newPoint.move(position.x, position.y + this.height, position.z);
        tempoPoints.push(newPoint);
      });
      newPoints.push(tempoPoints);
    });

    newPoints.forEach((arrayPoint, index) => {
      for (let i = 0; i < arrayPoint.length; i++) {
        const segment = new Segment();
        if (i === arrayPoint.length - 1) {
          segment.fromPoint(arrayPoint[i], arrayPoint[0]);
        } else {
          segment.fromPoint(arrayPoint[i], arrayPoint[i + 1]);
        }
        if (index === 0) {
          polygonRoof.fromSegment(segment);
        } else {
          polygonRoof.addHoles(segment);
        }
      }
      if (index < newPoints.length - 1) {
        polygonRoof.newHoleTable();
      }
    });
    polygonRoof.setId(polygonRoof.getId() + "_roof");
    return polygonRoof;
  }

  /**
   * Adds a wall to the polyhedron.
   * The wall is created by connecting the corresponding points of the ground and roof polygons.
   * The wall is added to the polyhedron.
   *
   * @param {Segment[]} polygonGround - The ground polygon.
   * @param {Segment[]} polygonRoof - The roof polygon.
   * @param {number} [i=0] - The index of the segment.
   * @return {*}  {Polygon} - The wall added to the polyhedron.
   * @memberof Polyhedron
   */
  public addWall(polygonGround: Segment[], polygonRoof: Segment[], i: number = 0): Polygon {
    if (i >= polygonGround.length || i >= polygonRoof.length) {
      throw new Error("Index out of bounds");
    }

    const polygonWall = new Polygon();
    polygonWall.setId(polygonWall.getId() + "_wall");

    const pointsGround = polygonGround[i].getPointFromSegment();
    const pointsRoof = polygonRoof[i].getPointFromSegment();

    if (pointsGround.length !== 2 || pointsRoof.length !== 2) {
      throw new Error("Segments must have exactly 2 points each");
    }

    // Create and add a segment for all face of the wall
    const createAndAddSegment = (point1: Point, point2: Point) => {
      const segment = new Segment();
      segment.fromPoint(point1, point2);
      polygonWall.fromSegment(segment);
    };

    // Segment between low point and high point
    // Horizontal segment at ground and roof level
    createAndAddSegment(pointsGround[0], pointsRoof[0]);
    polygonWall.fromSegment(polygonRoof[i]);
    createAndAddSegment(pointsGround[1], pointsRoof[1]);
    -polygonWall.fromSegment(polygonGround[i]);

    return polygonWall;
  }

  /**
   * Gets the ID of the polyhedron.
   *
   * @return {*}  {string} - The ID of the polyhedron.
   * @memberof Polyhedron
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Checks if the polyhedron is visible.
   *
   * @return {*}  {boolean} - True if the polyhedron is visible, false otherwise.
   * @memberof Polyhedron
   */
  public getIsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Sets the visibility of the polyhedron.
   *
   * @memberof Polyhedron
   */
  public toggleIsVisible(): void {
    this.isVisible = !this.isVisible;
  }

  /**
   * Checks if the polyhedron is movable.
   *
   * @param {Polygon[]} value - The value to set the polyhedron to.
   * @memberof Polyhedron
   */
  public setPolyhedron(value: Polygon[]) {
    this.polyhedron = value;
  }

  /**
   * Gets the polyhedron.
   *
   * @return {*}  {boolean} - The polyhedron.
   * @memberof Polyhedron
   */
  public getIsMovable(): boolean {
    return this.isMovable;
  }

  /**
   *  Sets the movability of the polyhedron.
   *
   * @memberof Polyhedron
   */
  public toggleIsMovable(): void {
    this.isMovable = !this.isMovable;
  }

  /**
   * Get the polyhedron to the given value.
   *
   * @return {*}  {Polygon[]} - The value to set the polyhedron to.
   * @memberof Polyhedron
   */
  public getPolygonFromPolyhedron(): Polygon[] {
    return this.polyhedron;
  }

  /**
   * Sets the height of the polyhedron.
   *
   * @param {number} value - The value to set the height to.
   * @memberof Polyhedron
   */
  public setHeight(value: number) {
    this.height = value;
  }

  /**
   * Gets the height of the polyhedron.
   *
   * @return {*}  {number} - The height of the polyhedron.
   * @memberof Polyhedron
   */
  public getHeight(): number {
    return this.height;
  }
}

export default Polyhedron;
