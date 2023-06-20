import { BoardMatrix, SymbolID } from "../Types";
import { getCombinationsInBoard } from "./combinationHandler";

const InitialBoard = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

function getRandomSymbolID(): SymbolID {
  const rand = Math.floor(Math.random() * 5);
  return rand;
}

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
