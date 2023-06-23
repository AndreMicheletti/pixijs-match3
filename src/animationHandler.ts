import { Point } from 'pixi.js';
import { Easing, EasingFunction, Tween } from 'tweedle.js';

import SymbolComponent from "./components/SymbolComponent";

type MoveParams = {
  duration?: number;
  delay?: number;
  easing?: EasingFunction;
}

const DefaultMoveParam = { duration: 500, delay: 0, easing: Easing.Quadratic.InOut };

export function animateSymbolToPosition(symbol: SymbolComponent, position: Point, params?: MoveParams): Promise<void> {
  const { duration, delay, easing  } = { ...DefaultMoveParam, ...params };
  return new Promise<void>((resolve) =>
    new Tween(symbol)
      .to({ x: position.x, y: position.y }, duration)
      .easing(easing)
      .onComplete(() => setTimeout(resolve, delay))
      .start()
  );
}

export async function animateSymbolSwap(origin: SymbolComponent, target: SymbolComponent): Promise<void> {
  const originPoint = new Point(origin.x, origin.y);
  const targetPoint = new Point(target.x, target.y);
  await Promise.all([
    animateSymbolToPosition(origin, targetPoint),
    animateSymbolToPosition(target, originPoint),
  ]);
}

export function animateSymbolExplode(symbol: SymbolComponent): Promise<void> {
  return new Promise<void>((resolve) =>
    new Tween(symbol)
      .to({ scale: 4, alpha: 0 }, 1500)
      .easing(Easing.Quadratic.Out)
      .onComplete(() => resolve())
      .start()
  );
}