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
var resources_1 = __importDefault(require("./resources"));
var Button_1 = __importDefault(require("./controlClasses/Button"));
var ToggleButton_1 = __importDefault(require("./controlClasses/ToggleButton"));
var Control_1 = __importDefault(require("./controlClasses/Control"));
var Animation_1 = __importDefault(require("./controlClasses/Animation"));
var RockClimber_1 = __importDefault(require("./game/RockClimber"));
var Reel_1 = __importDefault(require("./controlClasses/Reel"));
var ResourceManager = /** @class */ (function () {
    function ResourceManager() {
        this.loader = new PIXI.Loader;
        this.controls = {};
        this.renderer = PIXI.autoDetectRenderer();
        this.renderer.view.style.position = "relative";
        this.renderer.view.width = 1280;
        this.renderer.view.height = 800;
        this.stage = new PIXI.Container();
        this.reels = [];
        this.game = new RockClimber_1.default(this);
        this.load();
    }
    ResourceManager.prototype.load = function () {
        var _this = this;
        this.loader
            .add(resources_1.default)
            .on("progress", function (loader, resource) {
            _this.getElement("loading-bar").style.width = loader.progress.toFixed(1) + "%";
            _this.getElement("progress-text").textContent = loader.progress.toFixed(1) + "%";
        })
            .load(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.game.getClientInfo()];
                    case 1:
                        _a.sent();
                        this.createScreen();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ResourceManager.prototype.createScreen = function () {
        var _this = this;
        document.body.appendChild(this.renderer.view);
        this.getElement("loading-div").style.display = "none";
        window.addEventListener("resize", function () { return _this.setSize(); });
        this.createControls(this.loader.resources["./assets/pack.json"].data.controls, this.stage);
        this.setSize();
        this.game.setReels(this.reels);
        this.game.init();
        this.update();
    };
    ResourceManager.prototype.update = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.update(); });
        this.renderer.render(this.stage);
        this.game.update();
    };
    ResourceManager.prototype.createControls = function (controlDescrArray, parentContainer) {
        var _this = this;
        controlDescrArray.forEach(function (controlDescr) {
            switch (controlDescr.type) {
                case "picture":
                    _this.createControl(controlDescr, parentContainer);
                    break;
                case "label":
                    _this.createLabel(controlDescr, parentContainer);
                    break;
                case "button":
                    _this.createButton(controlDescr, parentContainer, _this.game);
                    break;
                case "animation":
                    _this.createAnimation(controlDescr, parentContainer);
                    break;
                case "container":
                    _this.createContainer(controlDescr, parentContainer);
                    break;
            }
        });
    };
    ResourceManager.prototype.createContainer = function (controlDescr, parentContainer) {
        var container;
        if (controlDescr.name.startsWith("reel")) {
            container = new Reel_1.default(this.game);
            this.reels.push(container);
            container.reelNumber = this.reels.length;
        }
        else {
            container = new PIXI.Container();
        }
        this.assignProps(container, controlDescr);
        this.createControls(controlDescr.children, container);
        parentContainer.addChild(container);
        this.controls[controlDescr.name] = container;
    };
    ResourceManager.prototype.createAnimation = function (controlDescr, parentContainer) {
        var textures = [];
        for (var _i = 0, _a = controlDescr.frames; _i < _a.length; _i++) {
            var texture = _a[_i];
            var frameTexture = this.getTexture(texture);
            textures.push(frameTexture);
        }
        var anim = new Animation_1.default(textures, controlDescr.name);
        this.assignProps(anim, controlDescr);
        parentContainer.addChild(anim);
        this.controls[controlDescr.name] = anim;
    };
    ResourceManager.prototype.createControl = function (controlDescr, parentContainer) {
        var texture = this.getTexture(controlDescr.texture);
        var control = new Control_1.default(texture, controlDescr.name);
        this.assignProps(control, controlDescr);
        parentContainer.addChild(control);
        this.controls[controlDescr.name] = control;
    };
    ResourceManager.prototype.createLabel = function (controlDescr, parentContainer) {
        var label = new PIXI.Text(controlDescr.text, { fill: controlDescr.color, fontSize: controlDescr.fontSize + "px", fontWeight: controlDescr.fontWeight, align: controlDescr.align });
        this.assignProps(label, controlDescr);
        parentContainer.addChild(label);
        this.controls[controlDescr.name] = label;
    };
    ResourceManager.prototype.createButton = function (controlDescr, parentContainer, game) {
        var normalTexture = this.getTexture(controlDescr.normalStateTexture);
        var pressedTexture = this.getTexture(controlDescr.pressedStateTexture);
        var button;
        if (controlDescr.toggle) {
            button = new ToggleButton_1.default(normalTexture, pressedTexture, controlDescr.name, game);
        }
        else {
            button = new Button_1.default(normalTexture, pressedTexture, controlDescr.name, game);
        }
        this.assignProps(button, controlDescr);
        parentContainer.addChild(button);
        this.controls[controlDescr.name] = button;
    };
    ResourceManager.prototype.getTexture = function (name) {
        for (var atlas in this.loader.resources) {
            for (var pic in this.loader.resources[atlas].textures) {
                if (pic === name) {
                    return this.loader.resources[atlas].textures[pic];
                }
            }
        }
        return null;
    };
    ResourceManager.prototype.assignProps = function (control, controlDescr) {
        control.position.set(controlDescr.x, controlDescr.y);
        control.visible = controlDescr.visible;
        if (controlDescr.height) {
            control.height = controlDescr.height;
        }
        if (controlDescr.scalex) {
            control.scale.x = controlDescr.scalex;
        }
        if (controlDescr.scaley) {
            control.scale.y = controlDescr.scaley;
        }
        if (controlDescr.anchorx) {
            control.anchor.x = controlDescr.anchorx;
        }
        if (controlDescr.anchory) {
            control.anchor.y = controlDescr.anchory;
        }
        if (controlDescr.animationSpeed) {
            control.animationSpeed = controlDescr.animationSpeed;
        }
        if (control.texture !== undefined) {
            control.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        }
    };
    ResourceManager.prototype.setSize = function () {
        var scaleX, scaleY, scale, center;
        scaleX = window.innerWidth / this.renderer.view.width;
        scaleY = window.innerHeight / this.renderer.view.height;
        scale = Math.min(scaleX, scaleY);
        this.renderer.view.style.transformOrigin = "0 0";
        this.renderer.view.style.transform = "scale(" + scale + ")";
        if (this.renderer.view.width > this.renderer.view.height) {
            if (this.renderer.view.width * scale < window.innerWidth) {
                center = "horizontally";
            }
            else {
                center = "vertically";
            }
        }
        else {
            if (this.renderer.view.height * scale < window.innerHeight) {
                center = "vertically";
            }
            else {
                center = "horizontally";
            }
        }
        if (center === "horizontally") {
            this.renderer.view.style.left = ((window.innerWidth - (this.renderer.view.width * scale)) / 2) + "px";
            this.renderer.view.style.top = "0px";
        }
        if (center === "vertically") {
            this.renderer.view.style.top = ((window.innerHeight - (this.renderer.view.height * scale)) / 2) + "px";
            this.renderer.view.style.left = "0px";
            this.renderer.view.style.right = "0px";
        }
        this.renderer.view.style.paddingLeft = "0";
        this.renderer.view.style.paddingRight = "0";
        this.renderer.view.style.paddingTop = "0";
        this.renderer.view.style.paddingBottom = "0";
        this.renderer.view.style.display = "block";
    };
    ResourceManager.prototype.getElement = function (id) {
        if (document.getElementById(id)) {
            return document.getElementById(id);
        }
        else {
            console.log("no element with the id" + id);
        }
    };
    return ResourceManager;
}());
exports.default = ResourceManager;
document.addEventListener("DOMContentLoaded", function () {
    var resourceManager = new ResourceManager();
});
//# sourceMappingURL=main.js.map