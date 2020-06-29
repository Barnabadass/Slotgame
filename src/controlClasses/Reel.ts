import * as PIXI from "pixi.js";
import SlotGame from "../game/RockClimber";
import Animation from "./Animation";

export default class Reel extends PIXI.Container {
  private game: SlotGame;
  private numSyms: number;
  private isSpinning: boolean = false;
  private numSymsToPassBy: number = 30;
  private numSymsPassed: number = 0;

  constructor(game: SlotGame) {
    super();
    this.game = game;
    this.numSyms = this.game.clientInfo.rows;
    this.mask = this.game.getReelMask();
  }

  setSymbols(reelSymbols: string): void {
    const numSymbols = this.game.clientInfo.numSymbols;

    for (let y = 0; y <= this.numSyms; y++) {
      let sym: Animation = <Animation>this.children[y];
      if (y === 0) {
        let randomNum = Math.floor(Math.random() * numSymbols);
        this.game.setFramesFromAnim(sym, `s_${randomNum}`);
      } else {
        this.game.setFramesFromAnim(sym, `s_${reelSymbols[y - 1]}`);
      }
    } 
  }

  update(): void {
    if (this.isSpinning) {
      (<Animation[]>this.children).forEach((sym: Animation) => {
        if (sym.y >= this.game.symbolSize.height * this.numSyms) {
          this.numSymsPassed++;
          sym.y = -this.game.symbolSize.height;
        } 
        sym.y = sym.y + this.game.spinSpeed;
      }); 
    }
  }

  spin() {
    this.isSpinning = true;
  }
}