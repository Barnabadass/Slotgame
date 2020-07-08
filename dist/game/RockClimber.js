"use strict";
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
var PIXI = __importStar(require("pixi.js"));
var Rules_1 = __importDefault(require("./Rules"));
var Prize_1 = __importDefault(require("./Prize"));
var Normal_1 = __importDefault(require("./Normal"));
var LineAnimator_1 = __importDefault(require("./LineAnimator"));
var LabelTween_1 = __importDefault(require("./LabelTween"));
var gsap_1 = __importStar(require("gsap"));
var PixiPlugin_1 = __importDefault(require("gsap/PixiPlugin"));
var SlotGame = /** @class */ (function () {
    function SlotGame(resourceManager) {
        this.rows = 3;
        this.columns = 5;
        this.numSymbols = 8;
        this.defaultAutoSpinNumber = 50;
        this.autoSpinsRemaining = this.defaultAutoSpinNumber;
        this.availableNumLines = [1, 3, 5, 7, 9];
        this.availableBets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 50];
        this.rules = null;
        this.spinSpeed = 16;
        this.reels = [];
        this.state = undefined;
        this.states = {};
        this.isAutoSpinOn = false;
        this.labelTweens = {};
        this.then = Date.now();
        this.resourceManager = resourceManager;
        this.reelMask = new PIXI.Graphics();
        this.reelMask.beginFill();
        this.reelMask.drawRect(100, 90, 930, 445);
        this.reelMask.endFill();
        this.states.normalState = new Normal_1.default(this);
        this.states.prizeState = new Prize_1.default(this);
        this.lineAnimator = new LineAnimator_1.default(this);
        gsap_1.default.registerPlugin(PixiPlugin_1.default);
        PixiPlugin_1.default.registerPIXI(PIXI);
    }
    SlotGame.prototype.getReelMask = function () {
        return this.reelMask;
    };
    Object.defineProperty(SlotGame.prototype, "symbolSize", {
        /**
         * Tells the size of symbols (it is the actual size of textures plus a gap of a few pixels so that symbols are placed some distance apart from each other)
         */
        get: function () {
            return { width: 151, height: 151 };
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Creates and starts a numberic value label tween (for prize countups, etc)
     *
     * @param changeAmount - number - the amount by which the value is to be changed at each iteration
     * @param callback - the function to be called at the termination of a tween if it is not interrupted before
     */
    SlotGame.prototype.addLabelTween = function (name, startValue, endValue, changeAmount, callback) {
        this.labelTweens[name] = new LabelTween_1.default(this, name, startValue, endValue, changeAmount, callback);
    };
    SlotGame.prototype.stopLabelTween = function (name) {
        if (this.labelTweens[name] !== undefined) {
            this.labelTweens[name].stop();
            delete this.labelTweens[name];
        }
    };
    /**
     * Sets the main labels` values, sets the symbols sent by the server on the reels, starts looped background animations, sets the initial game state
     */
    SlotGame.prototype.init = function () {
        var _this = this;
        this.rules = new Rules_1.default(this);
        this.updateMainLabels();
        this.toggleActiveLines();
        this.reels.forEach(function (reel, index) {
            reel.setSymbols(window.client.symbols.substring(index * _this.rows, (index * _this.rows) + _this.rows), true);
        });
        ["char", "fire", "logo"].forEach(function (animName) {
            var anim = _this.getControl(animName);
            anim.loop = true;
            anim.play();
        });
        this.currentState = this.states[window.client.state];
    };
    Object.defineProperty(SlotGame.prototype, "autospin", {
        get: function () {
            return this.isAutoSpinOn;
        },
        set: function (val) {
            this.isAutoSpinOn = val;
            this.getControl("button_auto_spin").pressed = val;
        },
        enumerable: false,
        configurable: true
    });
    SlotGame.prototype.setReels = function (reels) {
        this.reels = reels;
    };
    /**
     * Updates the reels, label tweens and emitters
     */
    SlotGame.prototype.update = function () {
        // the reels` stop() method is called automatically when they are ready to stop
        if (this.reels.every(function (reel) { return reel.readyToStop && !reel.stopping; })) {
            this.reels.forEach(function (reel, index) {
                setTimeout(function () { return reel.stop(); }, 250 * index);
            });
        }
        this.reels.forEach(function (reel, index) {
            reel.update();
        });
        for (var tween in this.labelTweens) {
            this.labelTweens[tween].update();
            if (this.labelTweens[tween].terminated) {
                delete this.labelTweens[tween];
            }
        }
        var now = Date.now();
        for (var emitter in this.resourceManager.emitters) {
            this.resourceManager.emitters[emitter].update((now - this.then) * 0.001);
        }
        this.then = now;
    };
    SlotGame.prototype.updateMainLabels = function () {
        this.setLabelCaption("lb_auto_spin_number", this.autoSpinsRemaining);
        this.setLabelCaption("lb_balance", window.client.balance);
        this.setLabelCaption("lb_bet", window.client.bet);
        this.setLabelCaption("lb_total_bet", window.client.bet * window.client.lines);
    };
    SlotGame.prototype.showMegaWin = function (show) {
        return __awaiter(this, void 0, void 0, function () {
            var label, text, stars, yoyoTween;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // if the prize amount is not high enough, there is nothing to show
                        if (window.client.prize < (window.client.bet * window.client.lines * 20)) {
                            return [2 /*return*/];
                        }
                        this.getControlsByName("mega_win").forEach(function (control) { return control.visible = show; });
                        if (!show) return [3 /*break*/, 3];
                        label = this.getControl("lb_mega_win");
                        text = this.getControl("mega_win_text");
                        stars = this.getControl("mega_win_stars");
                        label.alpha = text.alpha = stars.alpha = 1;
                        // text and stars tween animations and coin shower particle animation start simultaneously with the prize countup 
                        this.getEmitter("mega_win_coins").emit = true;
                        yoyoTween = gsap_1.TweenMax.fromTo([text, stars], 0.5, { pixi: { scaleX: 1, scaleY: 1 } }, { pixi: { scaleX: 1.2, scaleY: 1.2 }, yoyo: true, repeat: -1 });
                        return [4 /*yield*/, new Promise(function (resolve) { return _this.addLabelTween("lb_mega_win", 0, window.client.prize, 0.01 * Math.pow(window.client.prize, 0.9), resolve); })];
                    case 1:
                        _a.sent();
                        // when the prize countup is finished, all other animations stop, too
                        yoyoTween.kill();
                        this.getEmitter("mega_win_coins").emit = false;
                        // all elements of the megawin animation fade away at the end
                        return [4 /*yield*/, gsap_1.TweenMax.fromTo([label, text, stars], 2, { pixi: { alpha: 1 } }, { pixi: { alpha: 0 } })];
                    case 2:
                        // all elements of the megawin animation fade away at the end
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets the visibility of payline indicators according to the number of paylines selected by the user
     */
    SlotGame.prototype.toggleActiveLines = function () {
        this.getControlsByName("betlines_active").forEach(function (control) {
            control.visible = control.nickname.includes(String(window.client.lines));
        });
        this.getControlsByName("line_indicator_active").forEach(function (control) {
            control.visible = parseInt(control.nickname) <= window.client.lines;
        });
    };
    SlotGame.prototype.onAllReelsStopped = function () {
        // if the there are no more autospins left, their number is reset
        if (this.autoSpinsRemaining === 0) {
            this.autospin = false;
            this.autoSpinsRemaining = this.defaultAutoSpinNumber;
            this.setLabelCaption("lb_auto_spin_number", this.autoSpinsRemaining);
        }
        // a new state is entered
        this.currentState = this.states[window.client.state];
    };
    Object.defineProperty(SlotGame.prototype, "currentState", {
        set: function (nextState) {
            nextState.prevState = this.state;
            this.state = nextState;
            this.state.start();
        },
        enumerable: false,
        configurable: true
    });
    SlotGame.prototype.reelsSpinning = function () {
        return this.reels.some(function (reel) { return reel.spinning; });
    };
    /**
     * Tells us if there is enough money to make a turn
     */
    SlotGame.prototype.turnAvailable = function () {
        return window.client.balance >= window.client.bet * window.client.lines;
    };
    /**
     * Sends client data to the server for further processing after pressing "button_spin" or "button_auto_spin"
     */
    SlotGame.prototype.makeTurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // if there is not enough money, autospins should stop and a new turn can`t be made
                if (!this.turnAvailable()) {
                    if (this.autospin) {
                        this.autospin = false;
                        this.enableAllButtons(true);
                    }
                    return [2 /*return*/];
                }
                if (this.autospin) {
                    if (this.autoSpinsRemaining > 0) {
                        this.autoSpinsRemaining--;
                    }
                    else {
                        this.autospin = false;
                        this.autoSpinsRemaining = this.defaultAutoSpinNumber;
                    }
                }
                // if there is some cleanup to be made, it should be done now
                if (this.state !== undefined) {
                    this.state.end();
                }
                this.enableAllButtons(false);
                // subtract the total bet from the balance and update the labels 
                window.client.balance -= window.client.bet * window.client.lines;
                this.updateMainLabels();
                this.reels.forEach(function (reel) { return reel.spin(); });
                // sending all relevant information to the server via a WebSocket call 
                window.ws.send(JSON.stringify({
                    sessionId: window.client.sessionId,
                    bet: window.client.bet,
                    lines: window.client.lines,
                    type: "game_turn"
                }));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Tells the reel objects which symbols to show after they stop spinning.
     *
     * @param symbols - string - contains all the symbols to be shown on the reels, from the top-left to the bottom-right position (e.g. "012345670123456")
     */
    SlotGame.prototype.setReelSymbols = function (symbols) {
        var _this = this;
        this.reels.forEach(function (reel, index) {
            reel.setSymbols(symbols.substring(index * _this.rows, (index * _this.rows) + _this.rows), false);
        });
    };
    /**
     * Returns the Animation object of the symbol in the specified position
     *
     * @param reel - number - the index of the reel on which to seek the symbol
     * @param row - number - the number of the row where the symbol is located
     */
    SlotGame.prototype.getSymbol = function (reel, row) {
        // the symbols are sorted by their "y" coordinate, because their natural order get changed when reels spin
        return this.reels[reel].children.slice(0).sort(function (a, b) { return a.y - b.y; })[row];
    };
    SlotGame.prototype.enableAllButtons = function (enable) {
        this.getControlsByName("button_").forEach(function (control) {
            control.disabled = !enable;
        });
    };
    SlotGame.prototype.enableButton = function (nickname, enable) {
        this.getControl(nickname).disabled = !enable;
    };
    /**
     * Handles most buttons` "onclick" events.
     * If event handling is different in different game states, it is delegated to the current state
     *
     * @param nickname - string - the name of the button
     */
    SlotGame.prototype.onButtonClick = function (nickname) {
        if (nickname === "button_lines") {
            if (window.client.lines === this.availableNumLines[this.availableNumLines.length - 1]) {
                window.client.lines = this.availableNumLines[0];
            }
            else {
                window.client.lines = this.availableNumLines[this.availableNumLines.indexOf(window.client.lines) + 1];
            }
            this.toggleActiveLines();
        }
        else if (nickname === "button_info") {
            this.enableAllButtons(false);
            this.enableButton("button_close_info", true);
            this.getControl("rules").visible = true;
        }
        else if (nickname === "button_close_info") {
            this.enableAllButtons(true);
            this.getControl("rules").visible = false;
        }
        else if (nickname === "button_betone") {
            window.client.bet = window.client.bet === this.availableBets[this.availableBets.length - 1] ? this.availableBets[0] : this.availableBets[this.availableBets.indexOf(window.client.bet) + 1];
            this.rules.setLabelCaptions();
        }
        else if (nickname === "button_betmax") {
            window.client.bet = this.availableBets[this.availableBets.length - 1];
            this.rules.setLabelCaptions();
        }
        else {
            this.state.onButtonClick(nickname);
        }
        this.updateMainLabels();
    };
    SlotGame.prototype.setLabelCaption = function (labelName, caption) {
        this.resourceManager.controls[labelName].text = caption.toString();
    };
    SlotGame.prototype.getControl = function (nickname) {
        return this.resourceManager.controls[nickname];
    };
    SlotGame.prototype.getEmitter = function (nickname) {
        return this.resourceManager.emitters[nickname];
    };
    /**
     * Returns an array of controls whose nicknames contain the specified string
     */
    SlotGame.prototype.getControlsByName = function (testString) {
        var controls = [];
        for (var controlName in this.resourceManager.controls) {
            if (controlName.includes(testString)) {
                controls.push(this.resourceManager.controls[controlName]);
            }
        }
        return controls;
    };
    /**
     * Sets the "textures" array of targetAnim to that of sourceAnim.
     * Used when a control can show multiple animations.
     */
    SlotGame.prototype.setFramesFromAnim = function (targetAnim, sourceAnimNickname) {
        targetAnim.textures = this.resourceManager.controls[sourceAnimNickname].textures;
    };
    return SlotGame;
}());
exports.default = SlotGame;
//# sourceMappingURL=RockClimber.js.map