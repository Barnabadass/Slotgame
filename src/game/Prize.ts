
import Normal from "./Normal";
import Animation from "../controlClasses/Animation";

export default class Prize extends Normal {
  private prizeShown: boolean = false;
  private skipResolve: (() => void) | undefined;

  start(): void {
    if (this.prevState === undefined) {
      this.game.clientInfo.balance -= this.game.clientInfo.prize;
      this.game.setLabelCaption("lb_balance", this.game.clientInfo.balance);
    }
    this.prizeShown = false;
    this.game.enableAllButtons(false);
    this.game.enableButton("button_spin", true);
    if (this.game.autospin) {
      this.game.enableButton("button_auto_spin", true);
    }
    this.showWinScreen(true);
    this.showPrize()
      .then(() => {
        if (!this.prizeShown) {
          this.takeWin();
        }
        if (this.game.autospin) {
          setTimeout(() => {
            if (this.game.autospin && !this.game.reelsSpinning()) {
              this.game.makeTurn();
            }
          }, 1500);
        }
      });
  }

  async showPrize(): Promise<void> {
    await Promise.race([
      Promise.all([
        this.lineAnimatorPromise(),
        this.showPrizeCountup()
      ]),
      new Promise<void>(resolve => this.skipResolve = resolve)
    ]);
  }

  async showPrizeCountup(): Promise<void> {
    return new Promise(resolve => this.game.addTween("lb_win", 0, this.game.clientInfo.prize, 0.01 * Math.pow(this.game.clientInfo.prize, 0.9), resolve));
  }

  lineAnimatorPromise(): Promise<void> {
    return new Promise(resolve => this.game.lineAnimator.start(resolve));
  }

  showWinScreen(show: boolean): void {
    this.game.getControl("win_labels_container").visible = show;
    if (show) {
      (<Animation>this.game.getControl("win_screen")).play();
      this.game.setLabelCaption("lb_win", this.game.clientInfo.prize);
    } else {
      (<Animation>this.game.getControl("win_screen")).stop();
    }
  }

  takeWin(): void {
    if (this.skipResolve !== undefined) {
      this.skipResolve();
    }
    this.prizeShown = true;
    this.game.stopTween("lb_win");
    this.game.setLabelCaption("lb_win", this.game.clientInfo.prize);
    this.game.clientInfo.balance += this.game.clientInfo.prize;
    this.game.updateMainLabels();
    this.game.lineAnimator.stop();
    if (!this.game.autospin) {
      this.game.enableAllButtons(true);
    } else {
      this.game.enableButton("button_spin", false);
    }
  }

  onButtonClick(nickname: string): void {
    if (nickname === "button_spin") {
      if (!this.prizeShown) {
        this.takeWin();
      } else {
        this.game.makeTurn();
      }
    } else if (nickname === "button_auto_spin") {
      this.game.autospin = !this.game.autospin;
      if (this.game.autospin) {
        if (this.prizeShown) {
          this.game.makeTurn();
        }
      } else {
        if (this.prizeShown) {
          this.game.enableAllButtons(true);
        } else {
          this.game.enableButton("button_auto_spin", false);
        }
      }
    }
  }

  end(): void {
    this.showWinScreen(false);
    this.skipResolve = undefined;
  }
}