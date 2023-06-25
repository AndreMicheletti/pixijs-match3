import { Color, Container, Text, TextStyle } from "pixi.js";
import { Manager, SCREEN_WIDTH } from "../Manager";
import ButtonComponent from "../components/ButtonComponent";
import { GameFont } from "../scripts/assetLoad";
import { IScene } from "../scripts/types";
import { GameScene } from "./GameScene";
import { Easing, Tween } from "tweedle.js";

export class LobbyScene extends Container implements IScene {
  private readonly title: Text;
  private readonly playButton: ButtonComponent;

  constructor() {
    super();
    this.title = this.makeTitle();
    this.playButton = this.makePlayButton();
    this.playButton.on('click', this.onPlayClicked, this);
  }

  public onEnter(): Promise<void> {
    return new Promise<void>((resolve) => {
      const y = this.playButton.y;
      this.title.scale.set(0);
      this.playButton.y = 1000;
      new Tween(this.playButton)
        .delay(800)
        .to({ y }, 500)
        .easing(Easing.Cubic.Out)
        .start();
      new Tween(this.title)
        .to({ scale: { x: 1, y: 1 } }, 1500)
        .easing(Easing.Elastic.Out)
        .onComplete(() => resolve())
        .start();
    });
  }

  public async onLeave(): Promise<void> {
    // Empty
  }

  public update(): void {
    // Empty
  }

  private onPlayClicked(): void {
    Manager.changeScene(new GameScene());
  }

  private makeTitle(): Text {
    const text = new Text('Zombie Match3', new TextStyle({
      fontFamily: GameFont.DirtyHarold,
      fill: ["#bc2424", "#6d0f0f"],
      fontSize: 90,
      stroke: "#450f0f",
      strokeThickness: 5,
      fontWeight: 'bold',
    }));
    text.anchor.set(0.5);
    text.x = SCREEN_WIDTH / 2;
    text.y = 100;
    this.addChild(text);
    return text;
  }

  private makePlayButton(): ButtonComponent {
    const width = 150;
    const btn = new ButtonComponent({
      text: 'PLAY',
      width,
      height: 80,
      tint: new Color('#454545'),
      hoverTint: new Color('#646464'),
      textStyle: new TextStyle({
        fontFamily: GameFont.DirtyHarold,
        fill: ["#ffe987", "#c3b54b"],
        fontSize: 45,
        stroke: "#715b02",
        strokeThickness: 5
      }),
      borders: ButtonComponent.borders(3, 3)
    });
    btn.x = SCREEN_WIDTH / 2 - width / 2;
    btn.y = 350;
    this.addChild(btn);
    return btn;
  }
}
