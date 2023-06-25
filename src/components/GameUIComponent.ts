import { Container, Text, TextStyle } from "pixi.js";
import { SCREEN_WIDTH } from "../Manager";
import { GameFont } from "../scripts/assetLoad";

export default class GameUI extends Container {
  public readonly scoreValueLabel: Text;
  
  private readonly scoreLabel: Text;
  private readonly timerLabel: Text;
  private readonly timerValueLabel: Text;

  private onTimeEnd: () => void;

  private _score = 0;

  private _time = 0;

  public get score(): number {
    return this._score;
  }

  public set score(val: number) {
    this._score = val;
    this.scoreValueLabel.text = `${val}`;
  }

  public get time(): number {
    return this._time;
  }

  public set time(val: number) {
    this._time = val;
    if (val <= 0) {
      this.onTimeEnd();
      this._time = 0;
    }
    const minutes = Math.floor(this._time / 60).toString().padStart(2, '0');
    const seconds = Math.floor(this._time % 60).toString().padStart(2, '0');
    this.timerValueLabel.text = `${minutes}:${seconds}`;
  }

  /**
   * Creates the Game UI
   * @param startingTime time in seconds
   */
  constructor(startingTime: number, onTimeEnd: () => void) {
    super();
    this._time = startingTime;
    this.onTimeEnd = onTimeEnd;
    this.scoreLabel = this.makeScoreLabel('SCORE', 22, 15);
    this.scoreValueLabel = this.makeScoreLabel('0', 40, 40);
    this.timerLabel = this.makeScoreLabel('TIME', 22, 120);
    this.timerValueLabel = this.makeScoreLabel('00:00', 40, 145);
  }

  private makeScoreLabel(content: string, fontSize: number, y: number): Text {
    const text = new Text(content, new TextStyle({
      fontFamily: GameFont.Poppins,
      fill: 'white',
      stroke: 'black',
      strokeThickness: 5,
      fontSize,
    }));
    text.x = SCREEN_WIDTH - 135;
    text.y = y;
    this.addChild(text);
    return text;
  }
}