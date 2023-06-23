import { Point, Sprite } from "pixi.js";
import { SymbolID } from "../Types";
import { getSymbolTexture } from "../assetLoad";
import { SymbolMargin, SymbolSize } from "../scenes/GameScene";

export default class SymbolComponent extends Sprite {
  private _symbolID: SymbolID;

  private _boardPos: Point;

  public get symbolID(): SymbolID {
    return this._symbolID;
  }

  public set symbolID(val: SymbolID) {
    this._symbolID = val;
    this.updateTexture();
  }

  public get boardPos(): Point {
    return this._boardPos;
  }

  public set boardPos(val: Point) {
    this._boardPos = val;
    this.updatePosition();
  }

  constructor(symbolID: SymbolID, size: number, boardPos: Point) {
    super();
    this._symbolID = symbolID;
    this._boardPos = boardPos;
    this.anchor.set(0.5);
    this.width = size;
    this.height = size;
    this.updateTexture();
  }

  protected updatePosition(): void {
    const size = SymbolSize + SymbolMargin;
    this.position = new Point(this.boardPos.x * size, this.boardPos.y * size);
  }

  protected updateTexture(): void {
    const tex = getSymbolTexture(this._symbolID);
    if (tex) this.texture = tex;
    else this.texture = null;
  }
}
