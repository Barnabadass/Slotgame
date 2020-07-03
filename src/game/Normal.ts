import SlotGame from "./RockClimber";
import Prize from "./Prize";

export default class Normal {
  game: SlotGame;
  public prevState: Normal | Prize | undefined = undefined;

  constructor(game: SlotGame) {
    this.game = game;
  }

  start(): void {
    if (this.game.autospin) {
      this.game.enableButton("button_auto_spin", true);
      setTimeout(() => {
        if (this.game.autospin && !this.game.reelsSpinning()) {
          this.game.makeTurn();
        }
      }, 1500);
    } else {
      this.game.enableAllButtons(true);
    }
  }

  onButtonClick(nickname: string): void {
    if (nickname === "button_spin") {
      this.game.makeTurn();
    } else if (nickname === "button_auto_spin") {
      this.game.autospin = !this.game.autospin;
      if (this.game.autospin) {
        this.game.makeTurn();
      } else {
        this.game.enableAllButtons(true);
      }
    }
  }

  end(): void {

  }
}