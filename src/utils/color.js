export default class Color {
    static BLACK = Color.from_rgb(0, 0, 0);
    static WHITE = Color.from_rgb(255, 255, 255);

    static from_rgb(r, g, b) {
        return new Color((r << 16) | (g << 8) | (b << 0));
    }

    static from_hex(hex) {
        if (hex.startsWith('#')) hex = hex.substr(1);
        return new Color(parseInt(hex, 16));
    }

    static blend_colors(primary, secondary, factor) {
        const c = new Color(primary.int);
        c.blend_with(factor, secondary);
        return c;
    }

    get int() {
        return (this.r << 16) | (this.g << 8) | (this.b << 0);
    }

    get css() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    constructor(color) {
        this._r = (color >>> 16) & 255;
        this._g = (color >>> 8) & 255;
        this._b = (color >>> 0) & 255;
    }

    get r() { return this._r; }
    set r(v) { this._r = v & 255; }

    get g() { return this._g; }
    set g(v) { this._g = v & 255; }

    get b() { return this._b; }
    set b(v) { this._b = v & 255; }

    blend_with(factor, color) {
        this.r = Math.round(color.r * factor + this.r * (1 - factor));
        this.g = Math.round(color.g * factor + this.g * (1 - factor));
        this.b = Math.round(color.b * factor + this.b * (1 - factor));
        return this;
    }

    grayscale() {
        const avg = (this.r + this.g + this.b) / 3;
        this.r = avg;
        this.g = avg;
        this.b = avg;
        return this;
    }

    invert() {
        this.r = 255 - this.r;
        this.g = 255 - this.g;
        this.b = 255 - this.b;
        return this;
    }

    clone() {
        return new Color(this.int);
    }
}
