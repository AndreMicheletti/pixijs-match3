import { Container, Sprite } from "pixi.js";
import { Tween } from "tweedle.js";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../Manager";
import { bounceComponent } from "../scripts/animationHandler";
import { GameAssets, getAtlasTexture } from "../scripts/assetLoad";

export default class ProgressBar extends Container {
  private readonly barBase: Sprite;

  private readonly barMask: Sprite;

  private readonly barFill: Sprite;

  private complete = false;

  private _progress = 0;

  public get progress(): number {
    return this._progress;
  }

  public set progress(val: number) {
    this._progress = Math.min(val, 1);
    this.barMask.width = 2135 * val;
  }

  constructor(initialProgress = 0) {
    super();
    this.barBase = this.makeBarBase();
    this.barMask = this.makeBarMask();
    this.barFill = this.makeBarFill();
    this.barFill.mask = this.barMask;
    this.width = 400;
    this.height = 15;
    // Move container to the center
    this.pivot.x = this.width / 2;
    this.pivot.y = this.height / 2;
    this.x = 15 + SCREEN_WIDTH / 2;
    this.y = SCREEN_HEIGHT - 90;
    // Sets progress
    this.progress = initialProgress;
  }

  public animateToProgress(progress: number, duration = 200): Promise<void> {
    const parsedProgress = Math.min(progress, 1);
    if (parsedProgress >= 1 && this.complete === false) {
      this.complete = true;
      const scale = { x: this.scale.x + 0.008, y: this.scale.y + 0.005 }
      bounceComponent(this, scale, 400, Infinity);
    }
    return new Promise<void>((resolve) =>
      new Tween(this)
        .to({ progress: parsedProgress }, duration)
        .onComplete(() => resolve())
        .start()
    );
  }

  private makeBarBase(): Sprite {
    const barBase = new Sprite(getAtlasTexture(GameAssets.barBase));
    barBase.anchor.set(0.5);
    this.addChild(barBase);
    return barBase;
  }

  private makeBarFill(): Sprite {
    const barFill = new Sprite(getAtlasTexture(GameAssets.barFill));
    barFill.anchor.set(0.5, 0.5);
    barFill.x = 5;
    barFill.y = 5;
    this.addChild(barFill);
    return barFill;
  }

  private makeBarMask(): Sprite {
    const barMask = new Sprite(getAtlasTexture(GameAssets.barFill));
    barMask.anchor.set(0, 0.5);
    barMask.x = -2135 / 2;
    this.addChild(barMask);
    return barMask;
  }
}