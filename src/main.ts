import * as PIXI from "pixi.js";
import atlases from "./resources";
import Button from "./controlClasses/Button";
import ToggleButton from "./controlClasses/ToggleButton";
import Control from "./controlClasses/Control";
import Animation from "./controlClasses/Animation";
import SlotGame from "./game/RockClimber";
import Reel from "./controlClasses/Reel";

export default class ResourceManager {
  loader: PIXI.Loader = new PIXI.Loader;
  controls: { [index: string]: PIXI.Sprite | PIXI.Text | PIXI.AnimatedSprite | Button | PIXI.Container } = {};
  renderer: PIXI.Renderer;
  stage: PIXI.Container;
  reels: Reel[];
  game: SlotGame;

  constructor() {
    this.renderer = PIXI.autoDetectRenderer();
    this.renderer.view.style.position = "relative";
    this.renderer.view.width = 1280;
    this.renderer.view.height = 800;
    this.stage = new PIXI.Container();
    this.reels = [];
    this.game = new SlotGame(this);
    this.load();
  }

  load(): void {
    this.loader
      .add(atlases)
      .on("progress", (loader, resource) => {
        (<HTMLElement>this.getElement("loading-bar")).style.width = loader.progress.toFixed(1) + "%";
        (<HTMLElement>this.getElement("progress-text")).textContent = loader.progress.toFixed(1) + "%";
      })
      .load(async () => {
        await this.game.getClientInfo();
        this.createScreen();
      });
  }

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

  createControls(controlDescrArray: any[], parentContainer: PIXI.Container): void {
    controlDescrArray.forEach((controlDescr: any) => {
      switch (controlDescr.type) {
        case "picture":
          this.createControl(controlDescr, parentContainer);
          break;
        case "label":
          this.createLabel(controlDescr, parentContainer);
          break;
        case "button":
          this.createButton(controlDescr, parentContainer, this.game);
          break;
        case "animation":
          this.createAnimation(controlDescr, parentContainer);
          break;
        case "container":
          this.createContainer(controlDescr, parentContainer);
          break;
      }
    });
  }

  createContainer(controlDescr: any, parentContainer: PIXI.Container): void {
    let container: PIXI.Container | Reel;
    if (controlDescr.name.startsWith("reel")) {
      container = new Reel(this.game);
      this.reels.push(<Reel>container);
    } else {
      container = new PIXI.Container();
    }
    this.assignProps(container, controlDescr);
    this.createControls(controlDescr.children, container);
    parentContainer.addChild(container);
    this.controls[controlDescr.name] = container;
  }

  createAnimation(controlDescr: any, parentContainer: PIXI.Container): void {
    let textures: PIXI.Texture[] = [];
    for (let texture of controlDescr.frames) {
      let frameTexture: PIXI.Texture = <PIXI.Texture>this.getTexture(texture);
      textures.push(frameTexture);
    }
    let anim: Animation = new Animation(textures, controlDescr.name);
    this.assignProps(anim, controlDescr);
    parentContainer.addChild(anim);
    this.controls[controlDescr.name] = anim;
  }

  createControl(controlDescr: any, parentContainer: PIXI.Container): void {
    let texture: PIXI.Texture = <PIXI.Texture>this.getTexture(controlDescr.texture);
    let control: PIXI.Sprite = new Control(texture, controlDescr.name);
    this.assignProps(control, controlDescr);
    parentContainer.addChild(control);
    this.controls[controlDescr.name] = control;
  }

  createLabel(controlDescr: any, parentContainer: PIXI.Container): void {
    let label = new PIXI.Text(controlDescr.text, { fill: controlDescr.color, fontSize: controlDescr.fontSize + "px", fontWeight: controlDescr.fontWeight, align: controlDescr.align });
    this.assignProps(label, controlDescr);
    parentContainer.addChild(label);
    this.controls[controlDescr.name] = label;
  }

  createButton(controlDescr: any, parentContainer: PIXI.Container, game: SlotGame): void {
    let normalTexture: PIXI.Texture = <PIXI.Texture>this.getTexture(controlDescr.normalStateTexture);
    let pressedTexture: PIXI.Texture = <PIXI.Texture>this.getTexture(controlDescr.pressedStateTexture);
    let button: Button | ToggleButton;
    if (controlDescr.toggle) {
      button = new ToggleButton(normalTexture, pressedTexture, controlDescr.name, game);
    } else {
      button = new Button(normalTexture, pressedTexture, controlDescr.name, game);
    }
    this.assignProps(button, controlDescr);
    parentContainer.addChild(button);
    this.controls[controlDescr.name] = button;
  }

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

  assignProps(control: any, controlDescr: any): void {
    control.position.set(controlDescr.x, controlDescr.y);
    control.visible = controlDescr.visible;
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
  }

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
  const resourceManager = new ResourceManager();
});