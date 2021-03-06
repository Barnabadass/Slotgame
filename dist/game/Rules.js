"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rules = /** @class */ (function () {
    function Rules(game) {
        this.paytable = {
            1: { 3: 5, 4: 20, 5: 100 },
            2: { 3: 5, 4: 20, 5: 100 },
            3: { 3: 10, 4: 30, 5: 150 },
            4: { 3: 10, 4: 30, 5: 150 },
            5: { 3: 15, 4: 45, 5: 200 },
            6: { 3: 15, 4: 45, 5: 200 },
            7: { 3: 45, 4: 200, 5: 1200 },
            8: { 3: 45, 4: 200, 5: 1200 },
        };
        this.game = game;
        this.setLabelCaptions();
    }
    Rules.prototype.setLabelCaptions = function () {
        for (var sym in this.paytable) {
            for (var numSyms in this.paytable[sym]) {
                this.game.setLabelCaption("lb_paytable_" + sym + "_" + numSyms, "" + this.paytable[sym][numSyms] * window.client.bet);
            }
        }
    };
    return Rules;
}());
exports.default = Rules;
//# sourceMappingURL=Rules.js.map