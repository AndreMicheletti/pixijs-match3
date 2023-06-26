import { Color, Container, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../Manager";
import { bounceComponent, fadeComponent } from "../scripts/animationHandler";
import { GameFont } from "../scripts/assetLoad";
import ButtonComponent from "./generic/ButtonComponent";

export default class GameOver extends Container {
  private readonly blackLayer: Sprite;

  private readonly title: Text;

  private readonly message: Text;

  private readonly score: Text;

  private readonly replayButton: ButtonComponent;

  constructor(onClick: () => void) {
    super();
    this.blackLayer = this.makeBlackLayer();
    this.title = this.makeTitle();
    this.message = this.makeMessage();
    this.score = this.makeScore();
    this.replayButton = this.makeReplayButton(onClick);
    // Add components to container
    this.addChild(this.blackLayer);
    this.addChild(this.title);
    this.addChild(this.message);
    this.addChild(this.score);
    this.addChild(this.replayButton);
  }

  public show(win: boolean, score: number, duration = 1000): void {
    this.message.text = win ? 'YOU WON' : 'TIME IS OVER';
    this.score.text = `${score}`;
    this.replayButton.label.text = win ? 'NEXT STAGE' : 'TRY AGAIN';
    fadeComponent(this, duration, 1);
  }

  private makeBlackLayer(): Sprite {
    const blackLayer = new Sprite(Texture.WHITE);
    blackLayer.tint = 'black';
    blackLayer.width = SCREEN_WIDTH;
    blackLayer.height = SCREEN_HEIGHT;
    blackLayer.alpha = 0.7;
    return blackLayer;
  }

  private makeTitle(): Text {
    const title = new Text('GAME OVER', new TextStyle({
      fontFamily: GameFont.DirtyHarold,
      fill: ["#ff5a5a", "#ed1f1f"],
      fontSize: 50,
      stroke: "#5a1010",
      strokeThickness: 10,
      fontWeight: 'bold',
    }));
    title.anchor.set(0.5);
    title.x = SCREEN_WIDTH / 2;
    title.y = SCREEN_HEIGHT / 2 - 180;
    return title;
  }

  private makeMessage(): Text {
    const message = new Text('YOU WON', new TextStyle({
      fontFamily: GameFont.DirtyHarold,
      fill: ["#ff5a5a", "#ed1f1f"],
      fontSize: 90,
      stroke: "#5a1010",
      strokeThickness: 10,
      fontWeight: 'bold',
    }));
    message.anchor.set(0.5);
    message.x = SCREEN_WIDTH / 2;
    message.y = this.title.y + 70;
    bounceComponent(message, 1.05, 1000, Infinity);
    return message;
  }

  private makeScore(): Text {
    const message = new Text('', new TextStyle({
      fontFamily: GameFont.Poppins,
      fill: 'white',
      fontSize: 90,
      stroke: "black",
      strokeThickness: 5,
      fontWeight: 'bold',
    }));
    message.anchor.set(0.5);
    message.x = SCREEN_WIDTH / 2;
    message.y = SCREEN_HEIGHT / 2;
    return message;
  }

  private makeReplayButton(onClick: () => void): ButtonComponent {
    // Button
    const replayButton = new ButtonComponent({
      text: 'REPLAY',
      width: 160,
      height: 60,
      tint: new Color('#832d2d'),
      hoverTint: new Color('#a83a3a'),
      textStyle: new TextStyle({
        fontFamily: GameFont.Poppins,
        fill: "white",
        fontSize: 20,
      }),
      borders: ButtonComponent.borders(3, 3)
    });
    replayButton.x = SCREEN_WIDTH / 2 - replayButton.width / 2;
    replayButton.y = SCREEN_HEIGHT - 150;
    replayButton.on('click', onClick);
    return replayButton;
  }
}