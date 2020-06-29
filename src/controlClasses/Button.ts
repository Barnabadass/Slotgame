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
    this.tint = this.isDisabled ? 0xFFFFFF : 0x444444;
  }

  get disabled(): boolean {
    return this.isDisabled;
  }

  setEventListeners(): void {
    this.on("mouseup", () => {
      this.texture = this.normalStateTexture!;
      this.game.onButtonClick(this.controlName);
    });
    this.on("mousedown", () => {
      this.texture = this.pressedStateTexture!;
    });
    this.on("mouseout", () => {
      this.texture = this.normalStateTexture!;
    });
  }
}