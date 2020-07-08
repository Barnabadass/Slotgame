import * as PIXI from "pixi.js";

/**
 * General control (picture, sprite) class
 */
export default class Control extends PIXI.Sprite {
  private controlName: string;

  constructor(texture: PIXI.Texture, name: string) {
    super(texture);
    this.controlName = name;
  }

  get nickname(): string {
    return this.controlName;
  }
}