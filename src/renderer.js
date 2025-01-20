import { BACKGROUND_COLOR } from "./utils/theme.js";
import { lerp } from "./utils/functions.js"

export class GamePhase {
    static INIT    = 0;
    static GAME    = 1;
    static FINISH  = 2;
}

export class Renderer {
    /** The canvas being rendered on. */
    canvas = document.getElementById("canvas");
    /** The HTMLCanvas2D rendering context. */
    context = this.canvas.getContext("2d");

    /** Timestamps for the last 30 frames. */
    frame_timestamps = [];
    /** The time the game started. */
    time = performance.now();
    /** The time the game ended. */
    time_end = performance.now();

    /** The opacity of the backdrop filter. */
    backdrop_opacity = 0.0;
    /** The phase of the game. */
    phase = GamePhase.INIT;

    constructor(client) {
        this.client = client;

        window.addEventListener("contextmenu", e => e.preventDefault());
        window.addEventListener("resize", this.#resize_canvas.bind(this));
        this.#resize_canvas();
    }

    #resize_canvas() {
        this.canvas.height = window.innerHeight * window.devicePixelRatio;
        this.canvas.width = window.innerWidth * window.devicePixelRatio;
    }

    tick() {
        const now = performance.now();

        this.frame_timestamps.push(now);
        if (this.frame_timestamps.length > 30) this.frame_timestamps.shift();
        const fps = this.#calculateFPS();

        this.#setup_context();
        this.#draw(fps);
    }

    #setup_context() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = BACKGROUND_COLOR.css;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    #draw(fps) {
        this.context.save();
        this.client.player.render(this);
        this.client.maze.render(this);
        this.context.restore();

        // Draw FPS counter in the corner of the canvas.
        this.#write_text(`${fps.toFixed(1)} FPS`, 85 / 2, 35 / 2, 16);

        if (this.client.player.losing_position.x < 0) this.time_end = performance.now();
        else if ((performance.now() - this.time_end) > 500) this.phase = GamePhase.FINISH;

        const elapsed = this.time_end - this.time;

        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        this.#write_text(`Time: ${time}`, 
            window.innerWidth - (15 + document.querySelector("body > div > div").getBoundingClientRect().width) / 2, 
            document.querySelector("body > div > div").getBoundingClientRect().height + 100,
            16
        );

        this.context.save();

        this.backdrop_opacity = lerp(this.backdrop_opacity, this.phase == GamePhase.GAME ? 0 : 1, 0.1);

        this.context.fillStyle = "black";
        this.context.globalAlpha = this.backdrop_opacity;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.phase == GamePhase.INIT) {
            this.context.translate(window.innerWidth / 2, window.innerHeight / 2);

            this.#write_text("Traverse the maze blindfolded while friends", 0, -200, 24);
            this.#write_text("can either direct you in directions or tell you to stop.", 0, -170, 24);
            this.#write_text("You lose if you hit a wall, you win if you escape the maze.", 0, -140, 24);

            this.#write_text("WASD/Arrow Keys to move.", 0, -100, 24);
            this.#write_text("Adjust the difficulty of the game by changing the game configuration.", 0, -70, 24);

            this.#write_text("Press [ENTER] to begin.", 0, 0, 36);
        } else if (this.phase == GamePhase.FINISH) {
            this.context.translate(window.innerWidth / 2, window.innerHeight / 2);

            this.#write_text("You", -40, -200, 36);
            this.#write_text(this.client.player.losing_position.x == 0 ? "win." : "lose.", 40, -200, 36, this.client.player.losing_position.x == 0 ? "#0f0" : "#f00");
            this.#write_text(`You played for ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`, 0, -170, 24);

            this.#write_text("Press [ENTER] to restart.", 0, 0, 36);
        }

        this.context.restore();
    }

    #calculateFPS() {
        if (this.frame_timestamps.length < 2) return 0;
        const totalTime = this.frame_timestamps[this.frame_timestamps.length - 1] - this.frame_timestamps[0];
        return (this.frame_timestamps.length - 1) / (totalTime / 1000);
    }

    #write_text(text, x, y, fill_size, fill = "#FFFFFF", stroke = true, text_align = "center") {
        this.context.save();
        this.context.translate(x, y);
    
        const font = "Ubuntu";
    
        this.context.miterLimit = 2;
        this.context.fillStyle = fill;
        this.context.font = `bold ${fill_size}px ${font}`;
        this.context.textAlign = text_align;
    
        if (stroke) {
            this.context.strokeStyle = "#000000";
            this.context.lineWidth = Math.ceil(fill_size / 5);
            this.context.strokeText(text, 0, 0);
        }
    
        this.context.fillText(text, 0, 0);
    
        const width = this.context.measureText(text);
        this.context.restore();
    
        return width;
    }    
}
