import { Assets, ProgressCallback, Texture } from "pixi.js";
import { SymbolID } from "./types";

export enum GameFont {
  DirtyHarold = 'DirtyHarold',
};

export const GameAssets = {
  mainAtlas: 'main_atlas.json',
  background: 'back.jpg',
  loadingBar: 'loading_bar.png',
  loadingFill: 'loading_fill.png',
  buttonBase: 'btn_base.png',
  buttonBasePressed: 'btn_base_pressed.png',
  fonts: [
    'fonts/DirtyHarold.woff2',
  ],
}

const SymbolAssetMap: Record<SymbolID, string> = {
  [SymbolID.Empty]: '',
  [SymbolID.Zombie]: 'sb1.png',
  [SymbolID.Brain]: 'sb2.png',
  [SymbolID.Skull]: 'sb3.png',
  [SymbolID.Goblin]: 'sb4.png',
  [SymbolID.Eyes]: 'sb5.png',
};

export function getSymbolTexture(symbolID: SymbolID): Texture | undefined {
  return Assets.get(GameAssets.mainAtlas).textures[SymbolAssetMap[symbolID]];
}

export async function loadAssets(onProgress: ProgressCallback): Promise<void> {
  await Assets.load([GameAssets.mainAtlas, ...GameAssets.fonts], onProgress);
}

export function loadBackground(): Promise<Texture> {
  return Assets.load(GameAssets.background);
}
