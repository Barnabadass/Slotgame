import * as PIXI from "pixi.js";
import SlotGame from "../game/RockClimber";
import Animation from "./Animation";

export default class Reel extends PIXI.Container {
  private game: SlotGame;
  private isSpinning: boolean = false;
  private numSymsToPassBy: number = 18; // the number of symbols that should pass down when spinning before the reel is ready to stop
  private numSymsPassed: number = 0; // the number of symbols that have already passed down
  private isReadyToStop: boolean = false;
  private symbolsToShow: number[] = []; // the symbols received from the server that remain to be shown (when the reel stops)
  private isStopping: boolean = false;
  public reelNumber: number = 0; 

  constructor(game: SlotGame) {
    super();
    this.game = game;
    this.mask = this.game.getReelMask();
  }

  /**
   * Fills the symbolsToShow array with symbols received from the server and shows them on the screen if necessary
   * 
   * @param symbols - string - part of the data sent by the server containing the symbols for this reel
   * @param force - boolean - whether the symbols should be shown right now or later, when the reel stops
   */
  setSymbols(symbols: string, force: boolean): void {
    this.symbolsToShow = symbols.split("").map((sym: string) => parseInt(sym));
    if (force) {
      for (let y = 0; y <= this.game.rows; y++) {
        let sym: Animation = <Animation>this.children[y];
        let symToShow: number;
        // the reels actually contain one more symbol than there are rows on the screen, so the top symbol 
        // is always a random one (as it is not seen by the player, unless the reel is spinning)
        if (y === 0) {
          symToShow = Math.floor(Math.random() * this.game.numSymbols);
        } else {
          symToShow = this.symbolsToShow[y - 1];
        }
        this.game.setFramesFromAnim(sym, `s_${symToShow}`);
        sym.symbol = symToShow;
      }
    }
  }

  /**
   * Sets the appropriate animation for the topmost symbol (used when the reel is spinning)
   */
  setSymbol(sym: Animation): void {
    let symToShow: number;
    // if the reel is stopping and not all of the symbols received from the server are shown, we need to show the last one (the bottom one)
    // and update the array of the symbols that remain to be shown
    if (this.stopping && this.symbolsToShow.length !== 0) {
      symToShow = this.symbolsToShow.pop()!;
    } else {
      // otherwise, we show a random symbol
      symToShow = Math.floor(Math.random() * this.game.numSymbols);
    }
    let sourceAnimNickname = this.isSpinning ? `s_${symToShow}_blurred`: `s_${symToShow}`;
    this.game.setFramesFromAnim(sym, sourceAnimNickname);
    sym.symbol = symToShow;
  }

  get readyToStop(): boolean {
    return this.isReadyToStop;
  }

  get stopping(): boolean {
    return this.isStopping;
  }

  get spinning(): boolean {
    return this.isSpinning;
  }

  update(): void {
    if (this.isSpinning) {
      (<Animation[]>this.children).forEach((sym: Animation) => {          
        sym.y += this.game.spinSpeed;
        // if the reel has spun long enough, it is ready to stop
        if (this.numSymsPassed >= this.numSymsToPassBy) {
          this.isReadyToStop = true;
        }
        // actions that should be taken if a symbol has disappeared out of sight
        if (sym.y >= this.game.symbolSize.height * this.children.length) {
          this.numSymsPassed++;
          // if all the symbols received from the server have been shown, the reel must be stopped
          if (this.stopping && this.symbolsToShow.length === 0) {
            this.isStopping = false;
            this.isSpinning = false;
            this.isReadyToStop = false;
            this.numSymsPassed = 0;
          }
          // the disappeared symbol returns to the topmost position and its animation should be reset
          sym.y -= this.game.symbolSize.height * this.children.length;
          this.setSymbol(sym);
          if (!this.isSpinning) {
            // if the reel has stopped, we need to align all symbols vertically
            let diffY = sym.y;
            (<Animation[]>this.children).forEach((sym: Animation) => {
              sym.y += diffY > 0 ?  -diffY : diffY;
            });
            // also we need to change their animation to show the transition from the blurred state to normal
            for (let y = 0; y <= this.game.rows; y++) {
              let sym: Animation = <Animation>this.children[y];
              this.game.setFramesFromAnim(sym, `s_${sym.symbol}_blurred_to_normal`);
              sym.play();
              sym.loop = false;
            } 
            // if the last reel has stopped, the game should be notified of this to enter a new state and take other actions
            if (this.reelNumber === this.game.columns) {
              setTimeout(() => this.game.onAllReelsStopped(), 200);
            }
          } 
        }
      });
    }
  }

  spin(): void {
    this.isSpinning = true;
    // the symbols should show that the reel is spinning by changing their animation
    for (let y = 0; y <= this.game.rows; y++) {
      let sym: Animation = <Animation>this.children[y];
      this.game.setFramesFromAnim(sym, `s_${sym.symbol}_normal_to_blurred`);
      sym.play();
    }
  }

  stop(): void {
    this.isStopping = true;
  }
}