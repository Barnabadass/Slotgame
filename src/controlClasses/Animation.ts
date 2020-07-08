import * as PIXI from "pixi.js";

export default class Animation extends PIXI.AnimatedSprite {
  private controlName: string;
  public symbol: number | undefined; // this is needed for reel symbols; represents the paytable symbol to be shown in this animation

  constructor(textures: PIXI.Texture[], name: string) {
    super(textures);
    this.controlName = name;
  }

  get nickname(): string {
    return this.controlName;
  }
}