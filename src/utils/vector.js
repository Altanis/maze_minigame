export default class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static to_cartesian(r, theta) {
        return new Vector(r * Math.cos(theta), r * Math.sin(theta));
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    add_not_eq(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    subtract_not_eq(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    normalize() {
        const magnitude = this.magnitude;
        if (magnitude === 0) this.x = this.y = 0;
        else {
            this.x /= magnitude;
            this.y /= magnitude;
        }
        return this;
    }

    distance(vector) {
        return this.clone.subtract(vector).magnitude;
    }

    direction(vector) {
        return this.clone.subtract(vector).normalize();
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    project(vector) {
        if (vector.x === 0 && vector.y === 0) return new Vector(0, 0);
        return vector.clone.scale(this.dot(vector) / vector.magnitude_sq);
    }

    get orthogonal() {
        return new Vector(-this.y, this.x);
    }

    angle(reference = { x: 0, y: 0 }) {
        return Math.atan2(this.y - reference.y, this.x - reference.x);
    }

    rotate(angle) {
        const magnitude = this.magnitude;
        this.x = magnitude * Math.cos(angle);
        this.y = magnitude * Math.sin(angle);
        return this;
    }

    constrain(min, max) {
        this.x = Math.max(min.x, Math.min(this.x, max.x));
        this.y = Math.max(min.y, Math.min(this.y, max.y));
        return this;
    }

    fuzzy_equals(other, threshold) {
        return (
            Math.abs(this.x - other.x) <= threshold &&
            Math.abs(this.y - other.y) <= threshold
        );
    }

    get magnitude() {
        return Math.sqrt(this.magnitude_sq);
    }

    set magnitude(magnitude) {
        const angle = this.angle();
        this.x = magnitude * Math.cos(angle);
        this.y = magnitude * Math.sin(angle);
    }

    get magnitude_sq() {
        return this.x * this.x + this.y * this.y;
    }

    get clone() {
        return new Vector(this.x, this.y);
    }
}