import SlotGame from "./RockClimber";
import Animation from "../controlClasses/Animation";

export default class LineAnimator {
  private game: SlotGame;
  private index: number = 0;
  private cycleCallback: (() => void) | undefined;
  private interval: number | undefined = undefined;
  private wins: any[] = [];
  constructor(game: SlotGame) {
    this.game = game;
  }

  start(callback: () => void): void {
    this.cycleCallback = callback;
    this.wins = this.game.clientInfo.wins;
    this.index = -1;
    this.showWin();
    this.interval = setInterval(() => this.showWin(), 3000);
  }

  showWin(): void {
    this.index++;
    if (this.index == this.wins.length) {
      if (this.cycleCallback !== undefined) {
        this.cycleCallback();
        this.cycleCallback = undefined;
      }
      this.index = 0;
    }
    this.hideWinAnimations();
    this.showWinAnimations(this.wins[this.index].positions);
    this.showLine(this.wins[this.index].line);
    this.showLinePin(this.wins[this.index].line);
  }

  showLine(line: number): void {
    this.game.getControlsByName("payline").forEach((control: any) => {
      control.visible = control.nickname === `payline_${line}`;
    });
  }

  hideAllLines(): void {
    this.game.getControlsByName("payline").forEach((control: any) => {
      control.visible = false;
    });
  }

  showLinePin(line: number): void {
    this.game.getControlsByName("line_pin_active").forEach((control: any) => {
      control.visible = control.nickname.startsWith(`${line}_line_pin`);
    });
  }

  hideWinAnimations(): void {
    this.game.getControlsByName("win_effect").forEach((anim: any) => {
      anim.gotoAndStop(0);
      anim.visible = false;
    });
    this.game.getControlsByName("win_frame").forEach((control: any) => {
      control.visible = false;
    });
  }

  showWinAnimations(positions: number[]): void {
    positions.forEach((pos: number, index: number) => {
      let symPos: PIXI.Point = this.game.getSymbol(Math.floor(pos / this.game.rows), (pos % this.game.rows) + 1).getGlobalPosition();
      let winEffect: Animation = <Animation>this.game.getControl(`win_effect_${index + 1}`);
      winEffect.position.set(symPos.x, symPos.y);
      winEffect.visible = true;
      winEffect.play();
      let frame = this.game.getControl(`win_frame_${index + 1}`);
      frame.position.set(symPos.x, symPos.y);
      frame.visible = true;
    });
   } 

   stop(): void {
     clearInterval(this.interval);
     this.interval = undefined;
     this.hideWinAnimations();
     this.hideAllLines();
     this.game.toggleActiveLines();
   }
}