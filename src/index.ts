import { Application } from 'pixi.js';
import { loadAssets } from './assetLoad';
import { GameScene } from './scenes/GameScene';

(async function () {
  const app = new Application({
    view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x6495ed,
    width: 640,
    height: 480,
  });

  // Pixi DevTools
  (globalThis as any).__PIXI_APP__ = app; // eslint-disable-line

  await loadAssets();
  const gameScene = new GameScene(app.screen.width, app.screen.height);
  app.stage.addChild(gameScene);
})();
