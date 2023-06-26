import { Color, Container, Text, TextStyle } from "pixi.js";
import { Manager, SCREEN_WIDTH } from "../Manager";
import ButtonComponent from "../components/generic/ButtonComponent";
import { GameFont } from "../scripts/assetLoad";
import { GameRules, IScene } from "../scripts/types";
import { GameScene } from "./GameScene";
import { Easing, Tween } from "tweedle.js";
import { bounceComponentForever } from "../scripts/animationHandler";

export class LobbyScene extends Container implements IScene {
  private readonly title: Text;
  private readonly playButton: ButtonComponent;
  private readonly initialRules: GameRules = {
    limitScore: 5,
    limitTime: 60,
  };

  constructor() {
    super();
    this.title = this.makeTitle();
    this.playButton = this.makePlayButton();
    this.playButton.on('click', this.onPlayClicked, this);
  }

  public async onEnter(): Promise<void> {
    await this.playIntroTween();
    bounceComponentForever(this.title);
  }

  public async onLeave(): Promise<void> {
    // Empty
  }

  public update(): void {
    // Empty
  }

  private onPlayClicked(): void {
    Manager.changeScene(new GameScene(this.initialRules));
  }

  private playIntroTween(): Promise<void> {
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
    const btn = new ButtonComponent({
      text: 'PLAY',
      width: 130,
      height: 60,
      tint: new Color('#FFFFFF'),
      hoverTint: new Color('#dcdcdc'),
      textStyle: new TextStyle({
        fontFamily: GameFont.Poppins,
        fill: "#000000",
        fontSize: 20,
      }),
      borders: ButtonComponent.borders(3, 3)
    });
    btn.x = SCREEN_WIDTH / 2 - btn.width / 2;
    btn.y = 350;
    this.addChild(btn);
    return btn;
  }
}
