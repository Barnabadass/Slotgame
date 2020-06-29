import axios, { AxiosResponse } from "axios";
import ResourceManager from "../main";
import * as PIXI from "pixi.js";
import ToggleButton from "../controlClasses/ToggleButton";
import Button from "../controlClasses/Button";
import Control from "../controlClasses/Control";
import Animation from "../controlClasses/Animation";
import Rules from "./Rules";
import Reel from "../controlClasses/Reel";

export default class SlotGame {
  public clientInfo: any;
  private reelMask: PIXI.Graphics;
  private resourceManager: ResourceManager;
  private defaultAutoSpinNumber: number = 50;
  private autoSpinsRemaining: number = this.defaultAutoSpinNumber;
  private availableNumLines: number[] = [1, 3, 5, 7, 9];
  private availableBets: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 50];
  private rules: Rules | null = null;
  public spinSpeed: number = 12;
  private reels: Reel[] = [];
  
  constructor(resourceManager: ResourceManager) {
    this.resourceManager = resourceManager;
    this.reelMask = new PIXI.Graphics();
    this.reelMask.beginFill();
    this.reelMask.drawRect(100, 90, 930, 470);
    this.reelMask.endFill();
  }

  getReelMask(): PIXI.Graphics {
    return this.reelMask;
  }

  get symbolSize(): { width: number, height: number } {
    return { width: 151, height: 151 };
  }

  async getClientInfo(): Promise<string> {
    const firstResponse: AxiosResponse = await axios.get("http://localhost:3000/start-session");
    this.clientInfo = firstResponse.data;
    return this.clientInfo.reelSymbols;
  }

  init(): void {
    this.updateMainLabelCaptions();
    this.toggleActiveLines();
    this.rules = new Rules(this);
    this.reels.forEach((reel: Reel, index: number) => {
      reel.setSymbols(this.clientInfo.reelSymbols.substring(index * this.clientInfo.rows, (index * this.clientInfo.rows) + this.clientInfo.rows));
    });
    let char: Animation = <Animation>this.getControl("char");
    char.loop = true;
    char.play();
  }

  setReels(reels: Reel[]): void {
    this.reels = reels;
  }

  update(): void {
    this.reels.forEach((reel: Reel, index: number) => {
      reel.update();
    });
  }

  updateMainLabelCaptions(): void {
    this.setLabelCaption("lb_auto_spin_number", this.autoSpinsRemaining);
    this.setLabelCaption("lb_balance", this.clientInfo.balance);
    this.setLabelCaption("lb_bet", this.clientInfo.bet);
    this.setLabelCaption("lb_total_bet", this.clientInfo.bet * this.clientInfo.lines);
  }

  toggleActiveLines(): void {
    this.getControlsByName("betlines_active").forEach((control: any) => {
      control.visible = control.nickname.includes(String(this.clientInfo.lines));
    });
    this.getControlsByName("line_pin_active").forEach((control: any) => {
      control.visible = parseInt(control.nickname) <= this.clientInfo.lines;
    });
  }

  onButtonClick(nickname: string): void {
    if (nickname === "button_lines") {
      if (this.clientInfo.lines === this.availableNumLines[this.availableNumLines.length - 1]) {
        this.clientInfo.lines = this.availableNumLines[0];
      } else {
        this.clientInfo.lines = this.availableNumLines[this.availableNumLines.indexOf(this.clientInfo.lines) + 1];
      }
      this.toggleActiveLines();
    }
    if (nickname === "button_info") {
      this.getControl("rules").visible = true;
    }
    if (nickname === "button_close_info") {
      this.getControl("rules").visible = false;
    }
    if (nickname === "button_betone") {
      this.clientInfo.bet = this.clientInfo.bet === this.availableBets[this.availableBets.length - 1] ? this.availableBets[0] : this.availableBets[this.availableBets.indexOf(this.clientInfo.bet) + 1];
      this.rules!.setLabelCaptions();
    }
    if (nickname === "button_betmax") {
      this.clientInfo.bet = this.availableBets[this.availableBets.length - 1];
      this.rules!.setLabelCaptions();
    }
    if (nickname == "button_spin") {
      this.resourceManager.reels.forEach((reel: Reel) => {
        reel.spin();
      });
    }
    this.updateMainLabelCaptions();
  }

  setLabelCaption(labelName: string, caption: string | number): void {
    (<PIXI.Text>this.resourceManager.controls[labelName]).text = caption.toString();
  }

  getControl(nickname: string): Animation | Button | ToggleButton | PIXI.Text | PIXI.Container | Control {
    return this.resourceManager.controls[nickname];
  }

  getControlsByName(testString: string): (Animation | Button | ToggleButton | Text | PIXI.Container | Control)[] {
    let controls: (Animation | Button | ToggleButton | Text | PIXI.Container | Control)[] = [];
    for (let controlName in this.resourceManager.controls) {
      if (controlName.includes(testString)) {
        controls.push(this.resourceManager.controls[controlName]);
      }
    }
    return controls;
  }

  setFramesFromAnim(targetAnim: Animation, sourceAnimNickname: string): void {
    targetAnim.textures = (<PIXI.AnimatedSprite>this.resourceManager.controls[sourceAnimNickname]).textures;
  }
}