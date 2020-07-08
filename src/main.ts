import * as PIXI from "pixi.js";
import atlases from "./resources";
import Button from "./controlClasses/Button";
import ToggleButton from "./controlClasses/ToggleButton";
import Control from "./controlClasses/Control";
import Animation from "./controlClasses/Animation";
import SlotGame from "./game/RockClimber";
import Reel from "./controlClasses/Reel";
import * as particles from "pixi-particles";

export default class ResourceManager {
  private loader: PIXI.Loader = new PIXI.Loader;
  public controls: { [index: string]: Control | Animation | PIXI.Text | PIXI.AnimatedSprite | Button | PIXI.Container } = {};
  public emitters: { [name: string]: particles.Emitter } = {};
  private renderer: PIXI.Renderer;
  private stage: PIXI.Container;
  private reels: Reel[];  
  private game: SlotGame;

  constructor() {
    this.renderer = PIXI.autoDetectRenderer();
    this.renderer.view.style.position = "relative";
    this.renderer.view.width = 1280;
    this.renderer.view.height = 800;
    this.stage = new PIXI.Container();
    this.reels = [];
    this.game = new SlotGame(this);
    window.game = this.game;
    this.load();
  }

  load(): void {
    this.loader
      .add(atlases)
      .on("progress", (loader, resource) => {
        (<HTMLElement>this.getElement("loading-bar")).style.width = loader.progress.toFixed(1) + "%";
        (<HTMLElement>this.getElement("progress-text")).textContent = loader.progress.toFixed(1) + "%";
      })
      .load(() => this.createScreen());
  }

  /**
   * Creates controls based on the data from "./assets/pack.json", fills the stage with them and then starts the game`s update cycle
   */
  createScreen(): void {
    document.body.appendChild(this.renderer.view);
    (<HTMLElement>this.getElement("loading-div")).style.display = "none";
    window.addEventListener("resize", () => this.setSize());
    this.createControls(this.loader.resources["./assets/pack.json"].data.controls, this.stage);
    this.setSize();
    this.game.setReels(this.reels);
    this.game.init();
    this.update();
  }

  update(): void {
    requestAnimationFrame(() => this.update());
    this.renderer.render(this.stage);
    this.game.update();
  }

  /**
   * Goes over the propsArray, creating controls with the specified props, adds them to the parent
   * 
   * @param propsArray array of props objects describing control characteristics
   * @param parent container to add the controls to
   */
  createControls(propsArray: ControlProps[], parent: PIXI.Container): void {
    propsArray.forEach((props: ControlProps) => {
      switch (props.type) {
        case "picture":
          this.createControl(props, parent);
          break;
        case "label":
          this.createLabel(props, parent);
          break;
        case "button":
          this.createButton(props, parent, this.game);
          break;
        case "animation":
          this.createAnimation(props, parent);
          break;
        case "container":
          this.createContainer(props, parent);
          break;
        case "particle_container":
          this.createParticleEmitter(props, parent);
          break;
      }
    });
  }

  /**
   * Creates an emitter with the options, container and animated particles specified in the props object 
   * 
   * @param props props object describing control characteristics
   * @param parent container to add the emitter`s container to
   */
  createParticleEmitter(props: ControlProps, parent: PIXI.Container): void {
    let container: PIXI.Container = new PIXI.Container();
    this.assignProps(container, props);
    let emitterParticles: PIXI.Texture[] = [];
    for (let pic of (props.children!)) {
      emitterParticles.push(<PIXI.Texture>this.getTexture(<string>pic));
    }
    parent.addChild(container);
    this.controls[props.name] = container;
    let emitter = new particles.Emitter(
      container,
      [{ framerate: 60, loop: true, textures: emitterParticles }],
      this.loader.resources[props.emitterOptionsSource!].data
    );
    emitter.particleConstructor = particles.AnimatedParticle;
    emitter.emit = false;
    this.emitters[props.name] = emitter;
  }

  createContainer(props: ControlProps, parent: PIXI.Container): void {
    let container: PIXI.Container | Reel;
    // if it is a reel, it should be added to the corresponding array to be managed by the game later on
    if (props.name.startsWith("reel")) {
      container = new Reel(this.game);
      this.reels.push(<Reel>container);
      // we need to know which is the last reel (to handle its stop event)
      (<Reel>container).reelNumber = this.reels.length;
    } else {
      container = new PIXI.Container();
    }
    this.assignProps(container, props);
    this.createControls(<ControlProps[]>props.children!, container);
    parent.addChild(container);
    this.controls[props.name] = container;
  }

  createAnimation(props: ControlProps, parent: PIXI.Container): void {
    let textures: PIXI.Texture[] = [];
    for (let texture of props.frames!) {
      let frameTexture: PIXI.Texture = <PIXI.Texture>this.getTexture(texture);
      textures.push(frameTexture);
    }
    let anim: Animation = new Animation(textures, props.name);
    this.assignProps(anim, props);
    parent.addChild(anim);
    this.controls[props.name] = anim;
  }

  createControl(props: ControlProps, parent: PIXI.Container): void {
    let texture: PIXI.Texture = <PIXI.Texture>this.getTexture(props.texture!);
    let control: PIXI.Sprite = new Control(texture, props.name);
    this.assignProps(control, props);
    parent.addChild(control);
    this.controls[props.name] = control;
  }

  createLabel(props: ControlProps, parent: PIXI.Container): void {
    let label: PIXI.Text = new PIXI.Text(props.text!, props.style);
    this.assignProps(label, props);
    parent.addChild(label);
    this.controls[props.name] = label;
  }

  createButton(props: ControlProps, parent: PIXI.Container, game: SlotGame): void {
    let normalTexture: PIXI.Texture = <PIXI.Texture>this.getTexture(props.normalStateTexture!);
    let pressedTexture: PIXI.Texture = <PIXI.Texture>this.getTexture(props.pressedStateTexture!);
    let button: Button | ToggleButton;
    if (props.toggle) {
      button = new ToggleButton(normalTexture, pressedTexture, props.name, game);
    } else {
      button = new Button(normalTexture, pressedTexture, props.name, game);
    }
    this.assignProps(button, props);
    parent.addChild(button);
    this.controls[props.name] = button;
  }

  /**
   * Looks for the specified texture in all the atlases
   * 
   * @param name texture file name
   */
  getTexture(name: string): PIXI.Texture | null {
    for (let atlas in this.loader.resources) {
      for (let pic in this.loader.resources[atlas].textures) {
        if (pic === name) {
          return this.loader.resources[atlas].textures![pic];
        }
      }
    }
    return null;
  }

  assignProps(control: any, props: ControlProps): void {
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
      (<Animation>control).animationSpeed = props.animationSpeed;
    }
    // to avoid artifacts
    if (control.texture !== undefined) {
      control.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    }
  }

  /**
   * Resizes the game screen so it is positioned in the centre of the browser window.
   * The function is borrowed from the "Learn Pixi.js" book. 
   */
  setSize(): void {
    let scaleX, scaleY, scale, center;

    scaleX = window.innerWidth / this.renderer.view.width;
    scaleY = window.innerHeight / this.renderer.view.height;

    scale = Math.min(scaleX, scaleY);
    this.renderer.view.style.transformOrigin = "0 0";
    this.renderer.view.style.transform = "scale(" + scale + ")";

    if (this.renderer.view.width > this.renderer.view.height) {
      if (this.renderer.view.width * scale < window.innerWidth) {
        center = "horizontally";
      } else {
        center = "vertically";
      }
    } else {
      if (this.renderer.view.height * scale < window.innerHeight) {
        center = "vertically";
      } else {
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
  }

  getElement(id: string): HTMLElement | undefined {
    if (document.getElementById(id)) {
      return (<HTMLElement>document.getElementById(id));
    } else {
      console.log("no element with the id" + id);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // first, we need to create a connection to the game server
  const connection: WebSocket = new WebSocket("ws://localhost:8080");
  connection.onopen = () => {
    console.log("connected to ws server");
    // we send the current session`s id to the server so it can identify the client and send the actual data 
    // (so that the players can continue where they left off in case they reload or revisit the page)
    connection.send(JSON.stringify({ sessionId: localStorage.getItem("sessionId"), type: "start_session" }));
  };
  connection.onerror = error => {
    console.log(`ws error: ${error}`);
  };
  connection.onmessage = (msg: MessageEvent) => {
    const message = JSON.parse(msg.data);
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

  const resourceManager = new ResourceManager();
});