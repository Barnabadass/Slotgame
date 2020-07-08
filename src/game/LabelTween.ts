import SlotGame from "./RockClimber";

/**
 * This class is responsible for handling changes in numeric label text values (e.g. in prize countups)
 */
export default class LabelTween {
  private game: SlotGame;
  private labelName: string;
  private currentValue: number; 
  private endValue: number;
  private changeAmount: number; // the amount to change the label`s value by during each update cycle
  private isTerminated: boolean;
  private terminationCallback: () => void;

  constructor(game: SlotGame, name: string, startValue: number, endValue: number, changeAmount: number, terminationCallback: () => void) {
    this.game = game;
    this.labelName = name;
    this.changeAmount = changeAmount;
    this.currentValue = startValue;
    this.endValue = endValue;
    this.isTerminated = false;
    this.terminationCallback = terminationCallback;
  }

  update(): void {
    if (!this.isTerminated) {
      this.currentValue = this.currentValue + this.changeAmount;
      if (this.currentValue >= this.endValue) {
        this.currentValue = this.endValue;
        this.stop();
        // only if the label has finished its work naturally (was not interrupted by some other code)
        // the callback gets called
        this.terminationCallback();
      }
      this.game.setLabelCaption(this.labelName, this.currentValue.toFixed(0));
    }
  }

  get terminated(): boolean {
    return this.isTerminated;
  }

  stop(): void {
    this.isTerminated = true;
  }
}