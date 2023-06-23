import { Point } from "pixi.js";
import { BoardMatrix, SymbolID } from "../Types";
import { getCombinationsInBoard } from "./combinationHandler";
import { rangeArray } from "../utils";

const InitialBoard = [
  [1, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 1, 1],
  [0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
]

function getRandomSymbolID(): SymbolID {
  const rand = Math.floor(Math.random() * 5);
  return rand;
}

/** Performs object deepcopy to copy a board and avoid mutation */
export function copyBoard(board: BoardMatrix): BoardMatrix {
  return [...board.map((arr) => [...arr])];
}

/**
 *  Recursive function that removes combinations from board by replacing the second combination symbol
 * to one that will not make other combinations with the adjacent symbols.
*/
function removeBoardCombinations(board: BoardMatrix): BoardMatrix {
  const auxBoard = copyBoard(board);
  const combinations = getCombinationsInBoard(auxBoard);
  combinations.forEach(({ points }) => {
    const { x, y } = points[1];
    const symbol = auxBoard[y][x];
    const adjTop = auxBoard[Math.max(y - 1, 0) % 5][x];
    const adjBottom = auxBoard[Math.max(y + 1, 0) % 5][x];
    const adjLeft = auxBoard[y][Math.max(x - 1, 0) % 5];
    const adjRight = auxBoard[y][Math.max(x + 1, 0) % 5];
    const options = [0, 1, 2, 3, 4].filter((sb) => sb !== symbol && sb !== adjTop && sb !== adjBottom && sb !== adjLeft && sb !== adjRight);
    auxBoard[y][x] = options[0];
  });
  if (getCombinationsInBoard(auxBoard).length > 0) return removeBoardCombinations(auxBoard);
  return auxBoard;
}

/** Makes a completely random board */
function makeRandomBoard(): BoardMatrix {
  return InitialBoard.map((row) => row.map((_) => getRandomSymbolID()));
}

/** Makes the first game board, with at least 1 possible action, and no initial combinations */
export function makeFirstBoard(): BoardMatrix {
  const randBoard = makeRandomBoard();
  const cleanBoard = removeBoardCombinations(randBoard);
  return cleanBoard;
}

/** 
 *  Applies gravity on a given column, shifting all non empty spaces to bottom while maintaining order
 * and replacing empty symbols by a random symbol
 */
function applyColumnGravity(column: Array<number>): Array<number> {
  const aux = [...column];
  for (let i = 0; i < column.length; i++) {
    const sb = aux[i];
    if (sb === -1) {
        aux.splice(i, 1);
        aux.unshift(getRandomSymbolID());
    }
  }
  return aux;
}

/**
 *  Applies gravity, making symbols fall into empty spaces, and new random symbols originate from
 * board's top
 */
export function applyBoardGravity(board: BoardMatrix): { board: BoardMatrix, newSymbols: Array<Point> } {
  const indexes = rangeArray(0, board.length - 1);
  const newSymbols: Array<Point> = [];
  const auxBoard = copyBoard(board);
  for (let c = 0; c < board.length; c++) {
    const column = indexes.map((r) => board[r][c]);
    const newColumn = applyColumnGravity(column);
    indexes.forEach((r) => {
      auxBoard[r][c] = newColumn[r];
      newSymbols.push(new Point(r, c));
    });
  }
  return { board: auxBoard, newSymbols };
}

/** Returns if two board positions are adjacent horizontally or vertically (not diagonally) */
export function isAdjacent(point1: Point, point2: Point): boolean {
  const dX = Math.abs(point1.x - point2.x);
  const dY = Math.abs(point1.y - point2.y);
  return dX + dY <= 1;
}
