import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Subject, Observable } from "rxjs";

export class ResponsiveMenuListItem {

    private _label: string = "";
    private _icon: IconDefinition = faArrowRight;
    private _isSelected$: Subject<boolean> = new Subject();
    private _isSelected: boolean = false;

    constructor(label: string) {
        this._label = label;
    }

    public set icon(icon: IconDefinition){ this._icon = icon; }

    public get label(): string { return this._label; }
    public get icon(): IconDefinition { return this._icon; }

    public get isSelected$(): Observable<boolean> { return this._isSelected$.asObservable(); }
    public get isSelected(): boolean { return this._isSelected; }

    public onSelected(){
        this._isSelected$.next(true);
        this._isSelected = true;
    }
    public unselect(){
        this._isSelected = false;
    }

}