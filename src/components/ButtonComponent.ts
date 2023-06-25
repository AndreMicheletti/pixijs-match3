import { Assets, Color, NineSlicePlane, Text, TextStyle, Texture } from "pixi.js";
import { GameAssets } from "../scripts/assetLoad";

export type ButtonBorders = {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}

export type ButtonStyle = {
  text: string;
  tint: Color;
  width: number;
  height: number;
  hoverTint?: Color;
  textStyle?: TextStyle;
  borders?: ButtonBorders;
}

export default class ButtonComponent extends NineSlicePlane {
  private readonly style: ButtonStyle;

  private label: Text;

  static allBorders(value: number): ButtonBorders {
    return {
      top: value,
      bottom: value,
      left: value,
      right: value,
    };
  }

  static borders(vertical: number, horizontal: number): ButtonBorders {
    return {
      top: vertical,
      bottom: vertical,
      left: horizontal,
      right: horizontal,
    };
  }

  private get normalTexture(): Texture {
    return Assets.get(GameAssets.buttonBase);
  }

  private get pressedTexture(): Texture {
    return Assets.get(GameAssets.buttonBasePressed);
  }

  constructor(style: ButtonStyle) {
    super(Assets.get(GameAssets.buttonBase), style.borders.left, style.borders.top, style.borders.right, style.borders.bottom);
    this.style = style;
    this.width = style.width;
    this.height = style.height;
    // Make Label
    this.label = new Text(style.text, style.textStyle);
    this.label.anchor.set(0.5);
    this.label.x = style.width / 2;
    this.label.y = style.height / 2;
    this.tint = style.tint;
    this.addChild(this.label);
    this.addListeners();
  }

  private addListeners(): void {
    this.on('pointerenter', this.onHover, this);
    this.on('pointerleave', this.onLeave, this);
    this.on('pointercancel', this.onLeave, this);
    this.on('pointerdown', this.onPress, this);
    this.on('pointerup', this.onRelease, this);
    this.eventMode = 'static';
  }

  private onHover(): void {
    this.tint = this.style.hoverTint;
  }

  private onLeave(): void {
    this.texture = this.normalTexture;
    this.tint = this.style.tint;
    this.scale.set(1.0);
  }

  private onPress(): void {
    this.texture = this.pressedTexture;
  }

  private onRelease(): void {
    this.texture = this.normalTexture;
    this.emit('click', null);
  }
}