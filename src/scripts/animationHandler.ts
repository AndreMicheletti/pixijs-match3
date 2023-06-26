import { Container, DisplayObject, IPointData, Point, Text } from 'pixi.js';
import { Easing, EasingFunction, Group, Tween } from 'tweedle.js';

import FireFXComponent from '../components/generic/FireFXComponent';
import SymbolComponent from "../components/generic/SymbolComponent";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../Manager';

export const BoardGroup = new Group();

export const UIGroup = new Group();

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

export function animateScoreFeedback(
  text: Text,
  score: number,
  point: Point,
  delay: number,
  onReach?: () => void
): Promise<void> {
  const { x, y } = point;
  const middle = text.parent.toLocal(new Point((SCREEN_WIDTH / 2) - text.width / 2, (SCREEN_HEIGHT / 2) - text.height / 2));
  const targetScale = score > 20 ? 2.5 : 2;
  return new Promise<void>((resolve) => {
    text.scale.set(0.5, 0.5);
    text.alpha = 0.5;
    const goToCenter = new Tween(text)
      .to({ x: middle.x, y: middle.y, scale: { x: targetScale, y: targetScale }, alpha: 1 }, 200)
      .easing(Easing.Sinusoidal.InOut);
    const disappear = new Tween(text)
      .to({ scale: { x: 3, y: 3 }, alpha: 0 }, 200)
      .easing(Easing.Cubic.Out)
      .onComplete(() => resolve());
    const move = new Tween(text)
      .delay(250)
      .to({ x, y, scale: { x: 1, y: 1 } }, 500)
      .easing(Easing.Quadratic.In)
      .chain(disappear)
      .onComplete(onReach);
    setTimeout(() => goToCenter.chain(move).start(), delay);
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

export async function bounceComponent(
  object: DisplayObject,
  scale: number | IPointData,
  duration: number,
  repeat = 1,
  group = Group.shared,
): Promise<void> {
  const x = typeof scale === 'number' ? scale : scale.x;
  const y = typeof scale === 'number' ? scale : scale.y;
  new Tween(object, group)
    .to({ scale: { x, y } }, duration)
    .easing(Easing.Cubic.InOut)
    .yoyo(true)
    .repeat(repeat)
    .start();
}