import SlotGame from "./RockClimber";

export default class Rules {
  private game: SlotGame;
  private paytable: any = {
    1: { 3: 5, 4: 20, 5: 100 },
    2: { 3: 5, 4: 20, 5: 100 },
    3: { 3: 10, 4: 30, 5: 150 },
    4: { 3: 10, 4: 30, 5: 150 },
    5: { 3: 15, 4: 45, 5: 200 },
    6: { 3: 15, 4: 45, 5: 200 },
    7: { 3: 45, 4: 200, 5: 1200 },
    8: { 3: 45, 4: 200, 5: 1200 },
  };

  constructor(game: SlotGame) {
    this.game = game;
    this.setLabelCaptions();
  }

  setLabelCaptions(): void {
    for (let sym in this.paytable) {
      for (let numSyms in this.paytable[sym]) {
        this.game.setLabelCaption(`lb_paytable_${sym}_${numSyms}`, `${this.paytable[sym][numSyms] * this.game.clientInfo.bet}`);
      }
    }
  }
}