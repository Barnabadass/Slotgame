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
var axios_1 = __importDefault(require("axios"));
var PIXI = __importStar(require("pixi.js"));
var Rules_1 = __importDefault(require("./Rules"));
var SlotGame = /** @class */ (function () {
    function SlotGame(resourceManager) {
        this.defaultAutoSpinNumber = 50;
        this.autoSpinsRemaining = this.defaultAutoSpinNumber;
        this.availableNumLines = [1, 3, 5, 7, 9];
        this.availableBets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 50];
        this.rules = null;
        this.spinSpeed = 12;
        this.reels = [];
        this.resourceManager = resourceManager;
        this.reelMask = new PIXI.Graphics();
        this.reelMask.beginFill();
        this.reelMask.drawRect(100, 90, 930, 470);
        this.reelMask.endFill();
    }
    SlotGame.prototype.getReelMask = function () {
        return this.reelMask;
    };
    Object.defineProperty(SlotGame.prototype, "symbolSize", {
        get: function () {
            return { width: 151, height: 151 };
        },
        enumerable: false,
        configurable: true
    });
    SlotGame.prototype.getClientInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var firstResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.get("http://localhost:3000/start-session")];
                    case 1:
                        firstResponse = _a.sent();
                        this.clientInfo = firstResponse.data;
                        return [2 /*return*/, this.clientInfo.reelSymbols];
                }
            });
        });
    };
    SlotGame.prototype.init = function () {
        var _this = this;
        this.updateMainLabelCaptions();
        this.toggleActiveLines();
        this.rules = new Rules_1.default(this);
        this.reels.forEach(function (reel, index) {
            reel.setSymbols(_this.clientInfo.reelSymbols.substring(index * _this.clientInfo.rows, (index * _this.clientInfo.rows) + _this.clientInfo.rows));
        });
        var char = this.getControl("char");
        char.loop = true;
        char.play();
    };
    SlotGame.prototype.setReels = function (reels) {
        this.reels = reels;
    };
    SlotGame.prototype.update = function () {
        this.reels.forEach(function (reel, index) {
            reel.update();
        });
    };
    SlotGame.prototype.updateMainLabelCaptions = function () {
        this.setLabelCaption("lb_auto_spin_number", this.autoSpinsRemaining);
        this.setLabelCaption("lb_balance", this.clientInfo.balance);
        this.setLabelCaption("lb_bet", this.clientInfo.bet);
        this.setLabelCaption("lb_total_bet", this.clientInfo.bet * this.clientInfo.lines);
    };
    SlotGame.prototype.toggleActiveLines = function () {
        var _this = this;
        this.getControlsByName("betlines_active").forEach(function (control) {
            control.visible = control.nickname.includes(String(_this.clientInfo.lines));
        });
        this.getControlsByName("line_pin_active").forEach(function (control) {
            control.visible = parseInt(control.nickname) <= _this.clientInfo.lines;
        });
    };
    SlotGame.prototype.onButtonClick = function (nickname) {
        if (nickname === "button_lines") {
            if (this.clientInfo.lines === this.availableNumLines[this.availableNumLines.length - 1]) {
                this.clientInfo.lines = this.availableNumLines[0];
            }
            else {
                this.clientInfo.lines = this.availableNumLines[this.availableNumLines.indexOf(this.clientInfo.lines) + 1];
            }
            this.toggleActiveLines();
        }
        if (nickname === "button_info") {
            this.getControl("rules").visible = true;
        }
        if (nickname === "button_close_info") {
            this.getControl("rules").visible = false;
        }
        if (nickname === "button_betone") {
            this.clientInfo.bet = this.clientInfo.bet === this.availableBets[this.availableBets.length - 1] ? this.availableBets[0] : this.availableBets[this.availableBets.indexOf(this.clientInfo.bet) + 1];
            this.rules.setLabelCaptions();
        }
        if (nickname === "button_betmax") {
            this.clientInfo.bet = this.availableBets[this.availableBets.length - 1];
            this.rules.setLabelCaptions();
        }
        if (nickname == "button_spin") {
            this.resourceManager.reels.forEach(function (reel) {
                reel.spin();
            });
        }
        this.updateMainLabelCaptions();
    };
    SlotGame.prototype.setLabelCaption = function (labelName, caption) {
        this.resourceManager.controls[labelName].text = caption.toString();
    };
    SlotGame.prototype.getControl = function (nickname) {
        return this.resourceManager.controls[nickname];
    };
    SlotGame.prototype.getControlsByName = function (testString) {
        var controls = [];
        for (var controlName in this.resourceManager.controls) {
            if (controlName.includes(testString)) {
                controls.push(this.resourceManager.controls[controlName]);
            }
        }
        return controls;
    };
    SlotGame.prototype.setFramesFromAnim = function (targetAnim, sourceAnimNickname) {
        targetAnim.textures = this.resourceManager.controls[sourceAnimNickname].textures;
    };
    return SlotGame;
}());
exports.default = SlotGame;
//# sourceMappingURL=RockClimber.js.map