import { MAZE_COLOR } from "./utils/theme.js";
import Vector from "./utils/vector.js";

export default class Maze {
    constructor(size, cell_size, seed = 0) {
        this.size = size;
        this.cell_size = cell_size;
        this.grid_size = Math.floor(size / cell_size);
        this.seed = seed;
        this.maze = this._generate_maze();
        this._create_openings();
    }

    _seeded_random(seed) {
        return function () {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    _initialize_grid() {
        const grid = [];
        for (let row = 0; row < this.grid_size; row++) {
            const grid_row = [];
            for (let col = 0; col < this.grid_size; col++) {
                grid_row.push({ visited: false, walls: [true, true, true, true] });
            }
            grid.push(grid_row);
        }
        return grid;
    }

    _generate_maze() {
        const grid = this._initialize_grid();
        const random = this._seeded_random(this.seed);

        const stack = [];
        const start = { row: 0, col: 0 };
        grid[start.row][start.col].visited = true;
        stack.push(start);

        const directions = [
            { row: -1, col: 0, wall: [0, 2] }, // Up: remove Top wall of current, Bottom wall of neighbor
            { row: 0, col: 1, wall: [1, 3] }, // Right: remove Right wall of current, Left wall of neighbor
            { row: 1, col: 0, wall: [2, 0] }, // Down: remove Bottom wall of current, Top wall of neighbor
            { row: 0, col: -1, wall: [3, 1] } // Left: remove Left wall of current, Right wall of neighbor
        ];

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const { row, col } = current;
            
            const unvisited_neighbors = directions
                .map(({ row: dr, col: dc, wall }) => {
                    const nr = row + dr;
                    const nc = col + dc;
                    if (nr >= 0 && nr < this.grid_size && nc >= 0 && nc < this.grid_size && !grid[nr][nc].visited) {
                        return { row: nr, col: nc, wall };
                    }
                    return null;
                })
                .filter((neighbor) => neighbor !== null);

            /** Ensure only one neighbor is visited to create one solution. */
            if (unvisited_neighbors.length === 1) {
                const next = unvisited_neighbors[0];
                
                /** Remove walls between current and next cell. */
                grid[row][col].walls[next.wall[0]] = false;
                grid[next.row][next.col].walls[next.wall[1]] = false;

                grid[next.row][next.col].visited = true;
                stack.push({ row: next.row, col: next.col });
            } else if (unvisited_neighbors.length > 0) {
                const next = unvisited_neighbors[Math.floor(random() * unvisited_neighbors.length)];

                /** Remove walls between current and next cell. */
                grid[row][col].walls[next.wall[0]] = false;
                grid[next.row][next.col].walls[next.wall[1]] = false;

                grid[next.row][next.col].visited = true;
                stack.push({ row: next.row, col: next.col });
            } else {
                stack.pop();
            }
        }

        return grid;
    }

    _create_openings() {
        const random = this._seeded_random(this.seed);
        const entrance_row = 0;
        const entrance_col = Math.floor(random() * this.grid_size);
        const exit_row = this.grid_size - 1;
        const exit_col = Math.floor(random() * this.grid_size);
    
        this.maze[entrance_row][entrance_col].walls[0] = false; 
        this.maze[exit_row][exit_col].walls[2] = false;        
    
        const entrance_x = (entrance_col * this.cell_size + (entrance_col + 1) * this.cell_size) / 2;
        const entrance_y = entrance_row * this.cell_size;
    
        const exit_x = (exit_col * this.cell_size + (exit_col + 1) * this.cell_size) / 2;
        const exit_y = (exit_row + 1) * this.cell_size;
    
        const rendered_width = this.grid_size * this.cell_size;
        const rendered_height = this.grid_size * this.cell_size;
        const dx = (window.innerWidth - rendered_width) / 2;
        const dy = (window.innerHeight - rendered_height) / 2;
    
        const entrance_canvas_x = entrance_x + dx;
        const entrance_canvas_y = entrance_y + dy;
    
        const exit_canvas_x = exit_x + dx;
        const exit_canvas_y = exit_y + dy;
    
        this.entrance = new Vector(entrance_canvas_x, entrance_canvas_y);
        this.exit = new Vector(exit_canvas_x, exit_canvas_y);
    }

    get_maze() {
        return this.maze;
    }

    render(renderer) {
        let context = renderer.context;

        context.save();

        const rendered_width = this.grid_size * this.cell_size;
        const rendered_height = this.grid_size * this.cell_size;
        context.translate((window.innerWidth - rendered_width) / 2, (window.innerHeight - rendered_height) / 2);

        context.strokeStyle = MAZE_COLOR.css;
        context.lineWidth = 2;

        for (let row = 0; row < this.grid_size; row++) {
            for (let col = 0; col < this.grid_size; col++) {
                const x = col * this.cell_size;
                const y = row * this.cell_size;
                const cell = this.maze[row][col];

                if (cell.walls[0]) {
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x + this.cell_size, y);
                    context.stroke();
                }

                if (cell.walls[1]) {
                    context.beginPath();
                    context.moveTo(x + this.cell_size, y);
                    context.lineTo(x + this.cell_size, y + this.cell_size);
                    context.stroke();
                }

                if (cell.walls[2]) {
                    context.beginPath();
                    context.moveTo(x, y + this.cell_size);
                    context.lineTo(x + this.cell_size, y + this.cell_size);
                    context.stroke();
                }

                if (cell.walls[3]) {
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x, y + this.cell_size);
                    context.stroke();
                }
            }
        }

        context.restore();
    }
}