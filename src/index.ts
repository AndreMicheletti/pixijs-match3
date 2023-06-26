import { Manager } from './Manager';
import { LobbyScene } from './scenes/LobbyScene';
import { loadAssets } from './scripts/assetLoad';

/** Execute initial loading and update progress bar */
async function loadGame(): Promise<void> {
  const loading = document.getElementById('loading');
  const barFill = document.getElementById('bar-fill');
  const updateProgress = (progress: number) => {
    barFill.style.width = `${progress * 100}%`;
  }
  await loadAssets(updateProgress);
  setTimeout(() => {
    loading.style.display = 'none';
  }, 200);
  Manager.background.makeFogs();
}

(async function () {
  const app = await Manager.initialize();
  // Pixi DevTools
  (globalThis as any).__PIXI_APP__ = app;

  await loadGame();
  Manager.changeScene(new LobbyScene());
})();
