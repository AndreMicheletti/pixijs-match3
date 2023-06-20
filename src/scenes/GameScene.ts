import { Container, Point } from "pixi.js";
import { BoardMatrix, GameAction } from "../Types";
import { getActionHash, getBoardValidActions } from "../board/actionHandler";
import { makeFirstBoard } from "../board/boardHandler";
import SymbolComponent from "../components/SymbolComponent";

export class GameScene extends Container {
  private readonly screenWidth: number;
  private readonly screenHeight: number;

  private board: BoardMatrix = [];

  private validActions: Record<number, GameAction> = {};

  private boardContainer: Container;

  private symbols: Array<SymbolComponent> = [];

  private _interactible = false;

  private get interactible(): boolean {
    return this._interactible;
  }

  private set interactible(value: boolean) {
    this._interactible = value;
    this.symbols.forEach((symbol) => symbol.interactive = value);
  }

  constructor(screenWidth: number, screenHeight: number) {
    super();
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.board = makeFirstBoard();
    this.boardContainer = this.createBoardContainer();
    this.addChild(this.boardContainer);
    this.calculateValidActions();
    this.interactible = true;
  }

  private createBoardContainer(): Container {
    const symbolSize = 48;
    const margin = 2;
    const container = new Container();
    // Move container to the center
    container.x = this.screenWidth / 2;
    container.y = this.screenHeight / 2;
    // Add Symbol Components
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const symbolId = this.board[r][c];
        const boardPos = new Point(c, r);
        const symbol = new SymbolComponent(symbolId, symbolSize, boardPos);
        symbol.x = (symbolSize + margin) * c;
        symbol.y = (symbolSize + margin) * r;
        symbol.interactive = this.interactible;
        this.symbols.push(symbol);
        container.addChild(symbol);
      }
    }
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
    return container;
  }

  // private getSymbolOnPos({ x, y }: Point): SymbolComponent | undefined {
  //   return this.symbols.find((symbol) => symbol.boardPos.x === x && symbol.boardPos.y === y);
  // }

  private calculateValidActions(): void {
    this.validActions = {};
    const actions = getBoardValidActions(this.board);
    actions.forEach((action) => {
      const hash = getActionHash(action);
      this.validActions[hash] = action;
    });
    console.log(' $ VALID ACTIONS ', this.validActions);
  }
}