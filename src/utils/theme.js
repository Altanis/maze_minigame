import Color from "./color.js";

export const STROKE_INTENSITY = 0.25;
export const STROKE_SIZE = 2.5;

export const BACKGROUND_COLOR = Color.from_hex("#232424");

export const PATH_COLOR = Color.from_hex("#00ff00");
export const PLAYER_COLOR = Color.from_hex("#eb4034");
export const MAZE_COLOR = Color.from_hex("#94c8d4");

export const PATH_STROKE = Color.blend_colors(PATH_COLOR, Color.BLACK, STROKE_INTENSITY);
export const PLAYER_STROKE = Color.blend_colors(PLAYER_COLOR, Color.BLACK, STROKE_INTENSITY);
export const MAZE_STROKE = Color.blend_colors(MAZE_COLOR, Color.BLACK, STROKE_INTENSITY);