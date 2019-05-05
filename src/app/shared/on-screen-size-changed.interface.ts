import { AppScreenSize } from "./app-screen-size/app-screen-size.enum";

export interface OnScreenSizeChanged {
    onScreenSizeChanged(appScreenSize: AppScreenSize);
}