export class SliderBarUnit {
    private _value: number = 0;
    private _isSet: boolean = false;
    private _isValued: boolean = true;

    public get value(): number { return this._value; }

    public get isValued(): boolean { return this._isValued; }


    constructor(value: number) {
        this._value = value;
    }

    public set() { this._isSet = true; }
    public unset() { this._isSet = false; }
    public get isSet(): boolean { return this._isSet; }


    public setIsValued(value: number) {
        if (this.value >= value) {
            this._isValued = false;
        } else {
            this._isValued = true;
        }
    }
}