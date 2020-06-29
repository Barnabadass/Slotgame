import Button from "./Button";

export default class ToggleButton extends Button {
  isPressed: boolean = false;

  get pressed(): boolean {
    return this.isPressed;
  }

  set pressed(pressed: boolean) {
    this.isPressed = pressed;
  }

  setEventListeners(): void {
    this.on("mousedown", () => {
      this.pressed = !this.pressed;
      this.texture = this.pressed ? this.pressedStateTexture! : this.normalStateTexture!;
      this.game.onButtonClick(this.controlName);
    });
  }
} 