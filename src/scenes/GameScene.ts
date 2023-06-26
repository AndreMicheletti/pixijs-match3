import { Container, Point, Text, TextStyle, Ticker } from "pixi.js";
import { Easing, Tween } from "tweedle.js";
import { Manager, SCREEN_HEIGHT, SCREEN_WIDTH } from "../Manager";
import GameOver from "../components/GameOver";
import GameUI from "../components/GameUI";
import SymbolComponent from "../components/generic/SymbolComponent";
import { BoardGroup, UIGroup, animateBoardImpact, animateScoreFeedback, animateSymbolExplode, animateSymbolSwap, animateSymbolToPosition, fadeComponent } from "../scripts/animationHandler";
import { GameFont } from "../scripts/assetLoad";
import { applyActionOnBoard, createAction, getActionHash, getActionTargetPoint, getBoardValidActions } from "../scripts/board/actionHandler";
import { BOARD_SIZE, SYMBOL_MARGIN, SYMBOL_SIZE, applyBoardGravity, copyBoard, findGravityDrops, isAdjacent, makeFirstBoard } from "../scripts/board/boardHandler";
import { getCombinationScore, getCombinationsInBoard, removeCombinationsFromBoard } from "../scripts/board/combinationHandler";
import { BoardMatrix, GameAction, GameCombination, GameRules, IScene, SymbolID } from "../scripts/types";
import { rangeArray } from "../scripts/utils";

export class GameScene extends Container implements IScene {
  private readonly rules: GameRules;

  private board: BoardMatrix = [];

  private validActions: Array<number> = [];

  private boardContainer: Container;

  private refillSymbols: Record<number, Array<SymbolComponent>> = {};

  private tappedSymbol: SymbolComponent | null = null;

  private targetSymbol: SymbolComponent | null = null;

  // #region Components
  private symbols: Array<SymbolComponent> = [];

  private ui: GameUI;

  private gameOver: GameOver;
  // #endregion

  // When game is processing round, interactions are disabled
  private _processing = false;

  private isGameOver = false;

  private hasWon = false;

  private get processing(): boolean {
    return this._processing;
  }

  private set processing(val: boolean) {
    this._processing = val;
    this.symbols.forEach((sb) => {
      sb.eventMode = val ? 'none' : 'static';
    });
  }

  constructor(rules: GameRules) {
    super();
    this.rules = rules;
    this.gameOver = new GameOver(this.startNewGame.bind(this));
    this.ui = new GameUI(rules.limitTime, rules.limitScore, this.onTimerEnded.bind(this));
    this.board = makeFirstBoard();
    this.boardContainer = this.createBoardContainer();
    this.boardContainer.scale = { x: 1.3, y: 1.3 };
    this.addChild(this.boardContainer);
    this.addChild(this.ui);
    this.calculateValidActions();
    // Add ticker functions
    Ticker.shared.add(this.update, this);
    this.processing = false;
  }

  public async onEnter(): Promise<void> {
    const initialY = this.boardContainer.y;
    this.boardContainer.y = initialY + 100;
    this.ui.alpha = 0;
    await new Promise<void>((resolve) => {
      new Tween(this.boardContainer)
        .to({ scale: { x: 1, y: 1 }, y: initialY }, 300)
        .easing(Easing.Quadratic.Out)
        .onComplete(() => resolve())
        .start();
      new Tween(Manager.background)
        .to({ blur: 1 }, 300)
        .easing(Easing.Quadratic.Out)
        .start();
      fadeComponent(this.ui, 500, 1)
    });
  }

  public async onLeave(): Promise<void> {
    // Empty
  }

  public update(): void {
    if (this.isGameOver === false) this.ui.time -= Ticker.shared.elapsedMS / 2000.0;
    BoardGroup.update(Ticker.shared.elapsedMS);
    UIGroup.update(Ticker.shared.elapsedMS);
    this.updateSymbolInputFeedback();
  }

  // #region Game Flow

  private processGameOver(won: boolean): void {
    this.hasWon = won;
    this.processing = true;
    this.isGameOver = true;
    this.addChild(this.gameOver);
    this.gameOver.alpha = 0;
    this.gameOver.show(won, this.ui.score);
  }

  private startNewGame(): void {
    const { limitScore, limitTime } = this.rules;
    const newRules = this.hasWon ? {
      limitScore: limitScore + 100,
      limitTime: limitTime,
    } : { limitScore, limitTime };
    Manager.changeScene(new GameScene(newRules));
  }

  /**
   *  Starts processing the action taken by the player.
   * Will swap the symbols from the action.
   */
  private async processAction(action: GameAction): Promise<void> {
    this.processing = true;
    const targetPoint = getActionTargetPoint(action);
    const symbol = this.getSymbolOnPoint(action.point);
    const targetSymbol = this.getSymbolOnPoint(targetPoint);
    const isValid = this.validActions.includes(getActionHash(action))
    if (isValid && symbol && targetSymbol) {
      // Valid Action
      this.board = applyActionOnBoard(this.board, action);
      await animateSymbolSwap(symbol, targetSymbol);
      symbol.boardPos = targetSymbol.boardPos;
      targetSymbol.boardPos = action.point;
      const combinations = getCombinationsInBoard(this.board);
      await this.processCombinations(combinations);
      this.calculateValidActions();
    } else {
      // Invalid Action
      await animateSymbolSwap(symbol, targetSymbol);
      await animateSymbolSwap(targetSymbol, symbol);
    }
    if (this.ui.score >= this.rules.limitScore) this.processGameOver(true);
    else if (this.isGameOver === true) this.processGameOver(false);
    else this.processing = false;
  }

  /**
   *  Processes the combinations present in a game board, removing them and adding new symbols
   * by the gravity mechanic.
   *  Will call itself recursively until there are no combinations left in the board.
   */
  private async processCombinations(combinations: Array<GameCombination>): Promise<void> {
    if (combinations.length <= 0) return;
    this.board = removeCombinationsFromBoard(this.board, combinations);
    const feedbackPromises = [];
    await Promise.all(combinations.map((combination, idx) => {
      feedbackPromises.push(this.showScoreFeedback(combination, idx));
      return Promise.all(combination.map(async (point) => {
        const symbol = this.getSymbolOnPoint(point);
        if (!symbol) return
        await animateSymbolExplode(symbol);
        this.addSymbolToRefill(symbol, new Point(point.x, -1))
      }))
    }));
    await this.processSymbolsFall();
    await this.processSymbolRefill();
    await Promise.all(feedbackPromises);
    this.updateSymbolsToBoardData();
    await this.processCombinations(getCombinationsInBoard(this.board));
  }

  /**
   * Processes the columns falling into empty spaces left by matching combinations
   */
  private async processSymbolsFall(): Promise<void> {
    const board = applyBoardGravity(this.board);
    const indexes = rangeArray(0, this.board.length - 1);
    const allDrops = [];
    for (let c = 0; c < this.board.length; c++) {
      const column = indexes.map((r) => this.board[r][c]);
      const drops = findGravityDrops(column, c);
      allDrops.push(...drops.map(async ({ point, newPoint }) => {
        const symbol = this.getSymbolOnPoint(point);
        if (!symbol) return;
        const pos = this.getPositionForPoint(newPoint);
        await animateSymbolToPosition(symbol, pos, { duration: 400, easing: Easing.Quartic.In });
        symbol.boardPos = newPoint;
        symbol.symbolID = board[newPoint.y][newPoint.x];
      }));
    }
    animateBoardImpact(this.boardContainer, 785, 4);
    await Promise.all(allDrops);
    this.board = copyBoard(board);
  }

  /**
   * Processes the brand-new symbols falling to the board
   */
  private async processSymbolRefill(): Promise<void> {
    await Promise.all(Object.entries(this.refillSymbols).map(([x, symbolList]) =>
      Promise.all(rangeArray(symbolList.length - 1, 0, -1).map(async (y) => {
        const symbol = symbolList[y];
        const point = new Point(+x, y);
        const position = this.getPositionForPoint(point);
        symbol.boardPos = new Point(symbol.boardPos.x, 0 - symbolList.length + y);
        symbol.symbolID = this.board[y][+x];
        animateBoardImpact(this.boardContainer, 650);
        await animateSymbolToPosition(symbol, position, { easing: Easing.Quartic.In });
        symbol.boardPos = point;
      }))
    ));
    this.refillSymbols = {};
  }

  private calculateValidActions(): void {
    const actions = getBoardValidActions(this.board);
    this.validActions = actions.map((action) => getActionHash(action));
    console.log(' $ VALID ACTIONS ', this.validActions);
  }

  // #endregion

  // #region Helpers

  private updateSymbolsToBoardData(): void {
    this.board.forEach((row, rowIdx) => row.forEach((sbID, colIdx) => {
      const point = new Point(colIdx, rowIdx);
      const symbol = this.getSymbolOnPoint(point);
      if (!symbol) return;
      symbol.boardPos = point;
      symbol.symbolID = sbID;
    }));
  }

  private getSymbolOnPoint({ x, y }: Point): SymbolComponent | undefined {
    return this.symbols.find((symbol) => symbol.boardPos.x === x && symbol.boardPos.y === y);
  }

  private getPositionForPoint({ x, y }: Point): Point {
    const size = SYMBOL_SIZE + SYMBOL_MARGIN;
    return new Point(x * size, y * size);
  }

  private addSymbolToRefill(symbol: SymbolComponent, point: Point): void {
    const { x } = symbol.boardPos;
    if (!this.refillSymbols[x]) this.refillSymbols[x] = [];
    this.refillSymbols[x].push(symbol);
    symbol.boardPos = point;
    symbol.symbolID = SymbolID.Empty;
  }

  // #endregion  

  // #region Input Listeners

  private onSymbolTap(symbol: SymbolComponent): void {
    this.tappedSymbol = symbol;
  }

  private onSymbolEnter(symbol: SymbolComponent): void {
    if (!this.tappedSymbol) return;
    if (this.tappedSymbol !== symbol && isAdjacent(symbol.boardPos, this.tappedSymbol.boardPos))
      this.targetSymbol = symbol;
    else if (this.tappedSymbol === symbol)
      this.targetSymbol = null;
  }

  private onSymbolRelease(): void {
    if (this.tappedSymbol && this.targetSymbol) {
      // take action
      const action = createAction(this.tappedSymbol.boardPos, this.targetSymbol.boardPos);
      this.processAction(action);
    }
    this.tappedSymbol = null;
    this.targetSymbol = null;
    this.updateSymbolInputFeedback();
  }

  private onTimerEnded(): void {
    if (this.isGameOver === true) return;
    this.isGameOver = true;
    if (this.processing === false) this.processGameOver(false);
  }

  private updateSymbolInputFeedback(): void {
    this.symbols.forEach((sb) => {
      const isHighlighted = sb === this.tappedSymbol || sb === this.targetSymbol;
      sb.width = isHighlighted ? SYMBOL_SIZE + 5 : SYMBOL_SIZE;
      sb.height = isHighlighted ? SYMBOL_SIZE + 5 : SYMBOL_SIZE;
    });
  }

  // #endregion

  // #region Initialization

  private createBoardContainer(): Container {
    const container = new Container();
    // Move container to the center
    container.x = SCREEN_WIDTH / 2;
    container.y = SCREEN_HEIGHT / 2;
    // Add Symbol Components
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const symbolId = this.board[r][c];
        const boardPos = new Point(c, r);
        const symbol = this.makeSymbol(symbolId, SYMBOL_SIZE, boardPos);
        symbol.position = this.getPositionForPoint(new Point(c, r));
        this.symbols.push(symbol);
        container.addChild(symbol);
      }
    }
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
    return container;
  }

  private makeSymbol(symbolId: SymbolID, size: number, pos: Point): SymbolComponent {
    const symbol = new SymbolComponent(symbolId, size, pos);
    symbol.on('pointerdown', () => this.onSymbolTap(symbol));
    symbol.on('pointerenter', () => this.onSymbolEnter(symbol));
    symbol.on('pointerup', () => this.onSymbolRelease());
    symbol.on('pointerupoutside', () => this.onSymbolRelease());
    symbol.eventMode = this.processing ? 'none' : 'static';
    return symbol;
  }

  private async showScoreFeedback(combination: GameCombination, idx: number): Promise<void> {
    const { scoreValueLabel } = this.ui;
    const score = getCombinationScore(combination);
    const symbol = this.getSymbolOnPoint(combination[1]);
    if (!symbol) return;
    const text = new Text(`${score}`, new TextStyle({
      fontFamily: GameFont.Poppins,
      fontSize: 30,
      fill: 'white',
      stroke: 'black',
      strokeThickness: 5,
      align: "center",
    }));
    text.anchor.set(0.5);
    text.x = symbol.x;
    text.y = symbol.y;
    this.boardContainer.addChild(text);
    const target = this.boardContainer.toLocal(scoreValueLabel.getGlobalPosition());
    const targetPosition = new Point(target.x + 25, target.y + 25);
    await animateScoreFeedback(text, score, targetPosition, 500 * idx, () => {
      this.ui.score += score;
    });
    text.destroy();
  }

  // #endregion
}