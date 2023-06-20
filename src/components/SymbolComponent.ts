import { Point, Sprite } from "pixi.js";
import { SymbolID } from "../Types";
import { getSymbolTexture } from "../assetLoad";

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
    this.texture = getSymbolTexture(symbolID);
    this.on('pointertap', () => {
      console.log(' $ OPA. Clicked on ', this.boardPos);
    });
  }
}
