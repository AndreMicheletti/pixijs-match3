import { Point } from "pixi.js";
import { BoardMatrix, Direction, GameCombination, SymbolID } from "../Types";

/** Get all 3 or more symbol combinations on a given line (array of symbols) */
export function getCombinationsInLine(line: Array<SymbolID>): Array<Array<number>> {
  const result: Array<Array<number>> = [];
  let previous = null;
  let combination: Array<number> = [];
  for (let i = 0; i < line.length; i++) {
    const current = line[i];
    if (current === previous) combination.push(i - 1);
    if (current !== previous || i == line.length) {
      if (combination.length >= 2) result.push([...combination, i - 1]);
      previous = current;
      combination = [];
    }
  }
  // Combination ending in last position
  if (combination.length >= 2) result.push([...combination, line.length - 1]);
  return result;
}

/** Get all board combinations, horizontal and vertical */
export function getCombinationsInBoard(board: BoardMatrix): Array<GameCombination> {
  const matches: Array<GameCombination> = [];
  for (let i = 0; i < board.length; i++) {
    const horizontalLine = board[i];
    const verticalLine = board.map((row) => row[i]);
    const hCombinations = getCombinationsInLine(horizontalLine).map((comb) => ({
      points: comb.map((r) => new Point(r, i)),
      direction: Direction.Horizontal,
    }));
    const vCombinations = getCombinationsInLine(verticalLine).map((comb) => ({
      points: comb.map((c) => new Point(i, c)),
      direction: Direction.Vertical,
    }));
    matches.push(...hCombinations);
    matches.push(...vCombinations);
  }
  return matches;
}