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
        _this.numSymsToPassBy = 18;
        _this.numSymsPassed = 0;
        _this.isReadyToStop = false;
        _this.symbolsToShow = [];
        _this.stopping = false;
        _this.reelNumber = 0;
        _this.game = game;
        _this.mask = _this.game.getReelMask();
        return _this;
    }
    Reel.prototype.setSymbols = function (symbols, force) {
        this.symbolsToShow = symbols.split("").map(function (sym) { return parseInt(sym); });
        if (force) {
            for (var y = 0; y <= this.game.rows; y++) {
                var sym = this.children[y];
                var symToShow = void 0;
                if (y === 0) {
                    symToShow = Math.floor(Math.random() * this.game.clientInfo.numSymbols);
                }
                else {
                    symToShow = this.symbolsToShow[y - 1];
                }
                this.game.setFramesFromAnim(sym, "s_" + symToShow);
                sym.symbol = symToShow;
            }
        }
    };
    Reel.prototype.setSymbol = function (sym) {
        var symToShow;
        if (this.stopping && this.symbolsToShow.length !== 0) {
            symToShow = this.symbolsToShow.pop();
        }
        else {
            symToShow = Math.floor(Math.random() * this.game.clientInfo.numSymbols);
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
    Object.defineProperty(Reel.prototype, "isStopping", {
        get: function () {
            return this.stopping;
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
                if (_this.numSymsPassed >= _this.numSymsToPassBy) {
                    _this.isReadyToStop = true;
                }
                if (sym.y >= _this.game.symbolSize.height * _this.game.rows) {
                    _this.numSymsPassed++;
                    if (_this.stopping && _this.symbolsToShow.length === 0) {
                        _this.stopping = false;
                        _this.isSpinning = false;
                        _this.isReadyToStop = false;
                        _this.numSymsPassed = 0;
                    }
                    sym.y -= _this.game.symbolSize.height * _this.children.length;
                    _this.setSymbol(sym);
                    if (!_this.isSpinning) {
                        var offset_1 = sym.y - -151;
                        _this.children.forEach(function (sym) {
                            sym.y += offset_1 > 0 ? -offset_1 : offset_1;
                        });
                        for (var y = 0; y <= _this.game.rows; y++) {
                            var sym_1 = _this.children[y];
                            _this.game.setFramesFromAnim(sym_1, "s_" + sym_1.symbol + "_blurred_to_normal");
                            sym_1.play();
                            sym_1.loop = false;
                        }
                        if (_this.reelNumber === _this.game.columns) {
                            _this.game.onAllReelsStopped();
                        }
                    }
                }
            });
        }
    };
    Reel.prototype.spin = function () {
        this.isSpinning = true;
        for (var y = 0; y <= this.game.rows; y++) {
            var sym = this.children[y];
            this.game.setFramesFromAnim(sym, "s_" + sym.symbol + "_normal_to_blurred");
            sym.play();
        }
    };
    Reel.prototype.stop = function () {
        this.stopping = true;
    };
    return Reel;
}(PIXI.Container));
exports.default = Reel;
//# sourceMappingURL=Reel.js.map