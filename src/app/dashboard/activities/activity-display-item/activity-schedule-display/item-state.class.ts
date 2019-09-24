import { BehaviorSubject, Observable } from "rxjs";

export class ItemState{

    constructor(originalValue: any){
        this._originalValue = originalValue;
    }
    private _originalValue: any;

    private _isEditing$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _isNew$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _isValid$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    private _isChanged$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    public get isEditing(): boolean{ return this._isEditing$.getValue(); }
    public get isNew(): boolean{ return this._isNew$.getValue(); }
    public get isValid(): boolean{ return this._isValid$.getValue(); }
    public get isChanged(): boolean { return this._isChanged$.getValue(); }

    public get isEditing$(): Observable<boolean> { return this._isEditing$.asObservable(); }
    public get isNew$(): Observable<boolean> { return this._isNew$.asObservable(); }
    public get isValid$(): Observable<boolean> { return this._isValid$.asObservable(); }
    public get isChanged$(): Observable<boolean> { return this._isChanged$.asObservable(); }

    public set isEditing(editing: boolean){
        
        if(editing == false){
            this._isChanged$.next(false);
            this._isValid$.next(true);
            this._isNew$.next(false);
        };
        this._isEditing$.next(editing);
    }
    public set isNew(isNew: boolean){
        this._isNew$.next(isNew);
    }
    public set isValid(isValid: boolean){
        this._isValid$.next(isValid);
    }
    public set isChanged(isChanged: boolean){
        this._isChanged$.next(isChanged);
    }

    public startEditing(){
          this._isEditing$.next(true);
          this._isValid$.next(false);
    }
    public cancel(): any{
        this._isEditing$.next(false);
        this._isValid$.next(true);
        this._isChanged$.next(false);
        return this._originalValue;
    }
    


















    private _mouseIsOver: boolean = false;
    public get mouseIsOver(): boolean{ return this._mouseIsOver; }
    public onMouseOver(){
        this._mouseIsOver = true;
    }
    public onMOuseLeave(){
        this._mouseIsOver = false;
    }
}