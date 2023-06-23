import { Point } from 'pixi.js';
import { Easing, EasingFunction, Tween } from 'tweedle.js';

import SymbolComponent from "./components/SymbolComponent";

type MoveParams = {
  duration: number;
  easing: EasingFunction;
}

export function animateSymbolToPosition(symbol: SymbolComponent, point: Point, params?: MoveParams): Promise<void> {
  const { duration, easing } = params || { duration: 500, easing: Easing.Quadratic.InOut };
  return new Promise<void>((resolve) =>
    new Tween(symbol)
      .to({ x: point.x, y: point.y }, duration)
      .easing(easing)
      .onComplete(() => resolve())
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