
import Normal from "./Normal";
import Animation from "../controlClasses/Animation";

export default class Prize extends Normal {
  private prizeShown: boolean = false; // tells us whether the prize has been shown (needed for button functionality)
  private skipResolve: (() => void) | undefined; // function used in the showPrize() method to skip all animations and take the prize immediately

  start(): void {
    // if a user reloads the page, he should first see the balance without the prize (it will be added later)
    if (this.prevState === undefined) {
      this.game.setLabelCaption("lb_balance", window.client.balance - window.client.prize);
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
        this.game.showMegaWin(false);
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

  /**
   * Starts winning paylines` and megawin animations and prize sum countup.
   * Ends either when all these actions end or when user clicks "button_spin" (taking the prize), stopping the execution of said actions
   */
  async showPrize(): Promise<void> {
    await Promise.race([
      Promise.all([
        this.lineAnimatorPromise(),
        this.showPrizeCountup(),
        this.game.showMegaWin(true)
      ]),
      new Promise<void>(resolve => this.skipResolve = resolve)
    ]);
  }

  async showPrizeCountup(): Promise<void> {
    return new Promise(resolve => this.game.addLabelTween("lb_win", 0, window.client.prize, 0.01 * Math.pow(window.client.prize, 0.9), resolve));
  }

  lineAnimatorPromise(): Promise<void> {
    return new Promise(resolve => this.game.lineAnimator.start(resolve));
  }

  /**
   * Either shows the win labels and starts the animation of the win screen (below the reels), or hides them and stops the animation
   * 
   * @param show - boolean - whether to show or hide the controls
   */
  showWinScreen(show: boolean): void {
    this.game.getControl("win_labels_container").visible = show;
    if (show) {
      (<Animation>this.game.getControl("win_screen")).play();
      this.game.setLabelCaption("lb_win", window.client.prize);
    } else {
      (<Animation>this.game.getControl("win_screen")).stop();
    }
  }

  /**
   * Stops all win animations, adds the prize to the balance and enables buttons for further actions
   */
  takeWin(): void {
    if (this.skipResolve !== undefined) {
      this.skipResolve();
    }
    this.prizeShown = true;
    this.game.stopLabelTween("lb_win");
    this.game.setLabelCaption("lb_win", window.client.prize);
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