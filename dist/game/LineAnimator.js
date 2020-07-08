"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This class is responsible for showing winning paylines and animating symbols if the player won a prize
 */
var LineAnimator = /** @class */ (function () {
    function LineAnimator(game) {
        this.index = 0;
        this.interval = undefined;
        this.wins = [];
        this.game = game;
    }
    LineAnimator.prototype.start = function (callback) {
        var _this = this;
        this.cycleCallback = callback;
        this.wins = window.client.wins;
        this.index = -1;
        this.showWin();
        this.interval = setInterval(function () { return _this.showWin(); }, 3000);
    };
    /**
     * Shows one payline at a time, calls the cycle callback when the first cycle is finished
     */
    LineAnimator.prototype.showWin = function () {
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
    };
    LineAnimator.prototype.showLine = function (line) {
        this.game.getControlsByName("payline").forEach(function (control) {
            control.visible = control.nickname === "payline_" + line;
        });
    };
    LineAnimator.prototype.hideAllLines = function () {
        this.game.getControlsByName("payline").forEach(function (control) {
            control.visible = false;
        });
    };
    /**
     * Shows the line indicators (little squares with line numbers on each side of the game reels) for the specified line
     * @param line line number
     */
    LineAnimator.prototype.showLinePin = function (line) {
        this.game.getControlsByName("line_indicator_active").forEach(function (control) {
            control.visible = control.nickname.startsWith(line + "_line_indicator");
        });
    };
    LineAnimator.prototype.hideWinAnimations = function () {
        this.game.getControlsByName("win_effect").forEach(function (anim) {
            anim.gotoAndStop(0);
            anim.visible = false;
        });
        this.game.getControlsByName("win_frame").forEach(function (control) {
            control.visible = false;
        });
    };
    /**
     * Places the win effect animation and win frame above each winning symbol in the payline, shows them
     * @param positions array of winning symbol positions, starting from 0 (top-left symbol) to 14 (bottom-right one)
     */
    LineAnimator.prototype.showWinAnimations = function (positions) {
        var _this = this;
        positions.forEach(function (pos, index) {
            // first, we need to get the global coordinates of the symbol to place the win effect animation and frame above it. 
            // To get it, we extract the reel index (Math.floor(pos / this.game.rows)) and row number ((pos % this.game.rows) + 1) from the symbol`s position
            var symPos = _this.game.getSymbol(Math.floor(pos / _this.game.rows), (pos % _this.game.rows) + 1).getGlobalPosition();
            var winEffect = _this.game.getControl("win_effect_" + (index + 1));
            winEffect.position.set(symPos.x, symPos.y);
            winEffect.visible = true;
            winEffect.play();
            var frame = _this.game.getControl("win_frame_" + (index + 1));
            frame.position.set(symPos.x, symPos.y);
            frame.visible = true;
        });
    };
    /**
     * Stops showing winning paylines, hides all win animations and shows the active paylines` indicators
     */
    LineAnimator.prototype.stop = function () {
        clearInterval(this.interval);
        this.interval = undefined;
        this.hideWinAnimations();
        this.hideAllLines();
        this.game.toggleActiveLines();
    };
    return LineAnimator;
}());
exports.default = LineAnimator;
//# sourceMappingURL=LineAnimator.js.map