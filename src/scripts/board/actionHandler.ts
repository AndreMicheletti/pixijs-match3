import { Point } from "pixi.js";
import { GameAction, BoardMatrix, GameCombination, Direction } from "../types";
import { BOARD_SIZE, copyBoard } from "./boardHandler";
import { getCombinationsInBoard } from "./combinationHandler";

/**
 * Transforms an action object to a hash, so it can be easily stored and compared
 */
export function getActionHash(action: GameAction): number {
  const { x, y } = action.point;
  const dirN = action.direction === Direction.Horizontal ? 0 : 1;
  const index = 8 * y + x;
  return index + dirN;
}

export function getActionTargetPoint(action: GameAction): Point {
  const { direction, point } = action;
  return direction === Direction.Horizontal ? new Point(point.x + 1, point.y) : new Point(point.x, point.y + 1);
}

export function createAction(point1: Point, point2: Point): GameAction {
  const topLeft = point1.x <= point2.x && point1.y <= point2.y ? point1 : point2;
  const dY = Math.abs(point1.y - point2.y);
  return {
    point: topLeft,
    direction: dY === 0 ? Direction.Horizontal : Direction.Vertical,
  };
}

export function applyActionOnBoard(board: BoardMatrix, action: GameAction): BoardMatrix {
  const { point } = action;
  const auxBoard = copyBoard(board);
  const targetPoint = getActionTargetPoint(action);
  const symbol = auxBoard[point.y][point.x];
  const targetSymbol = auxBoard[targetPoint.y][targetPoint.x];
  auxBoard[targetPoint.y][targetPoint.x] = symbol;
  auxBoard[point.y][point.x] = targetSymbol;
  return auxBoard;
}

function getSwapCombinations(board: BoardMatrix, action: GameAction): Array<GameCombination> {
  const { point } = action;
  const auxBoard = copyBoard(board);
  // Make swap
  const targetPoint = getActionTargetPoint(action);
  if (targetPoint.x > board.length - 1 || targetPoint.y > board.length - 1) return [];
  const initialSymbol = auxBoard[point.y][point.x];
  const targetSymbol = auxBoard[targetPoint.y][targetPoint.x];
  auxBoard[point.y][point.x] = targetSymbol;
  auxBoard[targetPoint.y][targetPoint.x] = initialSymbol;
  return getCombinationsInBoard(auxBoard);
}

export function getBoardValidActions(board: BoardMatrix): Array<GameAction> {
  const validActions: Array<GameAction> = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      // Try Horizontal Action
      const hAction: GameAction = { direction: Direction.Horizontal, point: new Point(x, y) };
      if (getSwapCombinations(board, hAction).length > 0) validActions.push(hAction);
      // Try Vertical Action
      const vAction: GameAction = { direction: Direction.Vertical, point: new Point(x, y) };
      if (getSwapCombinations(board, vAction).length > 0) validActions.push(vAction);
    }
  }
  return validActions;
}