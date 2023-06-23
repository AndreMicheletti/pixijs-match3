import { Point } from "pixi.js";

export enum SymbolID {
  Empty = -1,
  Zombie = 0,
  Brain = 1,
  Skull = 2,
  Goblin = 3,
  Eyes = 4,
}

export enum Direction {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

export type BoardMatrix = Array<Array<SymbolID>>;

export type GameCombination = {
  points: Array<Point>;
  direction: Direction;
  height: number;
};

/**
 * Actions are always represented by top-leftmost point going right or down.
 */
export type GameAction = {
  point: Point;
  direction: Direction;
}
