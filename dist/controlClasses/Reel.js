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
        _this.numSymsToPassBy = 30;
        _this.numSymsPassed = 0;
        _this.game = game;
        _this.numSyms = _this.game.clientInfo.rows;
        _this.mask = _this.game.getReelMask();
        return _this;
    }
    Reel.prototype.setSymbols = function (reelSymbols) {
        var numSymbols = this.game.clientInfo.numSymbols;
        for (var y = 0; y <= this.numSyms; y++) {
            var sym = this.children[y];
            if (y === 0) {
                var randomNum = Math.floor(Math.random() * numSymbols);
                this.game.setFramesFromAnim(sym, "s_" + randomNum);
            }
            else {
                this.game.setFramesFromAnim(sym, "s_" + reelSymbols[y - 1]);
            }
        }
    };
    Reel.prototype.update = function () {
        var _this = this;
        if (this.isSpinning) {
            this.children.forEach(function (sym) {
                if (sym.y >= _this.game.symbolSize.height * _this.numSyms) {
                    _this.numSymsPassed++;
                    sym.y = -_this.game.symbolSize.height;
                }
                sym.y = sym.y + _this.game.spinSpeed;
            });
        }
    };
    Reel.prototype.spin = function () {
        this.isSpinning = true;
    };
    return Reel;
}(PIXI.Container));
exports.default = Reel;
//# sourceMappingURL=Reel.js.map