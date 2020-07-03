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
var Button = /** @class */ (function (_super) {
    __extends(Button, _super);
    function Button(normalTexture, pressedTexture, name, game) {
        var _this = _super.call(this, normalTexture) || this;
        _this.isDisabled = false;
        _this.normalStateTexture = normalTexture;
        _this.pressedStateTexture = pressedTexture;
        _this.controlName = name;
        _this.game = game;
        _this.interactive = true;
        _this.setEventListeners();
        return _this;
    }
    Object.defineProperty(Button.prototype, "nickname", {
        get: function () {
            return this.controlName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Button.prototype, "disabled", {
        get: function () {
            return this.isDisabled;
        },
        set: function (val) {
            this.isDisabled = val;
            this.tint = this.isDisabled ? 0x777777 : 0xFFFFFF;
        },
        enumerable: false,
        configurable: true
    });
    Button.prototype.setEventListeners = function () {
        var _this = this;
        this.on("mouseup", function () {
            if (!_this.isDisabled) {
                _this.texture = _this.normalStateTexture;
                _this.game.onButtonClick(_this.controlName);
            }
        });
        this.on("mousedown", function () {
            if (!_this.isDisabled) {
                _this.texture = _this.pressedStateTexture;
            }
        });
        this.on("mouseout", function () {
            if (!_this.isDisabled) {
                _this.texture = _this.normalStateTexture;
            }
        });
    };
    return Button;
}(PIXI.Sprite));
exports.default = Button;
//# sourceMappingURL=Button.js.map