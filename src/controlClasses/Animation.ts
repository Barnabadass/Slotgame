import * as PIXI from "pixi.js";

export default class Animation extends PIXI.AnimatedSprite {
  private controlName: string;
  private symbol: number | undefined;

  constructor(textures: PIXI.Texture[], name: string) {
    super(textures);
    this.controlName = name;
  }

  get nickname(): string {
    return this.controlName;
  }
}