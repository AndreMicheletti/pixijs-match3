import { Container, DisplayObject, Point, Text } from 'pixi.js';
import { Easing, EasingFunction, Group, Tween } from 'tweedle.js';

import FireFXComponent from '../components/generic/FireFXComponent';
import SymbolComponent from "../components/generic/SymbolComponent";

export const BoardGroup = new Group();

type MoveParams = {
  duration?: number;
  delay?: number;
  easing?: EasingFunction;
}

const DefaultMoveParam = { duration: 250, delay: 0, easing: Easing.Quadratic.InOut };

export function animateSymbolToPosition(symbol: SymbolComponent, position: Point, params?: MoveParams): Promise<void> {
  const { duration, delay, easing } = { ...DefaultMoveParam, ...params };
  return new Promise<void>((resolve) => {
    symbol.alpha = 1;
    new Tween(symbol)
      .to({ x: position.x, y: position.y }, duration)
      .easing(easing)
      .onComplete(() => setTimeout(resolve, delay))
      .start()
  });
}

export async function animateSymbolSwap(origin: SymbolComponent, target: SymbolComponent, params?: MoveParams): Promise<void> {
  const originPoint = new Point(origin.x, origin.y);
  const targetPoint = new Point(target.x, target.y);
  await Promise.all([
    animateSymbolToPosition(origin, targetPoint, params),
    animateSymbolToPosition(target, originPoint, params),
  ]);
}

export function animateSymbolExplode(symbol: SymbolComponent): Promise<void> {
  FireFXComponent.spawnFireFX(new Point(symbol.x, symbol.y), symbol.parent);
  return new Promise<void>((resolve) =>
    new Tween(symbol)
      .to({ scale: 4, alpha: 0 }, 800)
      .easing(Easing.Quadratic.Out)
      .onComplete(() => resolve())
      .start()
  );
}

export function animateScoreFeedback(text: Text, score: number, { x, y }: Point, onReach?: () => void): Promise<void> {
  const targetScale = score > 20 ? 1.5 : 1;
  return new Promise<void>((resolve) => {
    text.scale.set(0, 0);
    const appear = new Tween(text)
      .to({ scale: { x: targetScale, y: targetScale } }, 500)
      .easing(Easing.Elastic.Out);
    const disappear = new Tween(text)
      .to({ scale: { x: 3, y: 3 }, alpha: 0 }, 200)
      .easing(Easing.Cubic.Out)
      .onComplete(() => resolve());
    const move = new Tween(text)
      .to({ x, y }, 500)
      .easing(Easing.Quadratic.In)
      .chain(disappear)
      .onComplete(onReach);
    appear.chain(move).start();
  });
}

export function animateBoardImpact(container: Container, delay: number, force = 10): Promise<void> {
  const initialY = container.y;
  BoardGroup.removeAll();
  return new Promise<void>((resolve) => {
    const down = new Tween(container, BoardGroup)
      .delay(delay)
      .to({ y: initialY + force }, 100)
      .easing(Easing.Quadratic.Out);
    const up = new Tween(container, BoardGroup)
      .to({ y: initialY }, 100)
      .easing(Easing.Quadratic.Out)
      .onComplete(() => resolve());
    down.chain(up).start();
  });
}

export function fadeComponent(object: DisplayObject, duration: number, alpha = 1): Promise<void> {
  return new Promise<void>((resolve) =>
    new Tween(object)
      .to({ alpha }, duration)
      .onComplete(() => resolve())
      .start()
  );
}

export function bounceComponentForever(object: DisplayObject): void {
  new Tween(object)
    .to({ scale: { x: 1.05, y: 1.05 } }, 1000)
    .easing(Easing.Cubic.InOut)
    .yoyo(true)
    .repeat(Infinity)
    .start();
}