"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Normal = /** @class */ (function () {
    function Normal(game) {
        this.prevState = undefined;
        this.game = game;
    }
    Normal.prototype.start = function () {
        var _this = this;
        if (this.game.autospin) {
            this.game.enableButton("button_auto_spin", true);
            setTimeout(function () {
                if (_this.game.autospin && !_this.game.reelsSpinning()) {
                    _this.game.makeTurn();
                }
            }, 1500);
        }
        else {
            this.game.enableAllButtons(true);
        }
    };
    Normal.prototype.onButtonClick = function (nickname) {
        if (nickname === "button_spin") {
            this.game.makeTurn();
        }
        else if (nickname === "button_auto_spin") {
            this.game.autospin = !this.game.autospin;
            if (this.game.autospin) {
                this.game.makeTurn();
            }
            else {
                this.game.enableAllButtons(true);
            }
        }
    };
    Normal.prototype.end = function () {
    };
    return Normal;
}());
exports.default = Normal;
//# sourceMappingURL=Normal.js.map