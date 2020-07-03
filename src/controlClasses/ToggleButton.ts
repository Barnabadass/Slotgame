import Button from "./Button";

export default class ToggleButton extends Button {
  isPressed: boolean = false;

  get pressed(): boolean {
    return this.isPressed;
  }

  set pressed(pressed: boolean) {
    this.isPressed = pressed;
    this.texture = this.pressed ? this.pressedStateTexture : this.normalStateTexture;
  }

  setEventListeners(): void {
    this.on("mousedown", () => {
      if (!this.isDisabled) {
        this.pressed = !this.pressed;
        this.game.onButtonClick(this.controlName);
      }
    });
  }
} 