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
var particles = __importStar(require("pixi-particles"));
var ResourceManager = /** @class */ (function () {
    function ResourceManager() {
        this.loader = new PIXI.Loader;
        this.controls = {};
        this.emitters = {};
        this.renderer = PIXI.autoDetectRenderer();
        this.renderer.view.style.position = "relative";
        this.renderer.view.width = 1280;
        this.renderer.view.height = 800;
        this.stage = new PIXI.Container();
        this.reels = [];
        this.game = new RockClimber_1.default(this);
        window.game = this.game;
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
            .load(function () { return _this.createScreen(); });
    };
    /**
     * Creates controls based on the data from "./assets/pack.json", fills the stage with them and then starts the game`s update cycle
     */
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
    /**
     * Goes over the propsArray, creating controls with the specified props, adds them to the parent
     *
     * @param propsArray array of props objects describing control characteristics
     * @param parent container to add the controls to
     */
    ResourceManager.prototype.createControls = function (propsArray, parent) {
        var _this = this;
        propsArray.forEach(function (props) {
            switch (props.type) {
                case "picture":
                    _this.createControl(props, parent);
                    break;
                case "label":
                    _this.createLabel(props, parent);
                    break;
                case "button":
                    _this.createButton(props, parent, _this.game);
                    break;
                case "animation":
                    _this.createAnimation(props, parent);
                    break;
                case "container":
                    _this.createContainer(props, parent);
                    break;
                case "particle_container":
                    _this.createParticleEmitter(props, parent);
                    break;
            }
        });
    };
    /**
     * Creates an emitter with the options, container and animated particles specified in the props object
     *
     * @param props props object describing control characteristics
     * @param parent container to add the emitter`s container to
     */
    ResourceManager.prototype.createParticleEmitter = function (props, parent) {
        var container = new PIXI.Container();
        this.assignProps(container, props);
        var emitterParticles = [];
        for (var _i = 0, _a = (props.children); _i < _a.length; _i++) {
            var pic = _a[_i];
            emitterParticles.push(this.getTexture(pic));
        }
        parent.addChild(container);
        this.controls[props.name] = container;
        var emitter = new particles.Emitter(container, [{ framerate: 60, loop: true, textures: emitterParticles }], this.loader.resources[props.emitterOptionsSource].data);
        emitter.particleConstructor = particles.AnimatedParticle;
        emitter.emit = false;
        this.emitters[props.name] = emitter;
    };
    ResourceManager.prototype.createContainer = function (props, parent) {
        var container;
        // if it is a reel, it should be added to the corresponding array to be managed by the game later on
        if (props.name.startsWith("reel")) {
            container = new Reel_1.default(this.game);
            this.reels.push(container);
            // we need to know which is the last reel (to handle its stop event)
            container.reelNumber = this.reels.length;
        }
        else {
            container = new PIXI.Container();
        }
        this.assignProps(container, props);
        this.createControls(props.children, container);
        parent.addChild(container);
        this.controls[props.name] = container;
    };
    ResourceManager.prototype.createAnimation = function (props, parent) {
        var textures = [];
        for (var _i = 0, _a = props.frames; _i < _a.length; _i++) {
            var texture = _a[_i];
            var frameTexture = this.getTexture(texture);
            textures.push(frameTexture);
        }
        var anim = new Animation_1.default(textures, props.name);
        this.assignProps(anim, props);
        parent.addChild(anim);
        this.controls[props.name] = anim;
    };
    ResourceManager.prototype.createControl = function (props, parent) {
        var texture = this.getTexture(props.texture);
        var control = new Control_1.default(texture, props.name);
        this.assignProps(control, props);
        parent.addChild(control);
        this.controls[props.name] = control;
    };
    ResourceManager.prototype.createLabel = function (props, parent) {
        var label = new PIXI.Text(props.text, props.style);
        this.assignProps(label, props);
        parent.addChild(label);
        this.controls[props.name] = label;
    };
    ResourceManager.prototype.createButton = function (props, parent, game) {
        var normalTexture = this.getTexture(props.normalStateTexture);
        var pressedTexture = this.getTexture(props.pressedStateTexture);
        var button;
        if (props.toggle) {
            button = new ToggleButton_1.default(normalTexture, pressedTexture, props.name, game);
        }
        else {
            button = new Button_1.default(normalTexture, pressedTexture, props.name, game);
        }
        this.assignProps(button, props);
        parent.addChild(button);
        this.controls[props.name] = button;
    };
    /**
     * Looks for the specified texture in all the atlases
     *
     * @param name texture file name
     */
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
    ResourceManager.prototype.assignProps = function (control, props) {
        control.position.set(props.x, props.y);
        control.visible = props.visible;
        if (props.height) {
            control.height = props.height;
        }
        if (props.scalex) {
            control.scale.x = props.scalex;
        }
        if (props.scaley) {
            control.scale.y = props.scaley;
        }
        if (props.anchorx) {
            control.anchor.x = props.anchorx;
        }
        if (props.anchory) {
            control.anchor.y = props.anchory;
        }
        if (props.animationSpeed) {
            control.animationSpeed = props.animationSpeed;
        }
        // to avoid artifacts
        if (control.texture !== undefined) {
            control.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        }
    };
    /**
     * Resizes the game screen so it is positioned in the centre of the browser window.
     * The function is borrowed from the "Learn Pixi.js" book.
     */
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
    // first, we need to create a connection to the game server
    var connection = new WebSocket("ws://localhost:8080");
    connection.onopen = function () {
        console.log("connected to ws server");
        // we send the current session`s id to the server so it can identify the client and send the actual data 
        // (so that the players can continue where they left off in case they reload or revisit the page)
        connection.send(JSON.stringify({ sessionId: localStorage.getItem("sessionId"), type: "start_session" }));
    };
    connection.onerror = function (error) {
        console.log("ws error: " + error);
    };
    connection.onmessage = function (msg) {
        var message = JSON.parse(msg.data);
        // if the session id sent by the server is not the one stored in localStorage -
        // a new player entered the game or the server was restarted - a new session begins
        if (localStorage.getItem("sessionId") !== message.sessionId) {
            localStorage.setItem("sessionId", message.sessionId);
        }
        // if the server sends new reel symbols, they should be set on the game`s reels
        if (window.client !== undefined && message.symbols !== window.client.symbols && window.game !== undefined) {
            window.game.setReelSymbols(message.symbols);
        }
        window.client = message;
        console.log(window.client);
    };
    window.ws = connection;
    var resourceManager = new ResourceManager();
});
//# sourceMappingURL=main.js.map