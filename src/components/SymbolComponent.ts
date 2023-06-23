import { Point, Sprite } from "pixi.js";
import { SymbolID } from "../Types";
import { getSymbolTexture } from "../assetLoad";
import { SymbolMargin, SymbolSize } from "../scenes/GameScene";

export default class SymbolComponent extends Sprite {
  public symbolID: SymbolID;

  public boardPos: Point;

  constructor(symbolID: SymbolID, size: number, boardPos: Point) {
    super();
    this.symbolID = symbolID;
    this.boardPos = boardPos;
    this.anchor.set(0.5);
    this.width = size;
    this.height = size;
    this.updateTexture();
  }

  public setBoardData(point: Point, symbolId: SymbolID): void {
  const size = SymbolSize + SymbolMargin;
    this.symbolID = symbolId;
this.boardPos = point;
this.position = new Point(point.x * size, point.y * size);
this.updateTexture();
  }

  protected updateTexture(): void {
  this.texture = getSymbolTexture(this.symbolID);
}
}
