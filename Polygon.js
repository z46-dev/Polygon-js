export default class Polygon {
    /**
     * Turns an array of array points into an array of object points
     * @param {Array[x:Number,y:Number]} list The list of points to convert
     * @returns {Array<{x:Number,y:Number}>} The converted list of points
     */
    static arrayToObject(list) {
        const output = [];
        for (let i = 0; i < list.length; i++) {
            output.push({
                x: list[i][0],
                y: list[i][1]
            });
        }

        return output;
    }

    /**
     * Checks if two polygons are colliding
     * @param {Polygon | {points:{x:Number,y:Number}}} polygon1 The first polygon to check for collision
     * @param {Polygon | {points:{x:Number,y:Number}}} polygon2 The second polygon to check for collision
     * @returns {Boolean} Whether or not the two polygons are colliding
     */
    static isColliding(polygon1, polygon2) {
        const points1 = polygon1.points;
        const points2 = polygon2.points;

        for (let i = 0; i < points1.length; i++) {
            const point1 = points1[i];
            const point2 = points1[i + 1] || points1[0];

            const normal = {
                x: point2.y - point1.y,
                y: point1.x - point2.x
            };

            let min1 = Infinity;
            let max1 = -Infinity;
            for (let j = 0; j < points1.length; j++) {
                const projected = normal.x * points1[j].x + normal.y * points1[j].y;
                if (projected < min1) {
                    min1 = projected;
                }
                if (projected > max1) {
                    max1 = projected;
                }
            }

            let min2 = Infinity;
            let max2 = -Infinity;
            for (let j = 0; j < points2.length; j++) {
                const projected = normal.x * points2[j].x + normal.y * points2[j].y;
                if (projected < min2) {
                    min2 = projected;
                }
                if (projected > max2) {
                    max2 = projected;
                }
            }

            if (max1 < min2 || max2 < min1) {
                return false;
            }
        }

        return true;
    }

    /**
     * Creates a new polygon
     * @param {Array{<x:Number,y:Number}} points A list of points that make up the polygon, should be scaled where (0, 0) is the center, (1, 1) is the bottom right, and so forth.
     * @param {Number} x The x position of the polygon
     * @param {Number} y The y position of the polygon
     * @param {Number} radius The radius of the polygon
     * @param {Number} rotation The rotation of the polygon (in radians)
     */
    constructor(points, x, y, radius, rotation = 0) {
        this._points = points;
        this.numPoints = points.length;
        this.xPoints = new Float64Array(points.length);
        this.yPoints = new Float64Array(points.length);

        this.update(x, y, radius, rotation);
    }

    /**
     * Update the polygon with a new position, size and rotation
     * @param {Number} x The x position of the polygon
     * @param {Number} y The y position of the polygon
     * @param {Number} radius The radius of the polygon
     * @param {Number} rotation The rotation of the polygon (in radians)
     * @returns {Polygon} The polygon
     */
    update(x, y, radius, rotation) {
        if (
            x === this.x &&
            y === this.y &&
            radius === this.radius &&
            rotation === this.rotation
        ) {
            return;
        }

        this.x = x;
        this.y = y;
        this.radius = radius;
        this.rotation = rotation;

        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        for (let i = 0; i < this.numPoints; i++) {
            const point = this._points[i];
            this.xPoints[i] = x + (point.x * cos - point.y * sin) * radius;
            this.yPoints[i] = y + (point.y * cos + point.x * sin) * radius;
        }

        return this;
    }

    /**
     * Gets the transformed points of the polygon
     * @returns {Array<{x:Number,y:Number}>} The transformed points of the polygon
     * @readonly
     */
    get points() {
        const output = [];
        for (let i = 0; i < this.numPoints; i++) {
            output.push({
                x: this.xPoints[i],
                y: this.yPoints[i]
            });
        }

        return output;
    }

    /**
     * Gets the width and height of the bounding box of the polygon, useful for AABB step 1 collision detection
     * @returns {{width:Number,height:Number}} The width and height of the bounding box
     */
    borderBox() {
        let width = 0,
            height = 0;

        for (let i = 0; i < this.numPoints; i++) {
            const x = Math.abs(this.xPoints[i] - this.x);
            const y = Math.abs(this.yPoints[i] - this.y);

            if (x > width) {
                width = x;
            }

            if (y > height) {
                height = y;
            }
        }

        return {
            width: width / this.radius,
            height: height / this.radius
        };
    }
}
