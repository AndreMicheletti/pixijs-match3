import { Spritesheet, Texture, Assets } from "pixi.js";
import { SymbolID } from "./Types";

type AssetLoadData = {
  symbolAtlas: Spritesheet | undefined;
  background: Texture | undefined;
}

const AssetLoad: AssetLoadData = {
  symbolAtlas: undefined,
  background: undefined,
}

const AssetsMap = {
  symbolAtlas: 'symbols.json',
  background: 'back.jpg',
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
  return AssetLoad.symbolAtlas?.textures[SymbolAssetMap[symbolID]];
}

export function getAssets(): AssetLoadData {
  return AssetLoad;
}

export async function loadAssets(): Promise<void> {
  AssetLoad.symbolAtlas = await Assets.load(AssetsMap.symbolAtlas);
  AssetLoad.background = await Assets.load(AssetsMap.background);
}
