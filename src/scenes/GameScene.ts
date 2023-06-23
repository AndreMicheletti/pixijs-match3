import { Container, FederatedPointerEvent, Point, Ticker } from "pixi.js";
import * as Tween from "tweedle.js";
import { BoardMatrix, Direction, GameAction, GameCombination, SymbolID } from "../Types";
import { animateSymbolExplode, animateSymbolSwap, animateSymbolToPosition } from "../animationHandler";
import { applyActionOnBoard, createAction, getActionHash, getActionTargetPoint, getBoardValidActions } from "../board/actionHandler";
import { applyBoardGravity, copyBoard, isAdjacent, makeFirstBoard } from "../board/boardHandler";
import { getCombinationsInBoard, removeCombinationsFromBoard } from "../board/combinationHandler";
import SymbolComponent from "../components/SymbolComponent";
import { rangeArray } from "../utils";

export const SymbolSize = 48;
export const SymbolMargin = 2;

export class GameScene extends Container {
  private readonly screenWidth: number;
  private readonly screenHeight: number;

  private board: BoardMatrix = [];

  private validActions: Array<number> = [];

  private boardContainer: Container;

  private symbols: Array<SymbolComponent> = [];

  private tappedSymbol: SymbolComponent | null = null;

  private targetSymbol: SymbolComponent | null = null;

  private _processing = false;

  private get processing(): boolean {
    return this._processing;
  }

  private set processing(val: boolean) {
    this._processing = val;
    this.symbols.forEach((sb) => {
      sb.eventMode = val ? 'none' : 'static';
    });
  }

  constructor(screenWidth: number, screenHeight: number) {
    super();
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.board = makeFirstBoard();
    this.boardContainer = this.createBoardContainer();
    this.addChild(this.boardContainer);
    this.calculateValidActions();
    Ticker.shared.add(this.update, this);
    Ticker.shared.add(() => Tween.Group.shared.update(Ticker.shared.elapsedMS), this);
    this.processing = false;
  }

  private makeSymbol(symbolId: SymbolID, size: number, pos: Point): SymbolComponent {
    const symbol = new SymbolComponent(symbolId, size, pos);
    symbol.on('pointerdown', (e: FederatedPointerEvent) => this.onSymbolTap(e, symbol));
    symbol.on('pointerenter', (e: FederatedPointerEvent) => this.onSymbolEnter(e, symbol));
    symbol.on('pointerup', (e: FederatedPointerEvent) => this.onSymbolRelease(e, symbol));
    symbol.on('pointerupoutside', (e: FederatedPointerEvent) => this.onSymbolRelease(e, symbol));
    symbol.eventMode = this.processing ? 'none' : 'static';
    return symbol;
  }

  private onSymbolTap(_e: FederatedPointerEvent, symbol: SymbolComponent): void {
    console.log(' $ symbol tap! ', symbol.boardPos);
    this.tappedSymbol = symbol;
  }

  private onSymbolEnter(_e: FederatedPointerEvent, symbol: SymbolComponent): void {
    if (!this.tappedSymbol) return;
    console.log(' $ symbol enter! ', symbol.boardPos);
    if (this.tappedSymbol !== symbol && isAdjacent(symbol.boardPos, this.tappedSymbol.boardPos))
      this.targetSymbol = symbol;
    else if (this.tappedSymbol === symbol)
      this.targetSymbol = null;
  }

  private onSymbolRelease(_e: FederatedPointerEvent, symbol: SymbolComponent): void {
    console.log(' $ symbol release! ', symbol.boardPos);
    if (this.tappedSymbol && this.targetSymbol) {
      // take action
      const action = createAction(this.tappedSymbol.boardPos, this.targetSymbol.boardPos);
      const actionHash = getActionHash(action);
      console.log(' $ ACTION! ', action);
      if (this.validActions.includes(actionHash)) {
        console.log(' $ VALID');
        this.processAction(action);
      } else console.log(' $ INVALID');
    }
    this.tappedSymbol = null;
    this.targetSymbol = null;
  }

  private async processAction(action: GameAction): Promise<void> {
    this.processing = true;
    const targetPoint = getActionTargetPoint(action);
    const symbol = this.getSymbolOnPoint(action.point);
    const targetSymbol = this.getSymbolOnPoint(targetPoint);
    if (symbol && targetSymbol) {
      this.board = applyActionOnBoard(this.board, action);
      await animateSymbolSwap(symbol, targetSymbol);
      symbol.boardPos = targetSymbol.boardPos;
      targetSymbol.boardPos = action.point;
      const combinations = getCombinationsInBoard(this.board);
      await this.processCombinations(combinations);
    }
    this.calculateValidActions();
    this.processing = false;
  }

  private async processCombinations(combinations: Array<GameCombination>): Promise<void> {
    if (combinations.length <= 0) return;
    console.log(' COMBINATIONS ', combinations);
    console.log(' BEFORE BOARD ', this.board);
    const removeBoard = removeCombinationsFromBoard(this.board, combinations);
    console.log(' REMOVE BOARD ', removeBoard);
    const { board } = applyBoardGravity(removeBoard);
    console.log(' AFTER GRAVITY BOARD ', board);
    this.board = copyBoard(board);
    for await (const combination of combinations) {
      const { points, direction, height } = combination;
      await Promise.all(points.map(async (point, idx) => {
        const symbol = this.getSymbolOnPoint(point);
        if (!symbol) return;
        await animateSymbolExplode(symbol);
        const offsetY = direction === Direction.Horizontal ? -1 : -1 - idx;
        const newPoint = new Point(point.x, offsetY);
        symbol.setBoardData(newPoint, this.board[height + offsetY][newPoint.x]);
      }));
      await this.processSymbolFall(combination);
    }
    this.updateSymbolsToBoardData();
    return this.processCombinations(getCombinationsInBoard(this.board));
  }

  private async processSymbolFall(combination: GameCombination): Promise<void> {
    const { points, direction, height } = combination;
    const columns = direction === Direction.Vertical ? [points[0].x] : points.map((p) => p.x);
    const allPromises = [];
    for (const x of columns) {
      const { y } = points.reduce((prev, curr) => prev.y < curr.y ? prev : curr);
      const promises = rangeArray(1, this.board.length + 1).map(async (idx) => {
        // Each symbol must drop "height" positions
        const currPoint = new Point(x, y - idx);
        const currSymbol = this.getSymbolOnPoint(currPoint);
        if (!currSymbol) return;
        const targetPoint = new Point(currPoint.x, currPoint.y + height);
        const targetPosition = this.getPositionForPoint(targetPoint);
        await animateSymbolToPosition(currSymbol, targetPosition);
        currSymbol.setBoardData(targetPoint, currSymbol.symbolID);
      });
      allPromises.push(Promise.all(promises));
    }
    await Promise.all(allPromises);
  }

  private createBoardContainer(): Container {
    const container = new Container();
    // Move container to the center
    container.x = this.screenWidth / 2;
    container.y = this.screenHeight / 2;
    // Add Symbol Components
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const symbolId = this.board[r][c];
        const boardPos = new Point(c, r);
        const symbol = this.makeSymbol(symbolId, SymbolSize, boardPos);
        symbol.position = this.getPositionForPoint(new Point(c, r));
        this.symbols.push(symbol);
        container.addChild(symbol);
      }
    }
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
    return container;
  }

  protected update(): void {
    this.symbols.forEach((sb) => {
      sb.alpha = sb === this.tappedSymbol || sb === this.targetSymbol ? 0.5 : 1;
    });
  }

  private getSymbolOnPoint({ x, y }: Point): SymbolComponent | undefined {
    return this.symbols.find((symbol) => symbol.boardPos.x === x && symbol.boardPos.y === y);
  }

  private getPositionForPoint({ x, y }: Point): Point {
    const size = SymbolSize + SymbolMargin;
    return new Point(x * size, y * size);
  }

  private updateSymbolsToBoardData(): void {
    this.board.forEach((row, rowIdx) => row.forEach((sbID, colIdx) => {
      const point = new Point(colIdx, rowIdx);
      const symbol = this.getSymbolOnPoint(point);
      if (!symbol) console.error(' WHAT? NO SYMBOL ON POINT ', point, this.symbols);
      else symbol.setBoardData(point, sbID);
    }));
  }

  private calculateValidActions(): void {
    const actions = getBoardValidActions(this.board);
    this.validActions = actions.map((action) => getActionHash(action));
    console.log(' $ VALID ACTIONS ', this.validActions);
  }
}