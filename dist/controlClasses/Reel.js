"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var PIXI = __importStar(require("pixi.js"));
var Reel = /** @class */ (function (_super) {
    __extends(Reel, _super);
    function Reel(game) {
        var _this = _super.call(this) || this;
        _this.isSpinning = false;
        _this.numSymsToPassBy = 18; // the number of symbols that should pass down when spinning before the reel is ready to stop
        _this.numSymsPassed = 0; // the number of symbols that have already passed down
        _this.isReadyToStop = false;
        _this.symbolsToShow = []; // the symbols received from the server that remain to be shown (when the reel stops)
        _this.isStopping = false;
        _this.reelNumber = 0;
        _this.game = game;
        _this.mask = _this.game.getReelMask();
        return _this;
    }
    /**
     * Fills the symbolsToShow array with symbols received from the server and shows them on the screen if necessary
     *
     * @param symbols - string - part of the data sent by the server containing the symbols for this reel
     * @param force - boolean - whether the symbols should be shown right now or later, when the reel stops
     */
    Reel.prototype.setSymbols = function (symbols, force) {
        this.symbolsToShow = symbols.split("").map(function (sym) { return parseInt(sym); });
        if (force) {
            for (var y = 0; y <= this.game.rows; y++) {
                var sym = this.children[y];
                var symToShow = void 0;
                // the reels actually contain one more symbol than there are rows on the screen, so the top symbol 
                // is always a random one (as it is not seen by the player, unless the reel is spinning)
                if (y === 0) {
                    symToShow = Math.floor(Math.random() * this.game.numSymbols);
                }
                else {
                    symToShow = this.symbolsToShow[y - 1];
                }
                this.game.setFramesFromAnim(sym, "s_" + symToShow);
                sym.symbol = symToShow;
            }
        }
    };
    /**
     * Sets the appropriate animation for the topmost symbol (used when the reel is spinning)
     */
    Reel.prototype.setSymbol = function (sym) {
        var symToShow;
        // if the reel is stopping and not all of the symbols received from the server are shown, we need to show the last one (the bottom one)
        // and update the array of the symbols that remain to be shown
        if (this.stopping && this.symbolsToShow.length !== 0) {
            symToShow = this.symbolsToShow.pop();
        }
        else {
            // otherwise, we show a random symbol
            symToShow = Math.floor(Math.random() * this.game.numSymbols);
        }
        var sourceAnimNickname = this.isSpinning ? "s_" + symToShow + "_blurred" : "s_" + symToShow;
        this.game.setFramesFromAnim(sym, sourceAnimNickname);
        sym.symbol = symToShow;
    };
    Object.defineProperty(Reel.prototype, "readyToStop", {
        get: function () {
            return this.isReadyToStop;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Reel.prototype, "stopping", {
        get: function () {
            return this.isStopping;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Reel.prototype, "spinning", {
        get: function () {
            return this.isSpinning;
        },
        enumerable: false,
        configurable: true
    });
    Reel.prototype.update = function () {
        var _this = this;
        if (this.isSpinning) {
            this.children.forEach(function (sym) {
                sym.y += _this.game.spinSpeed;
                // if the reel has spun long enough, it is ready to stop
                if (_this.numSymsPassed >= _this.numSymsToPassBy) {
                    _this.isReadyToStop = true;
                }
                // actions that should be taken if a symbol has disappeared out of sight
                if (sym.y >= _this.game.symbolSize.height * _this.children.length) {
                    _this.numSymsPassed++;
                    // if all the symbols received from the server have been shown, the reel must be stopped
                    if (_this.stopping && _this.symbolsToShow.length === 0) {
                        _this.isStopping = false;
                        _this.isSpinning = false;
                        _this.isReadyToStop = false;
                        _this.numSymsPassed = 0;
                    }
                    // the disappeared symbol returns to the topmost position and its animation should be reset
                    sym.y -= _this.game.symbolSize.height * _this.children.length;
                    _this.setSymbol(sym);
                    if (!_this.isSpinning) {
                        // if the reel has stopped, we need to align all symbols vertically
                        var diffY_1 = sym.y;
                        _this.children.forEach(function (sym) {
                            sym.y += diffY_1 > 0 ? -diffY_1 : diffY_1;
                        });
                        // also we need to change their animation to show the transition from the blurred state to normal
                        for (var y = 0; y <= _this.game.rows; y++) {
                            var sym_1 = _this.children[y];
                            _this.game.setFramesFromAnim(sym_1, "s_" + sym_1.symbol + "_blurred_to_normal");
                            sym_1.play();
                            sym_1.loop = false;
                        }
                        // if the last reel has stopped, the game should be notified of this to enter a new state and take other actions
                        if (_this.reelNumber === _this.game.columns) {
                            setTimeout(function () { return _this.game.onAllReelsStopped(); }, 200);
                        }
                    }
                }
            });
        }
    };
    Reel.prototype.spin = function () {
        this.isSpinning = true;
        // the symbols should show that the reel is spinning by changing their animation
        for (var y = 0; y <= this.game.rows; y++) {
            var sym = this.children[y];
            this.game.setFramesFromAnim(sym, "s_" + sym.symbol + "_normal_to_blurred");
            sym.play();
        }
    };
    Reel.prototype.stop = function () {
        this.isStopping = true;
    };
    return Reel;
}(PIXI.Container));
exports.default = Reel;
//# sourceMappingURL=Reel.js.map