import { Subject, Observable } from "rxjs";

export class ButtonMenuItem {
    private _label: string = "";
    private _itemSelected$: Subject<boolean> = new Subject();
    private _ngClass: string[] = [];
    private _isSelected: boolean = false;

    constructor(label: string) {
        this._label = label;
    }

    public get label(): string { return this._label; }
    public get itemSelected$(): Observable<boolean> { return this._itemSelected$.asObservable(); }
    public get isSelected(): boolean { return this._isSelected; }

    public get ngClass(): string[] { return this._ngClass; }
    public set ngClass(classes: string[]) { this._ngClass = classes; }


    public selectItem() {
        this._isSelected = true;
        this._ngClass.push('is-selected');
        this._itemSelected$.next(true);
    }
    public deselectItem() {
        this._isSelected = false;
        const removeClass = this._ngClass.find(item => item === 'is-selected');
        if (removeClass) { this._ngClass.splice(this._ngClass.indexOf(removeClass), 1) };
        // this._itemSelected$.next(false);
    }


}
