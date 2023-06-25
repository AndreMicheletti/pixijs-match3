import { Application, Point, Sprite } from 'pixi.js';
import { Manager, SCREEN_HEIGHT, SCREEN_WIDTH } from './Manager';
import { LobbyScene } from './scenes/LobbyScene';
import { loadAssets, loadBackground } from './scripts/assetLoad';

async function makeBackground(): Promise<Sprite> {
  const background = new Sprite(await loadBackground());
  background.anchor.set(0.5);
  background.position = new Point(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
  background.width = SCREEN_WIDTH;
  background.height = SCREEN_HEIGHT;
  return background;
}

async function loadGame(app: Application): Promise<void> {
  const background = await makeBackground();
  app.stage.addChild(background);
  await loadAssets((progress: number) => console.log('PROGRESS: ', progress));
}

(async function () {
  const app = Manager.initialize();
  // Pixi DevTools
  (globalThis as any).__PIXI_APP__ = app;

  await loadGame(app);
  Manager.changeScene(new LobbyScene());
})();
