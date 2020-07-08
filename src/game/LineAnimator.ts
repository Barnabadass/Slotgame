import SlotGame from "./RockClimber";
import Animation from "../controlClasses/Animation";

/**
 * This class is responsible for showing winning paylines and animating symbols if the player won a prize
 */
export default class LineAnimator {
  private game: SlotGame;
  private index: number = 0;
  private cycleCallback: (() => void) | undefined;
  private interval: number | undefined = undefined;
  private wins: {line: number, prize: number, positions: number[]}[] = [];
  constructor(game: SlotGame) {
    this.game = game;
  }

  start(callback: () => void): void {
    this.cycleCallback = callback;
    this.wins = window.client.wins;
    this.index = -1;
    this.showWin();
    this.interval = setInterval(() => this.showWin(), 3000);
  }

  /**
   * Shows one payline at a time, calls the cycle callback when the first cycle is finished
   */
  showWin(): void {
    this.index++;
    if (this.index === this.wins.length) {
      if (this.cycleCallback !== undefined) {
        this.cycleCallback();
        this.cycleCallback = undefined;
      }
      this.index = 0;
    }
    // before showing a new payline, we should stop animating the previous one
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

  /**
   * Shows the line indicators (little squares with line numbers on each side of the game reels) for the specified line
   * @param line line number 
   */
  showLinePin(line: number): void {
    this.game.getControlsByName("line_indicator_active").forEach((control: any) => {
      control.visible = control.nickname.startsWith(`${line}_line_indicator`);
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

  /**
   * Places the win effect animation and win frame above each winning symbol in the payline, shows them
   * @param positions array of winning symbol positions, starting from 0 (top-left symbol) to 14 (bottom-right one)
   */
  showWinAnimations(positions: number[]): void {
    positions.forEach((pos: number, index: number) => {
      // first, we need to get the global coordinates of the symbol to place the win effect animation and frame above it. 
      // To get it, we extract the reel index (Math.floor(pos / this.game.rows)) and row number ((pos % this.game.rows) + 1) from the symbol`s position
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

   /**
    * Stops showing winning paylines, hides all win animations and shows the active paylines` indicators
    */
   stop(): void {
     clearInterval(this.interval);
     this.interval = undefined;
     this.hideWinAnimations();
     this.hideAllLines();
     this.game.toggleActiveLines();
   }
}