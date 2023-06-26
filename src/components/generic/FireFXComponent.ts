import { AnimatedSprite, Assets, Container, Point, Spritesheet } from "pixi.js";
import { Easing, Tween } from "tweedle.js";
import { GameAssets } from "../../scripts/assetLoad";
import { SYMBOL_MARGIN, SYMBOL_SIZE } from "../../scripts/board/boardHandler";

export default class FireFXComponent extends AnimatedSprite {
  static spawnFireFX({ x, y }: Point, parent: Container, delay = 300): FireFXComponent {
    const textures = Object.values((Assets.get(GameAssets.fireAtlas) as Spritesheet).textures);
    const fireFX = new FireFXComponent(textures);
    const size = SYMBOL_SIZE + SYMBOL_MARGIN + 5;
    const finalSize = size + 50;
    const finalX = x - size / 2;
    const finalY = (y - size / 2) - 5;
    fireFX.x = finalX;
    fireFX.y = finalY;
    fireFX.width = size;
    fireFX.height = size;
    parent.addChild(fireFX);
    new Tween(fireFX)
      .delay(delay)
      .to({ width: finalSize, height: finalSize, alpha: 0, x: finalX - 25, y: finalY - 25 }, 1000)
      .easing(Easing.Quartic.Out)
      .onComplete(() => fireFX?.destroy())
      .start();
    fireFX.animationSpeed = 0.5;
    fireFX.play();
    return fireFX;
  }
}