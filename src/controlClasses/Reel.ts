import * as PIXI from "pixi.js";
import SlotGame from "../game/RockClimber";
import Animation from "./Animation";

export default class Reel extends PIXI.Container {
  private game: SlotGame;
  private isSpinning: boolean = false;
  private numSymsToPassBy: number = 18;
  private numSymsPassed: number = 0;
  private isReadyToStop: boolean = false;
  private symbolsToShow: number[] = [];
  private stopping: boolean = false;
  public reelNumber: number = 0;

  constructor(game: SlotGame) {
    super();
    this.game = game;
    this.mask = this.game.getReelMask();
  }

  setSymbols(symbols: string, force: boolean): void {
    this.symbolsToShow = symbols.split("").map((sym: string) => parseInt(sym));
    if (force) {
      for (let y = 0; y <= this.game.rows; y++) {
        let sym: Animation = <Animation>this.children[y];
        let symToShow: number;
        if (y === 0) {
          symToShow = Math.floor(Math.random() * this.game.clientInfo.numSymbols);
        } else {
          symToShow = this.symbolsToShow[y - 1];
        }
        this.game.setFramesFromAnim(sym, `s_${symToShow}`);
        sym.symbol = symToShow;
      }
    }
  }

  setSymbol(sym: Animation): void {
    let symToShow: number;
    if (this.stopping && this.symbolsToShow.length !== 0) {
      symToShow = this.symbolsToShow.pop()!;
    } else {
      symToShow = Math.floor(Math.random() * this.game.clientInfo.numSymbols);
    }
    let sourceAnimNickname = this.isSpinning ? `s_${symToShow}_blurred`: `s_${symToShow}`;
    this.game.setFramesFromAnim(sym, sourceAnimNickname);
    sym.symbol = symToShow;
  }

  get readyToStop(): boolean {
    return this.isReadyToStop;
  }

  get isStopping(): boolean {
    return this.stopping;
  }

  get spinning(): boolean {
    return this.isSpinning;
  }

  update(): void {
    if (this.isSpinning) {
      (<Animation[]>this.children).forEach((sym: Animation) => {          
        sym.y += this.game.spinSpeed;
        if (this.numSymsPassed >= this.numSymsToPassBy) {
          this.isReadyToStop = true;
        }
        if (sym.y >= this.game.symbolSize.height * this.game.rows) {
          this.numSymsPassed++;
          if (this.stopping && this.symbolsToShow.length === 0) {
            this.stopping = false;
            this.isSpinning = false;
            this.isReadyToStop = false;
            this.numSymsPassed = 0;
          }
          sym.y -= this.game.symbolSize.height * this.children.length;
          this.setSymbol(sym);
          if (!this.isSpinning) {
            let offset = sym.y - -151;
            (<Animation[]>this.children).forEach((sym: Animation) => {
              sym.y += offset > 0 ?  -offset : offset;
            });
            for (let y = 0; y <= this.game.rows; y++) {
              let sym: Animation = <Animation>this.children[y];
              this.game.setFramesFromAnim(sym, `s_${sym.symbol}_blurred_to_normal`);
              sym.play();
              sym.loop = false;
            } 
            if (this.reelNumber === this.game.columns) {
              this.game.onAllReelsStopped();
            }
          } 
        }
      });
    }
  }

  spin(): void {
    this.isSpinning = true;
    for (let y = 0; y <= this.game.rows; y++) {
      let sym: Animation = <Animation>this.children[y];
      this.game.setFramesFromAnim(sym, `s_${sym.symbol}_normal_to_blurred`);
      sym.play();
    }
  }

  stop(): void {
    this.stopping = true;
  }
}