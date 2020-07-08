import * as PIXI from "pixi.js";
import SlotGame from "../game/RockClimber";

export default class Button extends PIXI.Sprite {
  normalStateTexture: PIXI.Texture;
  pressedStateTexture: PIXI.Texture;
  controlName: string;
  isDisabled: boolean = false;
  game: SlotGame;

  constructor(normalTexture: PIXI.Texture, pressedTexture: PIXI.Texture, name: string, game: SlotGame) {
    super(normalTexture);
    this.normalStateTexture = normalTexture;
    this.pressedStateTexture = pressedTexture;
    this.controlName = name;
    this.game = game;
    this.interactive = true;
    this.setEventListeners();
  }

  get nickname(): string {
    return this.controlName;
  }

  set disabled(val: boolean) {
    this.isDisabled = val;
    // as there are no textures for the disabled state, colors are used
    this.tint = this.isDisabled ? 0x777777 : 0xFFFFFF;
  }

  get disabled(): boolean {
    return this.isDisabled;
  }

  setEventListeners(): void {
    this.on("mouseup", () => {
      if (!this.isDisabled) {
        this.texture = this.normalStateTexture;
        this.game.onButtonClick(this.controlName);
      }
    });
    this.on("mousedown", () => {
      if (!this.isDisabled) {
        this.texture = this.pressedStateTexture;
      }
    });
    this.on("mouseout", () => {
      if (!this.isDisabled) {
        this.texture = this.normalStateTexture;
      }
    });
  }
}