import { Sprite, Texture, BlurFilter, Point, Assets } from "pixi.js";
import { GameAssets, getAtlasTexture, loadBackground } from "../scripts/assetLoad";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../Manager";
import { Easing, Tween } from "tweedle.js";

export default class GameBackground extends Sprite {
  private readonly blurFilter: BlurFilter;

  static async makeBackground(): Promise<GameBackground> {
    const background = new GameBackground(await loadBackground());
    return background;
  }

  public get blur(): number {
    return this.blurFilter.blur;
  }

  public set blur(value: number) {
    this.blurFilter.blur = value;
  }

  constructor(texture?: Texture) {
    super(texture);
    this.blurFilter = new BlurFilter();
    this.filters = [this.blurFilter];
    this.anchor.set(0.5);
    this.position = new Point(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    this.width = SCREEN_WIDTH;
    this.height = SCREEN_HEIGHT;
  }

  public makeFogs(): void {
    this.makeFog(-400, -550, 1);
    this.makeFog(400, 550, -1);
  }

  private makeFog(x: number, y: number, direction: number): Sprite {
    const sprite = new Sprite(getAtlasTexture(GameAssets.fog));
    sprite.anchor.set(0.5);
    sprite.x = x;
    sprite.y = y;
    sprite.scale.set(1.5);
    this.addChild(sprite);
    new Tween(sprite)
      .to({ x: x + 400 * direction, y: y + 20 }, 5000)
      .easing(Easing.Sinusoidal.InOut)
      .yoyo(true)
      .repeat(Infinity)
      .start();
    return sprite;
  }
}