type ThreePoint = [number, number, number];

export function subtract(a: ThreePoint, b: ThreePoint): ThreePoint {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}


export function normalize(v: ThreePoint): ThreePoint {
  const length = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);

  if (length === 0) {
    return [0, 0, 0];
  }

  return [v[0] / length, v[1] / length, v[2] / length];
}


export function dotProduct(v1: ThreePoint, v2: ThreePoint): number {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}


export function flattenPolygon(
  polygon: ThreePoint[][],
  u: ThreePoint,
  v: ThreePoint,
  origin: ThreePoint,
): [number, number][][] {
  console.log("Polygon[0] len", polygon[0]);
  if (polygon.length === 0 || polygon[0].length < 3) {
    throw new Error(
      'Un polygone doit avoir un contour extérieur avec au moins 3 points.',
    );
  }

  // Projeter les points sur le plan 2D (u, v)
  return polygon.map((ring) =>
    ring.map((point) => {
      const d = subtract(point, origin);
      return [dotProduct(u, d), dotProduct(v, d)];
    }),
  );
}
