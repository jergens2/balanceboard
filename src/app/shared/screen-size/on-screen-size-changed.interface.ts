import { ScreenSizes } from "./screen-sizes-enum";

export interface OnScreenSizeChanged {
    onScreenSizeChanged(appScreenSize: ScreenSizes);
}