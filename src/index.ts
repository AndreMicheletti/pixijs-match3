import { Application } from 'pixi.js';
import { GameScene } from './scenes/GameScene';
import { loadAssets } from './assetLoad';

(async function () {
  const app = new Application({
    view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x6495ed,
    width: 640,
    height: 480
  });
  
  await loadAssets();
  const gameScene = new GameScene(app.screen.width, app.screen.height);
  app.stage.addChild(gameScene);
})();
