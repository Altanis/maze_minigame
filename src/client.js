import Maze from "./maze.js";
import Player from "./player.js";
import {Renderer} from "./renderer.js";

export default class Client {
    player = new Player(this);
    maze = new Maze(window.config.size, window.config.cell_size, Math.ceil(Math.random() * 65536));
    renderer = new Renderer(this);

    constructor() {
        requestAnimationFrame(this.tick.bind(this));
    }

    tick() {
        this.renderer.tick();
        this.player.tick();

        requestAnimationFrame(this.tick.bind(this));
    }
}