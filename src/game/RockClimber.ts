import axios, { AxiosResponse } from "axios";
import ResourceManager from "../main";
import * as PIXI from "pixi.js";
import ToggleButton from "../controlClasses/ToggleButton";
import Button from "../controlClasses/Button";
import Control from "../controlClasses/Control";
import Animation from "../controlClasses/Animation";
import Rules from "./Rules";
import Reel from "../controlClasses/Reel";
import Prize from "./Prize";
import Normal from "./Normal";
import LineAnimator from "./LineAnimator";
import LabelTween from "./LabelTween";

export default class SlotGame {
  public clientInfo: any;
  public rows: number = 3;
  public columns: number = 5;
  private reelMask: PIXI.Graphics;
  private resourceManager: ResourceManager;
  private defaultAutoSpinNumber: number = 50;
  private autoSpinsRemaining: number = this.defaultAutoSpinNumber;
  private availableNumLines: number[] = [1, 3, 5, 7, 9];
  private availableBets: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 50];
  private rules: Rules | null = null;
  public spinSpeed: number = 14;
  private reels: Reel[] = [];
  private state: Normal | Prize | undefined = undefined;
  private states: { [state: string]: Normal | Prize } = {};
  private isAutoSpinOn: boolean = false;
  public lineAnimator: LineAnimator;
  private labelTweens: { [name: string]: LabelTween } = {};

  constructor(resourceManager: ResourceManager) {
    this.resourceManager = resourceManager;
    this.reelMask = new PIXI.Graphics();
    this.reelMask.beginFill();
    this.reelMask.drawRect(100, 90, 930, 445);
    this.reelMask.endFill();
    this.states.normalState = new Normal(this);
    this.states.prizeState = new Prize(this);
    this.lineAnimator = new LineAnimator(this);
  }

  getReelMask(): PIXI.Graphics {
    return this.reelMask;
  }

  get symbolSize(): { width: number, height: number } {
    return { width: 151, height: 151 };
  }

  async getClientInfo(): Promise<void> {
    const firstResponse: AxiosResponse = await axios.post("http://localhost:3000/start-session", { sessionId: localStorage.getItem("sessionId") });
    this.clientInfo = firstResponse.data;
    if (localStorage.getItem("sessionId") === null) {
      localStorage.setItem("sessionId", this.clientInfo.id);
    }
  }

  addTween(name: string, startValue: number, endValue: number, changeAmount: number, callback: () => void): void {
    this.labelTweens[name] = new LabelTween(this, name, startValue, endValue, changeAmount, callback);
  }

  stopTween(name: string): void {
    if (this.labelTweens[name] !== undefined) {
      this.labelTweens[name].stop();
      delete this.labelTweens[name];
    }
  }

  init(): void {
    console.log(this.clientInfo);
    this.rules = new Rules(this);
    this.updateMainLabels();
    this.toggleActiveLines();
    this.reels.forEach((reel: Reel, index: number) => {
      reel.setSymbols(this.clientInfo.symbols.substring(index * this.rows, (index * this.rows) + this.rows), true);
    });
    let char: Animation = <Animation>this.getControl("char");
    char.loop = true;
    char.play();
    this.currentState = this.states[this.clientInfo.state];
  }

  get autospin(): boolean {
    return this.isAutoSpinOn;
  }

  set autospin(val: boolean) {
    this.isAutoSpinOn = val;
    (<ToggleButton>this.getControl("button_auto_spin")).pressed = val;
  }

  setReels(reels: Reel[]): void {
    this.reels = reels;
  }

  update(): void {
    if (this.reels.every((reel: Reel) => reel.readyToStop && !reel.isStopping)) {
      this.reels.forEach((reel: Reel, index: number) => {
        setTimeout(() => reel.stop(), 250 * index);
      });
    }
    this.reels.forEach((reel: Reel, index: number) => {
      reel.update();
    });
    for (let tween in this.labelTweens) {
      this.labelTweens[tween].update();
      if (this.labelTweens[tween].terminated) {
        delete this.labelTweens[tween];
      }
    }
  }

  updateMainLabels(): void {
    this.setLabelCaption("lb_auto_spin_number", this.autoSpinsRemaining);
    this.setLabelCaption("lb_balance", this.clientInfo.balance);
    this.setLabelCaption("lb_bet", this.clientInfo.bet);
    this.setLabelCaption("lb_total_bet", this.clientInfo.bet * this.clientInfo.lines);
  }

  toggleActiveLines(): void {
    this.getControlsByName("betlines_active").forEach((control: any) => {
      control.visible = control.nickname.includes(String(this.clientInfo.lines));
    });
    this.getControlsByName("line_pin_active").forEach((control: any) => {
      control.visible = parseInt(control.nickname) <= this.clientInfo.lines;
    });
  }

  onAllReelsStopped(): void {
    if (this.autoSpinsRemaining === 0) {
      this.autospin = false;
      this.autoSpinsRemaining = this.defaultAutoSpinNumber;
      this.setLabelCaption("lb_auto_spin_number", this.autoSpinsRemaining);
    }
    this.currentState = this.states[this.clientInfo.state];
  }

  set currentState(nextState: Normal | Prize) {
    nextState.prevState = this.state;
    this.state = nextState;
    this.state.start();
  }

  reelsSpinning(): boolean {
    return this.reels.some((reel: Reel) => {
      reel.spinning;
    });
  }

  turnAvailable(): boolean {
    return this.clientInfo.balance >= this.clientInfo.bet * this.clientInfo.lines;
  }

  async makeTurn(): Promise<void> {
    if (!this.turnAvailable()) {
      if (this.autospin) {
        this.autospin = false;
        this.enableAllButtons(true);
      }
      return;
    }

    if (this.autospin) {
      if (this.autoSpinsRemaining > 0) {
        this.autoSpinsRemaining--;
      } else {
        this.autospin = false;
        this.autoSpinsRemaining = this.defaultAutoSpinNumber;
      }
    }
    if (this.state !== undefined) {
      this.state.end();
    }
    this.enableAllButtons(false);

    this.clientInfo.balance -= this.clientInfo.bet * this.clientInfo.lines;
    this.updateMainLabels();
    this.reels.forEach((reel: Reel) => {
      reel.spin();
    });
    let turnData = {
      sessionId: this.clientInfo.id,
      bet: this.clientInfo.bet,
      lines: this.clientInfo.lines
    };
    const response: AxiosResponse = await axios.post("http://localhost:3000/game-turn", turnData);
    console.log(response.data);
    this.clientInfo.symbols = response.data.symbols;
    this.clientInfo.state = response.data.state;
    this.clientInfo.prize = response.data.prize;
    this.clientInfo.wins = response.data.wins;
    this.reels.forEach((reel: Reel, index: number) => {
      reel.setSymbols(this.clientInfo.symbols.substring(index * this.rows, (index * this.rows) + this.rows), false);
    });
  }

  getSymbol(reel: number, row: number): Animation {
    return <Animation>this.reels[reel].children.slice(0).sort((a, b) => a.y - b.y)[row];
  }

  enableAllButtons(enable: boolean): void {
    this.getControlsByName("button_").forEach((control) => {
      (<Button>control).disabled = !enable;
    });
  }

  enableButton(nickname: string, enable: boolean): void {
    (<Button>this.getControl(nickname)).disabled = !enable;
  }

  onButtonClick(nickname: string): void {
    if (nickname === "button_lines") {
      if (this.clientInfo.lines === this.availableNumLines[this.availableNumLines.length - 1]) {
        this.clientInfo.lines = this.availableNumLines[0];
      } else {
        this.clientInfo.lines = this.availableNumLines[this.availableNumLines.indexOf(this.clientInfo.lines) + 1];
      }
      this.toggleActiveLines();
    } else if (nickname === "button_info") {
      this.enableAllButtons(false);
      this.enableButton("button_close_info", true);
      this.getControl("rules").visible = true;
    } else if (nickname === "button_close_info") {
      this.enableAllButtons(true);
      this.getControl("rules").visible = false;
    } else if (nickname === "button_betone") {
      this.clientInfo.bet = this.clientInfo.bet === this.availableBets[this.availableBets.length - 1] ? this.availableBets[0] : this.availableBets[this.availableBets.indexOf(this.clientInfo.bet) + 1];
      this.rules!.setLabelCaptions();
    } else if (nickname === "button_betmax") {
      this.clientInfo.bet = this.availableBets[this.availableBets.length - 1];
      this.rules!.setLabelCaptions();
    } else {
      this.state!.onButtonClick(nickname);
    }
    this.updateMainLabels();
  }

  setLabelCaption(labelName: string, caption: string | number): void {
    (<PIXI.Text>this.resourceManager.controls[labelName]).text = caption.toString();
  }

  getControl(nickname: string): Animation | Button | ToggleButton | PIXI.Text | PIXI.Container | Control {
    return this.resourceManager.controls[nickname];
  }

  getControlsByName(testString: string): (Animation | Button | ToggleButton | Text | PIXI.Container | Control)[] {
    let controls: (Animation | Button | ToggleButton | Text | PIXI.Container | Control)[] = [];
    for (let controlName in this.resourceManager.controls) {
      if (controlName.includes(testString)) {
        controls.push(this.resourceManager.controls[controlName]);
      }
    }
    return controls;
  }

  setFramesFromAnim(targetAnim: Animation, sourceAnimNickname: string): void {
    targetAnim.textures = (<PIXI.AnimatedSprite>this.resourceManager.controls[sourceAnimNickname]).textures;
  }
}