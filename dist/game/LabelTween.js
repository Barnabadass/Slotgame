"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LabelTween = /** @class */ (function () {
    function LabelTween(game, name, startValue, endValue, changeAmount, terminationCallback) {
        this.game = game;
        this.labelName = name;
        this.changeAmount = changeAmount;
        this.currentValue = startValue;
        this.endValue = endValue;
        this.isTerminated = false;
        this.terminationCallback = terminationCallback;
    }
    LabelTween.prototype.update = function () {
        if (!this.isTerminated) {
            this.currentValue = this.currentValue + this.changeAmount;
            if (this.currentValue >= this.endValue) {
                this.currentValue = this.endValue;
                this.stop();
                this.terminationCallback();
            }
            this.game.setLabelCaption(this.labelName, this.currentValue.toFixed(0));
        }
    };
    Object.defineProperty(LabelTween.prototype, "terminated", {
        get: function () {
            return this.isTerminated;
        },
        enumerable: false,
        configurable: true
    });
    LabelTween.prototype.stop = function () {
        this.isTerminated = true;
    };
    return LabelTween;
}());
exports.default = LabelTween;
//# sourceMappingURL=LabelTween.js.map