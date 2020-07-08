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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Normal_1 = __importDefault(require("./Normal"));
var Prize = /** @class */ (function (_super) {
    __extends(Prize, _super);
    function Prize() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prizeShown = false; // tells us whether the prize has been shown (needed for button functionality)
        return _this;
    }
    Prize.prototype.start = function () {
        var _this = this;
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
            .then(function () {
            _this.game.showMegaWin(false);
            if (!_this.prizeShown) {
                _this.takeWin();
            }
            if (_this.game.autospin) {
                setTimeout(function () {
                    if (_this.game.autospin && !_this.game.reelsSpinning()) {
                        _this.game.makeTurn();
                    }
                }, 1500);
            }
        });
    };
    /**
     * Starts winning paylines` and megawin animations and prize sum countup.
     * Ends either when all these actions end or when user clicks "button_spin" (taking the prize), stopping the execution of said actions
     */
    Prize.prototype.showPrize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.race([
                            Promise.all([
                                this.lineAnimatorPromise(),
                                this.showPrizeCountup(),
                                this.game.showMegaWin(true)
                            ]),
                            new Promise(function (resolve) { return _this.skipResolve = resolve; })
                        ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Prize.prototype.showPrizeCountup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return _this.game.addLabelTween("lb_win", 0, window.client.prize, 0.01 * Math.pow(window.client.prize, 0.9), resolve); })];
            });
        });
    };
    Prize.prototype.lineAnimatorPromise = function () {
        var _this = this;
        return new Promise(function (resolve) { return _this.game.lineAnimator.start(resolve); });
    };
    /**
     * Either shows the win labels and starts the animation of the win screen (below the reels), or hides them and stops the animation
     *
     * @param show - boolean - whether to show or hide the controls
     */
    Prize.prototype.showWinScreen = function (show) {
        this.game.getControl("win_labels_container").visible = show;
        if (show) {
            this.game.getControl("win_screen").play();
            this.game.setLabelCaption("lb_win", window.client.prize);
        }
        else {
            this.game.getControl("win_screen").stop();
        }
    };
    /**
     * Stops all win animations, adds the prize to the balance and enables buttons for further actions
     */
    Prize.prototype.takeWin = function () {
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
        }
        else {
            this.game.enableButton("button_spin", false);
        }
    };
    Prize.prototype.onButtonClick = function (nickname) {
        if (nickname === "button_spin") {
            if (!this.prizeShown) {
                this.takeWin();
            }
            else {
                this.game.makeTurn();
            }
        }
        else if (nickname === "button_auto_spin") {
            this.game.autospin = !this.game.autospin;
            if (this.game.autospin) {
                if (this.prizeShown) {
                    this.game.makeTurn();
                }
            }
            else {
                if (this.prizeShown) {
                    this.game.enableAllButtons(true);
                }
                else {
                    this.game.enableButton("button_auto_spin", false);
                }
            }
        }
    };
    Prize.prototype.end = function () {
        this.showWinScreen(false);
        this.skipResolve = undefined;
    };
    return Prize;
}(Normal_1.default));
exports.default = Prize;
//# sourceMappingURL=Prize.js.map