import { Point, Sprite } from "pixi.js";
import { getSymbolTexture } from "../scripts/assetLoad";
import { SYMBOL_MARGIN, SYMBOL_SIZE } from "../scripts/board/boardHandler";
import { SymbolID } from "../scripts/types";

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
    const size = SYMBOL_SIZE + SYMBOL_MARGIN;
    this.position = new Point(this.boardPos.x * size, this.boardPos.y * size);
  }

  protected updateTexture(): void {
    const tex = getSymbolTexture(this._symbolID);
    if (tex) this.texture = tex;
    else this.texture = null;
  }
}
