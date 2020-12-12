import { AppScreenSizeLabel } from './app-screen-size-label.enum';

export class AppScreenSize {

    private _width: number;
    private _height: number;
    private _label: AppScreenSizeLabel;
    private _ngClass: string[];

    public get width(): number { return this._width; }
    public get height(): number { return this._height; }
    public get area(): number { return this.width * this.height; }
    public get label(): AppScreenSizeLabel { return this._label; }
    public get ngClass(): string[] { return this._ngClass; }

    public get isSmall(): boolean { return this.label === AppScreenSizeLabel.MOBILE; }
    public get isMobile(): boolean { return this.label === AppScreenSizeLabel.MOBILE; }
    public get isTablet(): boolean { return this.label === AppScreenSizeLabel.TABLET; }

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;

        if (width <= 400) {
            this._label = AppScreenSizeLabel.MOBILE;
            this._ngClass = ['app-size-very-small'];
        }
        if (innerWidth > 400 && innerWidth <= 768) {
            this._label = AppScreenSizeLabel.TABLET;
            this._ngClass = ['app-size-small'];
        }
        if (innerWidth > 768 && innerWidth <= 1024) {
            this._label = AppScreenSizeLabel.NORMAL;
            this._ngClass = ['app-size-normal'];
        }
        if (innerWidth > 1024 && innerWidth <= 1400) {
            this._label = AppScreenSizeLabel.LARGE;
            this._ngClass = ['app-size-large'];
        }
        if (innerWidth > 1400) {
            this._label = AppScreenSizeLabel.VERY_LARGE;
            this._ngClass = ['app-size-very-large'];
        }
    }
}
