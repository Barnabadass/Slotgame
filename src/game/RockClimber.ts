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
import * as particles from "pixi-particles";
import gsap, { TweenMax } from "gsap";
import PixiPlugin from "gsap/PixiPlugin";

export default class SlotGame {
  public rows: number = 3;
  public columns: number = 5;
  public numSymbols: number = 8;
  private reelMask: PIXI.Graphics;
  private resourceManager: ResourceManager;
  private defaultAutoSpinNumber: number = 50;
  private autoSpinsRemaining: number = this.defaultAutoSpinNumber;
  private availableNumLines: number[] = [1, 3, 5, 7, 9];
  private availableBets: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 50];
  private rules: Rules | null = null;
  public spinSpeed: number = 16;
  private reels: Reel[] = [];
  private state: Normal | Prize | undefined = undefined;
  private states: { [state: string]: Normal | Prize } = {};
  private isAutoSpinOn: boolean = false;
  public lineAnimator: LineAnimator;
  private labelTweens: { [name: string]: LabelTween } = {};
  private then: number = Date.now();

  constructor(resourceManager: ResourceManager) {
    this.resourceManager = resourceManager;
    this.reelMask = new PIXI.Graphics();
    this.reelMask.beginFill();
    this.reelMask.drawRect(100, 90, 930, 445);
    this.reelMask.endFill();
    this.states.normalState = new Normal(this);
    this.states.prizeState = new Prize(this);
    this.lineAnimator = new LineAnimator(this);
    gsap.registerPlugin(PixiPlugin);
    PixiPlugin.registerPIXI(PIXI);
  }

  getReelMask(): PIXI.Graphics {
    return this.reelMask;
  }

  /**
   * Tells the size of symbols (it is the actual size of textures plus a gap of a few pixels so that symbols are placed some distance apart from each other)
   */
  get symbolSize(): { width: number, height: number } {
    return { width: 151, height: 151 };
  }

  /**
   * Creates and starts a numberic value label tween (for prize countups, etc)
   * 
   * @param changeAmount - number - the amount by which the value is to be changed at each iteration
   * @param callback - the function to be called at the termination of a tween if it is not interrupted before
   */
  addLabelTween(name: string, startValue: number, endValue: number, changeAmount: number, callback: () => void): void {
    this.labelTweens[name] = new LabelTween(this, name, startValue, endValue, changeAmount, callback);
  }

  stopLabelTween(name: string): void {
    if (this.labelTweens[name] !== undefined) {
      this.labelTweens[name].stop();
      delete this.labelTweens[name];
    }
  }

  /**
   * Sets the main labels` values, sets the symbols sent by the server on the reels, starts looped background animations, sets the initial game state
   */
  init(): void {
    this.rules = new Rules(this);
    this.updateMainLabels();
    this.toggleActiveLines();
    this.reels.forEach((reel: Reel, index: number) => {
      reel.setSymbols(window.client.symbols.substring(index * this.rows, (index * this.rows) + this.rows), true);
    });
    ["char", "fire", "logo"].forEach((animName: string) => {
      let anim: Animation = <Animation>this.getControl(animName);
      anim.loop = true;
      anim.play();
    });
    this.currentState = this.states[window.client.state];
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

  /**
   * Updates the reels, label tweens and emitters
   */
  update(): void {
    // the reels` stop() method is called automatically when they are ready to stop
    if (this.reels.every((reel: Reel) => reel.readyToStop && !reel.stopping)) {
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
    const now = Date.now();
    for (let emitter in this.resourceManager.emitters) {
      this.resourceManager.emitters[emitter].update((now - this.then) * 0.001);
    }
    this.then = now;
  }

  updateMainLabels(): void {
    this.setLabelCaption("lb_auto_spin_number", this.autoSpinsRemaining);
    this.setLabelCaption("lb_balance", window.client.balance);
    this.setLabelCaption("lb_bet", window.client.bet);
    this.setLabelCaption("lb_total_bet", window.client.bet * window.client.lines);
  }

  async showMegaWin(show: boolean): Promise<void> {
    // if the prize amount is not high enough, there is nothing to show
    if (window.client.prize < (window.client.bet * window.client.lines * 20)) {
      return;
    }
    this.getControlsByName("mega_win").forEach((control: any) => control.visible = show);

    if (show) {
      let label: PIXI.Text = <PIXI.Text>this.getControl("lb_mega_win");
      let text: Control = <Control>this.getControl("mega_win_text");
      let stars: Control = <Control>this.getControl("mega_win_stars");
      label.alpha = text.alpha = stars.alpha = 1;
      
      // text and stars tween animations and coin shower particle animation start simultaneously with the prize countup 
      this.getEmitter("mega_win_coins").emit = true;
      let yoyoTween = TweenMax.fromTo([text, stars], 0.5, { pixi: { scaleX: 1, scaleY: 1 } }, { pixi: { scaleX: 1.2, scaleY: 1.2 }, yoyo: true, repeat: -1 });
      await new Promise(resolve => this.addLabelTween("lb_mega_win", 0, window.client.prize, 0.01 * Math.pow(window.client.prize, 0.9), resolve));
      // when the prize countup is finished, all other animations stop, too
      yoyoTween.kill();
      this.getEmitter("mega_win_coins").emit = false;

      // all elements of the megawin animation fade away at the end
      await TweenMax.fromTo([label, text, stars], 2, { pixi: { alpha: 1 } }, { pixi: { alpha: 0 } });
    }
  }

  /**
   * Sets the visibility of payline indicators according to the number of paylines selected by the user
   */
  toggleActiveLines(): void {
    this.getControlsByName("betlines_active").forEach((control: any) => {
      control.visible = control.nickname.includes(String(window.client.lines));
    });
    this.getControlsByName("line_indicator_active").forEach((control: any) => {
      control.visible = parseInt(control.nickname) <= window.client.lines;
    });
  }

  onAllReelsStopped(): void {
    // if the there are no more autospins left, their number is reset
    if (this.autoSpinsRemaining === 0) {
      this.autospin = false;
      this.autoSpinsRemaining = this.defaultAutoSpinNumber;
      this.setLabelCaption("lb_auto_spin_number", this.autoSpinsRemaining);
    }
    // a new state is entered
    this.currentState = this.states[window.client.state];
  }

  set currentState(nextState: Normal | Prize) {
    nextState.prevState = this.state;
    this.state = nextState;
    this.state.start();
  }

  reelsSpinning(): boolean {
    return this.reels.some((reel: Reel) => reel.spinning);
  }

  /**
   * Tells us if there is enough money to make a turn
   */
  turnAvailable(): boolean {
    return window.client.balance >= window.client.bet * window.client.lines;
  }

  /**
   * Sends client data to the server for further processing after pressing "button_spin" or "button_auto_spin"
   */
  async makeTurn(): Promise<void> {
    // if there is not enough money, autospins should stop and a new turn can`t be made
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
    // if there is some cleanup to be made, it should be done now
    if (this.state !== undefined) {
      this.state.end();
    }
    this.enableAllButtons(false);

    // subtract the total bet from the balance and update the labels 
    window.client.balance -= window.client.bet * window.client.lines;
    this.updateMainLabels();

    this.reels.forEach((reel: Reel) => reel.spin());
    // sending all relevant information to the server via a WebSocket call 
    window.ws.send(JSON.stringify({
      sessionId: window.client.sessionId,
      bet: window.client.bet,
      lines: window.client.lines,
      type: "game_turn"
    }));
  }

  /**
   * Tells the reel objects which symbols to show after they stop spinning.
   * 
   * @param symbols - string - contains all the symbols to be shown on the reels, from the top-left to the bottom-right position (e.g. "012345670123456")
   */
  setReelSymbols(symbols: string): void {
    this.reels.forEach((reel: Reel, index: number) => {
      reel.setSymbols(symbols.substring(index * this.rows, (index * this.rows) + this.rows), false);
    });
  }

  /**
   * Returns the Animation object of the symbol in the specified position
   * 
   * @param reel - number - the index of the reel on which to seek the symbol
   * @param row - number - the number of the row where the symbol is located
   */
  getSymbol(reel: number, row: number): Animation {
    // the symbols are sorted by their "y" coordinate, because their natural order get changed when reels spin
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

  /**
   * Handles most buttons` "onclick" events.
   * If event handling is different in different game states, it is delegated to the current state
   * 
   * @param nickname - string - the name of the button
   */
  onButtonClick(nickname: string): void {
    if (nickname === "button_lines") {
      if (window.client.lines === this.availableNumLines[this.availableNumLines.length - 1]) {
        window.client.lines = this.availableNumLines[0];
      } else {
        window.client.lines = this.availableNumLines[this.availableNumLines.indexOf(window.client.lines) + 1];
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
      window.client.bet = window.client.bet === this.availableBets[this.availableBets.length - 1] ? this.availableBets[0] : this.availableBets[this.availableBets.indexOf(window.client.bet) + 1];
      this.rules!.setLabelCaptions();
    } else if (nickname === "button_betmax") {
      window.client.bet = this.availableBets[this.availableBets.length - 1];
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

  getEmitter(nickname: string): particles.Emitter {
    return this.resourceManager.emitters[nickname];
  }

  /**
   * Returns an array of controls whose nicknames contain the specified string
   */
  getControlsByName(testString: string): (Animation | Button | ToggleButton | Text | PIXI.Container | Control)[] {
    let controls: (Animation | Button | ToggleButton | Text | PIXI.Container | Control)[] = [];
    for (let controlName in this.resourceManager.controls) {
      if (controlName.includes(testString)) {
        controls.push(this.resourceManager.controls[controlName]);
      }
    }
    return controls;
  }

  /**
   * Sets the "textures" array of targetAnim to that of sourceAnim.
   * Used when a control can show multiple animations.
   */
  setFramesFromAnim(targetAnim: Animation, sourceAnimNickname: string): void {
    targetAnim.textures = (<PIXI.AnimatedSprite>this.resourceManager.controls[sourceAnimNickname]).textures;
  }
}