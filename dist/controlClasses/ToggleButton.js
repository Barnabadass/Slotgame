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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Button_1 = __importDefault(require("./Button"));
var ToggleButton = /** @class */ (function (_super) {
    __extends(ToggleButton, _super);
    function ToggleButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isPressed = false;
        return _this;
    }
    Object.defineProperty(ToggleButton.prototype, "pressed", {
        get: function () {
            return this.isPressed;
        },
        set: function (pressed) {
            this.isPressed = pressed;
        },
        enumerable: false,
        configurable: true
    });
    ToggleButton.prototype.setEventListeners = function () {
        var _this = this;
        this.on("mousedown", function () {
            _this.pressed = !_this.pressed;
            _this.texture = _this.pressed ? _this.pressedStateTexture : _this.normalStateTexture;
            _this.game.onButtonClick(_this.controlName);
        });
    };
    return ToggleButton;
}(Button_1.default));
exports.default = ToggleButton;
//# sourceMappingURL=ToggleButton.js.map