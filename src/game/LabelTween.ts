import SlotGame from "./RockClimber";

export default class LabelTween {
  private game: SlotGame;
  private labelName: string;
  private currentValue: number;
  private endValue: number;
  private changeAmount: number;
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