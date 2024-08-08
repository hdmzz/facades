import { v4 as uuidv4 } from "uuid";
import { Object3D } from "./Object3d";
import Point from "./Point";
/**
 * Represents a segment in 3D space.
 */
class Segment implements Object3D {
  public id: string;
  public isVisible: boolean;
  public isMovable: boolean;

  public segment: Point[];

  constructor() {
    this.id = uuidv4();
    this.isVisible = true;
    this.isMovable = true;
    this.segment = [];
  }

  /**
   * Moves the segment by the specified amount in the x, y, and z directions.
   * @param x - The amount to move in the x direction.
   * @param y - The amount to move in the y direction.
   * @param z - The amount to move in the z direction.
   */
  public move(x: number, y: number, z: number) {
    this.segment[0].move(x, y, z);
  }

  /**
   * Sets the segment based on the given start and end points.
   * @param startPoint - The start point of the segment.
   * @param endPoint - The end point of the segment.
   * @returns The updated segment.
   */
  public fromPoint(startPoint: Point, endPoint: Point) {
    return (this.segment = [startPoint, endPoint]);
  }

  public invertPoint(): Segment {
    const newSegment = new Segment();
    newSegment.setId(this.id);
    newSegment.fromPoint(this.segment[1], this.segment[0]);

    return newSegment;
  }

  //-----------GETTERS------------//

  /**
   * Gets the ID of the segment.
   * @returns The ID of the segment.
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Gets the visibility status of the segment.
   * @returns The visibility status of the segment.
   */
  public getIsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Gets the points that make up the segment.
   * @returns The points that make up the segment.
   */
  public getPointFromSegment(): Point[] {
    return this.segment;
  }

  /**
   * Gets the movability status of the segment.
   * @returns The movability status of the segment.
   */
  public getIsMovable(): boolean {
    return this.isMovable;
  }

  //-----------SETTERS------------//

  public setId(id: string): void {
    this.id = id;
  }

  /**
   * Toggles the visibility status of the segment.
   */
  public toggleIsVisible(): void {
    this.isVisible = !this.isVisible;
  }

  /**
   * Sets the segment to the given value.
   * @param value - The new value for the segment.
   */
  public setSegment(value: Point[]) {
    this.segment = value;
  }

  /**
   * Toggles the movability status of the segment.
   */
  public toggleIsMovable(): void {
    this.isMovable = !this.isMovable;
  }
}

export default Segment;
