import SlotGame from "../game/RockClimber";

declare global {
  interface Window {
    client: any;
    ws: WebSocket;
    game: SlotGame;
  }

  interface ControlProps {
    type: string;
    name: string;
    x: number;
    y: number;
    visible: boolean;
    texture?: string;
    frames?: string[];
    animationSpeed: number;
    children?: ControlProps[] | string[];
    style?: any;
    anchorx?: number;
    anchory?: number;
    scalex?: number;
    scaley?: number;
    width?: number;
    height?: number;
    text?: string;
    emitterOptionsSource?: string;
    toggle?: boolean;
    normalStateTexture?: string;
    pressedStateTexture?: string;
  }
}

export { };

