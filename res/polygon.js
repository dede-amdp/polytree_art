/* #@
@name: toHex
@brief: takes a number and converts it into an hex number string
@notes: given a number and a number of digits, the method returns a string that represents the number in hexadecimal with the specified amount of digits.
The string returned starts with a `#` symbol because this method was mainly used for colors
@inputs: 
- number hex_number: number to convert;
- ind digits: number of desired digits for the number: its default value is 8;
@outputs: 
- string: hexadecimal number.
@# */
function toHex(hex_number, digits = 8) {
    return "#" + ('0'.repeat(digits) + hex_number.toString(16)).slice(-digits);
}

/* #@
@name: class Point
@brief: models a point
@notes: using cartesian coordinates, this class models a point in space
@inputs: 
- number x: x coordinate;
- number y: y coordinate.
@# */
class Point {
    x = 0;
    y = 0;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /* #@
    @name: Point::distanceFrom
    @brief: computes the distance between two points
    @notes: given a point, it returns the **squared** distance between this (Point) and other (Point)
    @inputs: 
    - Point other: other point used to compute the distance;
    @outputs: 
    - number: squared distance.
    @# */
    distanceFrom(other) {
        return (other.x - this.x) * (other.x - this.x) + (other.y - this.y) * (other.y - this.y);
    }

    /* #@
    @name: Point::draw
    @brief: draws a point
    @notes: draws the point as a circle of radius 5: this method was meant for debug purposes;
    @inputs: 
    - number color: number that represents the color of the point;
    @outputs: 
    - null.
    @# */
    draw(color) {
        fill(color);
        stroke(color);
        circle(this.x, this.y, 5);
    }
}

/* #@
@name: class Polygon
@brief: used to model an n sided polygon
@notes: this class can be used to model any kind of polygon, it only needs the vertices (sorted by adjacency). Beware that a polygon **requires** at least 3 vertices.
@inputs: 
- list<Points> vertices: used to define the polygon itself;
- number fillColor: fill color of the shape;
- number strokeColor: stroke color of the shape;
@# */
class Polygon {
    vertices = [];
    fillColor = 0x00000000;
    strokeColor = 0x00000000;
    constructor(vertices, fillColor = 0x000000FF, strokeColor = 0xFFFFFFFF) {
        if (vertices.length <= 2) throw Error("Polygons must have at least 3 vertices");
        this.vertices = vertices;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.edges = this.findEdges();
    }

    /* #@
    @name: Polygon::findEdges
    @brief: finds the edges of the polygon
    @notes: using the vertices list, this method pairs a vertex with its successor to define the edges of the polygon.
    @inputs: 
    - null;
    @outputs: 
    - list<list<Points>>: list of pairs of edges.
    @# */
    findEdges() {
        let i = -1;
        let edges = [];
        while (i++ < this.vertices.length - 1) {
            edges.push([this.vertices[i], this.vertices[(i + 1) % this.vertices.length]])
        }
        return edges;
    }

    /* #@
    @name: Polygon::draw
    @notes: draws the polygon
    @inputs: 
    - optional integer weight: weight of the stroke of the polygon shape;
    @outputs: 
    - null.
    @# */
    draw(weight = 2) {
        fill(toHex(this.fillColor));
        beginShape();
        for (let edge of this.edges) {
            stroke(toHex(this.strokeColor));
            strokeWeight(weight);
            line(edge[0].x, edge[0].y, edge[1].x, edge[1].y);
            stroke("#00000000");
            vertex(edge[0].x, edge[0].y);
        }
        endShape(CLOSE);
    }

    /* #@
    @name: Polygon::contains
    @brief: returns whether the polygon contains a point
    @notes: by casting a line from the point and counting the number of edges intersected, it is possible to understand if a point is inside a polygon.
    If the number of intersection is odd, in fact, it is quite obvious that the point is inside a polygon
    ![polygon](./polygon_intersects.png)
    @inputs: 
    - Point point: point used for the check;
    @outputs: 
    - bool: whether the point is inside the polygon or not.
    @# */
    contains(point) {
        // get only the non null intersections
        // get only the intersections on the right of the point
        return this.intersects(point, 0).filter((v) => v).filter((v) => v.x >= point.x).length % 2 != 0;
    }

    /* #@
    @name: Polygon::edgeContains
    @notes: checks if a point is contained in an edge
    @inputs: 
    - list<point> edge: edge to check;
    - Point point: point to check;
    @outputs: 
    - bool: whether the point is contained in the edge or not.
    @# */
    edgeContains(edge, point) {
        // (y-y0)/(y1-y0) = (x-x0)/(x1-x0)
        if (edge[1].y == edge[0].y) {
            // horizontal edge
            let x0 = min(edge[0].x, edge[1].x);
            let x1 = max(edge[0].x, edge[1].x);
            return point.x >= x0 && point.x < x1;
        }
        if (edge[1].x == edge[0].x) {
            // vertical edge
            let y0 = min(edge[0].y, edge[1].y);
            let y1 = max(edge[0].y, edge[1].y);
            return point.y >= y0 && point.y < y1;
        }
        // y = (x-x0)*(y1-y0)/(x1-x0) + y0
        if (point.y == (point.x - edge[0].x) * (edge[1].y - edge[0].y) / (edge[1].x - edge[0].x) + edge[0].y) {
            // the point is on the line defined by the two vertices
            // check if it is in the edge or outside (could check x OR y, it's the same)
            let x0 = min(edge[0].x, edge[1].x);
            let x1 = max(edge[0].x, edge[1].x);
            return point.x >= x0 && point.x < x1;
        }
        return false;
    }

    /*
    line from point and angle
    y-y0 = m(x-x0)
    m = tg(angle)
    =>
    y = mx + (y0-mx0)
    y = mx+q
    ---
    line from  2 points
    (y-y0)/(y1-y0)=(x-x0)/(x1-x0)
    y = (x-x0)*(y1-y0)/(x1-x0)+y0
    k = (y1-y0)/(x1-x0)
    =>
    y = kx+(y0-kx0)
    y = kx+c
    ---
    matrix form
    [-m 1; -k 1] * [x; y] = [q; c] -> M*p = Q
    if det(M) == 0 -> parallel
    if det(M) != 0 -> p = M^-1*Q
     */
    /* #@
    @name: Polygon::intersects
    @brief: checks if a line intersects the edges of the polygon
    @notes: given a point and an angle, the method checks if and where this lines intersects the edges of the polygon
    @inputs: 
    - Point point: point within which the line passes;
    - number angle: angle of the line (radians);
    @outputs: 
    - list<Point>: list of intersections **sorted by edges**: if an edge is not intersected "null" will be placed instead of a Point;

    For Example:
    [null, Point, null, Point] means that the line intersected the 2nd and 4th edge of the polygon.
    @# */
    intersects(point, angle) {
        let intersections = [];
        let m = Math.tan(angle); // what if angle == Math.PI/2 ? -> Math.tan(angle) still returns a number, so there shouldn't be any problems
        let q = point.y - m * point.x;
        for (const edge of this.edges) {
            let x = 0;
            let y = 0;
            if (edge[0].x == edge[1].x) {
                // vertical edge
                if (m == Infinity) {
                    // both lines are vertical
                    intersections.push(null);  // no intersection
                    continue;
                }
                x = edge[0].x;
                y = m * x + q;
            }
            else if (edge[0].y == edge[1].y) {
                // horizontal edge
                if (m == 0) {
                    // both lines are horizontal
                    intersections.push(null);  // no intersection
                    continue;
                }
                y = edge[0].y;
                x = (y - q) / m;
            } else {
                let k = (edge[1].y - edge[0].y) / (edge[1].x - edge[0].x);
                let c = edge[0].y - k * edge[0].x;
                if (k == m) {
                    // edge and line are parallel
                    intersections.push(null); // no intersection
                    continue;
                }
                /* M -> M^-1 =
                [-m 1 -> 1/det *[1 -1
                -k 1]          k -m]
                */
                // x = (q-c)/det
                // y = (kq-mc)/det
                let det = (k - m);
                x = (q - c) / det;
                y = (k * q - m * c) / det;
            }
            let crossingPoint = new Point(x, y);
            let edgeLength = edge[0].distanceFrom(edge[1]);
            // the points of the intersection might not be on the edge of the polygon
            if (crossingPoint.distanceFrom(edge[0]) <= edgeLength && crossingPoint.distanceFrom(edge[1]) < edgeLength) {
                // the crossing point is on the edge
                intersections.push(crossingPoint);
            } else {
                // the crossing point is not on the edge
                intersections.push(null);
            }
        }
        return intersections;
    }

    /* #@
    @name: Polygon::split
    @brief: splits the polygon in two along a line
    @notes: given a point and an angle that represent a line, the polygon will be split in two by the line if it intersects it.
    If by any chance the line is parallel to an edge and the point coincides with a vertex, the division is not possible
    @inputs: 
    - Point point: point within which the line passes;
    - number angle: angle of the line (radians);
    @outputs: 
    - list<Polygons>: the resulting polygons.
    @# */
    split(point, angle) {
        let intersections = this.intersects(point, angle);
        let cutEdges = [];
        for (let i = 0; i < intersections.length; i++) {
            if (intersections[i]) cutEdges.push(i);
        }
        if (cutEdges.length <= 1) {
            // cutting line parallel to edge
            return [null, null];
        }
        let polygon1 = [];
        let polygon2 = [];
        let pol1 = true;
        let k = 0;
        for (let i = 0; i < this.edges.length; i++) {
            if (pol1) polygon1.push(this.edges[i][0]);
            else polygon2.push(this.edges[i][0]);
            if (i == cutEdges[k]) {
                // the vertex is cut
                polygon1.push(intersections[cutEdges[k]])
                polygon2.push(intersections[cutEdges[k]])
                pol1 = !pol1;
                k++;
            }
        }
        return [polygon1, polygon2];
    }
}