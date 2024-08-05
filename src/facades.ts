import { Point } from "./main";

export function substract(a: Point, b: Point): Point {
  return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z};
}


export function normalVector(
  a: Point,
  b: Point,
  c: Point,
): Point {
  const ac = {x: c.x - a.x, y: c.y - a.y, z: c.z - a.z};
  const ab = {x: b.x - a.x, y: b.y - a.y, z: b.z - a.z};
  return {
    x: ab.y * ac.z - ab.z * ac.y,
    y: ab.z * ac.x - ab.x * ac.z,
    z: ab.x * ac.y - ab.y * ac.x,
  };
}

export function normalize(v: Point): Point {
  const length = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);

  if (length === 0) {
    return {x: 0, y: 0, z: 0};
  }

  return {x: v.x / length, y: v.y / length, z: v.z / length};
}

export function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Fonction pour aplatir un polygone 3D en 2D
export function flattenPolygon(
  polygon: Point[][],
  u: Point,
  v: Point,
  origin: Point,
): [number, number][][] {
  if (polygon.length === 0 || polygon[0].length < 3) {
    throw new Error(
      'Un polygone doit avoir un contour extérieur avec au moins 3 points.',
    );
  }

  return polygon.map((ring) =>
    ring.map((point) => {
      const d = substract(point, origin);
      return [dot(u, d), dot(v, d)];
    }),
  );
}
