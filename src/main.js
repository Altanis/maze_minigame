import Client from "./client.js";
import Maze from "./maze.js";
import Player from "./player.js";
import { START } from "./utils/audio.js";

const config = window.config = {
    size: 730,
    cell_size: 100,
    speed: 10,
    friction: 0.5,
    radius: 20  
};

window.client = new Client();
window.client.player.position = window.client.maze.entrance.clone;

const round_to_nearest_ten = num => Math.round(num / 10) * 10;

const _dat = window.dat.gui;
const gui = new _dat.GUI();

gui.add(config, 'size', 50, round_to_nearest_ten(window.innerHeight / 1.1)).step(10).name('Maze Size');
gui.add(config, 'cell_size', round_to_nearest_ten(config.size / 20), round_to_nearest_ten(config.size / 5)).step(10).name('Maze Cell Size');
gui.add(config, 'speed', 1, 100).name('Player Speed');
gui.add(config, 'friction', 0.0, 1.0).step(0.05).name('Surface Friction');
gui.add(config, 'radius', 1, 50).name('Player Radius');
gui.add({ restart1: () => update_config(config, false) }, 'restart1').name('Restart Game');
gui.add({ restart2: () => update_config(config, true) }, 'restart2').name('Reseed Maze');

export function update_config(config, random) {
    window.client.maze = new Maze(config.size, config.cell_size, random ? Math.ceil(Math.random() * 65536) : window.client.maze.seed);
    window.client.player = new Player(window.client);

    window.client.player.speed = config.speed;
    window.client.player.friction = config.friction;
    window.client.player.radius = config.radius;

    window.client.player.position = window.client.maze.entrance.clone;
    window.client.player.past_positions = new Set();
    window.client.renderer.time = performance.now();

    START.play();
}