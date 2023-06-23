import { Spritesheet, Texture, Assets } from "pixi.js";
import { SymbolID } from "./Types";

let symbolSpritesheet: Spritesheet;

const AssetsMap = {
  symbolAtlas: 'symbols.json',
}

const SymbolAssetMap: Record<SymbolID, string> = {
  [SymbolID.Empty]: '',
  [SymbolID.Zombie]: 'sb1.png',
  [SymbolID.Brain]: 'sb2.png',
  [SymbolID.Skull]: 'sb3.png',
  [SymbolID.Goblin]: 'sb4.png',
  [SymbolID.Eyes]: 'sb5.png',
};

export function getSymbolTexture(symbolID: SymbolID): Texture {
  return symbolSpritesheet?.textures[SymbolAssetMap[symbolID]];
}

export async function loadAssets(): Promise<void> {
  symbolSpritesheet = await Assets.load(AssetsMap.symbolAtlas);
}