import proj4 from "proj4";
import { v4 as uuidv4 } from "uuid";
import CenterState from "./Constant";
import { Object3D } from "./Object3d";
proj4.defs("EPSG:32631", "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs");

/**
 * Represents a point in 3D space.
 */
class Point implements Object3D {
  public id: string;
  public idVisible: boolean;
  public isMovable: boolean;
  public x: number;
  public y: number;
  public z: number;

  constructor() {
    this.id = uuidv4();
    this.idVisible = true;
    this.isMovable = true;
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

  /**
   * Converts geodesic coordinates (latitude, longitude, altitude) to projected coordinates (x, y, z) and moves the point to the new location.
   * @param lon The longitude in decimal degrees.
   * @param lat The latitude in decimal degrees.
   * @param altitude The altitude in meters.
   * @memberof Point
   */
  public fromGeodesic(lon: number, lat: number, altitude: number): void {
    const wgs84 = "EPSG:4326";
    const utm31n = "EPSG:32631";

    const projected = proj4(wgs84, utm31n, [lon, lat]); //DON'T MODIFY THIS LINE
    const x = projected[0] - CenterState.getGlobalOrigin()[0];
    const z = projected[1] - CenterState.getGlobalOrigin()[1];
    const y = altitude;

    this.move(-x, y, z);
  }

  /**
   * Converts the point to geodesic coordinates.
   * @returns An object containing the latitude, longitude, and altitude of the point.
   * @memberof Point
   */
  public toGeodesic(): { longitude: number; latitude: number; altitude: number } {
    const wgs84 = "EPSG:4326";
    const utm31n = "EPSG:32631";

    const x = this.x + CenterState.getGlobalOrigin()[0];
    const z = this.z + CenterState.getGlobalOrigin()[1];
    const projected = proj4(utm31n, wgs84, [x, z]);
    const lon = projected[0];
    const lat = projected[1];
    const alt = this.y;

    return { longitude: lon, latitude: lat, altitude: alt };
  }

  /**
   * Moves the point to the specified coordinates.
   * @param x - The new x-coordinate of the point.
   * @param y - The new y-coordinate of the point.
   * @param z - The new z-coordinate of the point.
   * @memberof Point
   */
  public move(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  //-----------GETTERS------------//

  public getId(): string {
    return this.id;
  }

  public getIsVisible(): boolean {
    return this.idVisible;
  }

  public getIsMovable(): boolean {
    return this.isMovable;
  }

  public getPosition(): { x: number; y: number; z: number } {
    return { x: this.x, y: this.y, z: this.z };
  }

  //-----------SETTERS------------//

  public toggleIsVisible(): void {
    this.idVisible = !this.idVisible;
  }

  public toggleIsMovable(): void {
    this.isMovable = !this.isMovable;
  }
}

export default Point;
