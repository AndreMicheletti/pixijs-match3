import { Application, Container, Ticker } from "pixi.js";
import * as Tweedle from 'tweedle.js';
import GameBackground from "./components/GameBackground";
import { IScene } from "./scripts/types";

export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 600;

export class Manager {
  private constructor() { }
  private static app: Application;
  private static currentScene: IScene;

  public static background: GameBackground;

  public static get scene(): IScene {
    return Manager.currentScene;
  }

  public static get stage(): Container {
    return Manager.app.stage;
  }

  public static async initialize(): Promise<Application> {
    Manager.app = new Application({
      view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 'black',
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });
    Manager.app.ticker.minFPS = 30;
    Manager.app.ticker.maxFPS = 60;
    Manager.app.ticker.add(Manager.update);
    Manager.app.ticker.add(() => Tweedle.Group.shared.update(Ticker.shared.elapsedMS), this);
    Manager.background = await GameBackground.makeBackground();
    Manager.app.stage.addChild(this.background);
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

  private static update(delta: number): void {
    if (Manager.currentScene) Manager.currentScene.update(delta);
  }
}
