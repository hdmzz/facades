import Polyhedron from "./Polyhedron";
import Polygon from "./Polygon";
import Segment from "./Segment";
import Point from "./Point";

export async function constructBat() {
    const url = "/Bat.json";
    const response = fetch(url);
    const data: Polyhedron = await (await response).json();
console.log(data);

const polyhedron = new Polyhedron();
polyhedron.height = data.height;
polyhedron.id = data.id;
polyhedron.isMovable = data.isMovable;
polyhedron.isVisible = data.isVisible;
polyhedron.polyhedron = data.polyhedron.map((polygon) => {
    const newPolygon = new Polygon();
    newPolygon.id = polygon.id;
    newPolygon.isVisible = polygon.isVisible;
    newPolygon.isMovable = polygon.isMovable;
    newPolygon.polygon = polygon.polygon.map((ring) => ring.map((segment) => {
        const newSegment = new Segment();
        newSegment.id = segment.id;
        newSegment.isVisible = segment.isVisible;
        newSegment.isMovable = segment.isMovable;
        newSegment.segment = segment.segment.map((point) => {
            const newPoint = new Point();
            newPoint.id = point.id;
            newPoint.idVisible = point.idVisible;
            newPoint.isMovable = point.isMovable;
            newPoint.x = point.x;
            newPoint.y = point.y;
            newPoint.z = point.z;
            return newPoint;
        });
        return newSegment;
    }));
    return newPolygon;
})

return polyhedron;
}
