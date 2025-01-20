import { update_config } from "./main.js";
import { GamePhase } from "./renderer.js";
import { FAIL, WIN } from "./utils/audio.js";
import { PATH_COLOR, PATH_STROKE, PLAYER_COLOR, PLAYER_STROKE, STROKE_SIZE } from "./utils/theme.js";
import Vector from "./utils/vector.js";

export default class Player {
    position = new Vector(0, 0);
    velocity = new Vector(0, 0);
    inputs = {};
    
    speed = window.config.speed;
    friction = window.config.friction;
    radius = window.config.radius;

    past_positions = new Set();
    losing_position = new Vector(-1, -1);

    constructor(client) {
        this.client = client;

        window.addEventListener("keydown", event => {
            if (event.code == "Enter") {
                this.client.renderer.phase = GamePhase.GAME; 
                update_config(window.config, false);
            }

            if (this.client.renderer.phase == GamePhase.GAME) {
                switch (event.code) {
                    case "KeyW": case "ArrowUp": this.inputs["up"] = true; break;
                    case "KeyA": case "ArrowLeft": this.inputs["left"] = true; break;
                    case "KeyS": case "ArrowDown": this.inputs["down"] = true; break;
                    case "KeyD": case "ArrowRight": this.inputs["right"] = true; break;
                }
            }
        });

        window.addEventListener("keyup", event => {
            if (this.client.renderer.phase == GamePhase.GAME) {
                switch (event.code) {
                    case "KeyW": case "ArrowUp": this.inputs["up"] = false; break;
                    case "KeyA": case "ArrowLeft": this.inputs["left"] = false; break;
                    case "KeyS": case "ArrowDown": this.inputs["down"] = false; break;
                    case "KeyD": case "ArrowRight": this.inputs["right"] = false; break;
                }
            }
        });
    }

    tick() {
        if (this.losing_position.x >= 0) return;

        let acceleration = new Vector(0, 0);

        for (const [key, value] of Object.entries(this.inputs)) {
            switch (key) {
                case "up": 
                    if (value) acceleration.y -= 1.0; 
                    break;
                case "down": 
                    if (value) acceleration.y += 1.0; 
                    break;
                case "left": 
                    if (value) acceleration.x -= 1.0; 
                    break;
                case "right": 
                    if (value) acceleration.x += 1.0; 
                    break;
            }
        }

        this.velocity.add(acceleration.normalize().scale(this.speed));
        this.position.add(this.velocity.scale(1 - this.friction));

        this.position.constrain({ 
            x: 0,
            y: 0 
        }, { 
            x: window.innerWidth, 
            y: window.innerHeight
        });

        this.#check_loss();

        this.past_positions.add(new Vector(Math.floor(this.position.x), Math.floor(this.position.y)));
    }

    render(renderer) {
        renderer.context.save();
        renderer.context.strokeStyle = PATH_COLOR.css;
        renderer.context.lineWidth = 2;

        renderer.context.beginPath();
        this.past_positions.forEach((pos, i) => {
            if (i === 0) renderer.context.moveTo(pos.x, pos.y);
            else renderer.context.lineTo(pos.x, pos.y);
        });
        renderer.context.stroke();
        renderer.context.restore();

        if (this.losing_position.x >= 0) {
            renderer.context.save();
            renderer.context.fillStyle = PLAYER_COLOR.css;
            renderer.context.strokeStyle = PLAYER_STROKE.css;
            renderer.context.lineWidth = STROKE_SIZE;

            renderer.context.translate(
                this.losing_position.x == 0 ? this.client.maze.exit.x : this.losing_position.x, 
                this.losing_position.y == 0 ? this.client.maze.exit.y : this.losing_position.y
            );
            
            if (this.losing_position.x > 0) {
                renderer.context.beginPath();
                renderer.context.moveTo(-this.radius, -this.radius);
                renderer.context.quadraticCurveTo(
                    0, 0,
                    this.radius, this.radius
                );
                renderer.context.moveTo(this.radius, -this.radius);
                renderer.context.quadraticCurveTo(
                    0, 0,
                    -this.radius, this.radius
                );
                renderer.context.stroke();    
            } else {
                renderer.context.fillStyle = PATH_COLOR.css;
                renderer.context.strokeStyle = PATH_STROKE.css;

                renderer.context.beginPath();
                renderer.context.arc(0, 0, this.radius, 0, Math.PI * 2);
                renderer.context.stroke();
                renderer.context.fill();
            }
        
            renderer.context.restore();
        } else {
            renderer.context.save();
            renderer.context.fillStyle = PLAYER_COLOR.css;
            renderer.context.strokeStyle = PLAYER_STROKE.css;
            renderer.context.lineWidth = STROKE_SIZE;
    
            renderer.context.translate(this.position.x, this.position.y);
            renderer.context.beginPath();
            renderer.context.arc(0, 0, this.radius, 0, Math.PI * 2);
            renderer.context.fill();
            renderer.context.stroke();
            renderer.context.restore();
        }
    }

    #check_loss() {
        const maze = this.client.maze;
        const cell_size = maze.cell_size;
        const grid_size = maze.grid_size;
    
        const rendered_width = grid_size * cell_size;
        const rendered_height = grid_size * cell_size;
        const left_offset = (window.innerWidth - rendered_width) / 2;
        const top_offset = (window.innerHeight - rendered_height) / 2;
        
        if (
            this.position.x < left_offset - this.radius ||
            this.position.x > left_offset + rendered_width + this.radius ||
            this.position.y < top_offset - this.radius ||
            this.position.y > top_offset + rendered_height + this.radius
        ) {
            this.losing_position = this.position.clone;
            FAIL.play();
            return;
        }
    
        const grid_col = Math.floor((this.position.x - left_offset) / cell_size);
        const grid_row = Math.floor((this.position.y - top_offset) / cell_size);
    
        if (
            grid_row < 0 ||
            grid_row >= grid_size ||
            grid_col < 0 ||
            grid_col >= grid_size
        ) {
            this.losing_position = this.position.clone;

            if (this.past_positions.size > 10) {
                this.losing_position = new Vector(0, 0);
                WIN.play();
            } else {
                FAIL.play();
            }

            return;
        }
    
        const cell = maze.maze[grid_row][grid_col];
        const walls = cell.walls;
    
        const x_in_cell = this.position.x - (grid_col * cell_size + left_offset);
        const y_in_cell = this.position.y - (grid_row * cell_size + top_offset);
    
        const dist_top = y_in_cell;
        const dist_bottom = cell_size - y_in_cell;
        const dist_left = x_in_cell;
        const dist_right = cell_size - x_in_cell;
    
        if (
            (walls[0] && dist_top < this.radius) ||
            (walls[2] && dist_bottom < this.radius) ||
            (walls[3] && dist_left < this.radius) ||
            (walls[1] && dist_right < this.radius)
        ) {
            this.losing_position = this.position.clone;
            FAIL.play();
        }
    }
}