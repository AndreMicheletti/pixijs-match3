import { Application, Ticker } from "pixi.js";
import { IScene } from "./scripts/types";
import * as Tweedle from 'tweedle.js';

export const SCREEN_WIDTH = 640;
export const SCREEN_HEIGHT = 480;

export class Manager {
  private constructor() { }
  private static app: Application;
  private static currentScene: IScene;

  public static initialize(): Application {
    Manager.app = new Application({
      view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 'black',
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });
    Manager.app.ticker.add(Manager.update);
    Manager.app.ticker.add(() => Tweedle.Group.shared.update(Ticker.shared.elapsedMS), this);
    return Manager.app;
  }

  public static async changeScene(newScene: IScene): Promise<void> {
    if (Manager.currentScene) {
      await Manager.currentScene.onLeave();
      Manager.app.stage.removeChild(Manager.currentScene);
      Manager.currentScene.destroy();
    }
    Manager.currentScene = newScene;
    Manager.app.stage.addChild(Manager.currentScene);
    await Manager.currentScene.onEnter();
  }

  public static getApp(): Application {
    return Manager.app;
  }

  private static update(): void {
    if (Manager.currentScene) Manager.currentScene.update();
  }
}