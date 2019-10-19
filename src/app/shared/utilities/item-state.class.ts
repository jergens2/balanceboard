import { BehaviorSubject, Observable, Subject } from "rxjs";

export class ItemState {

    /** 
     *  Maybe at some point refactor this class to "HierarchicalItem" or "HierarchicalItemState"
     *  so as to allow for child-items, and if a child item is invalid or changed or what have you, 
     *  then this automatically gets propagated up the parent.
     *  
     */

    constructor(originalValue: any) {
        this._originalValue = originalValue;
    }
    private _originalValue: any;
    public get originalValue(): any {
        return this._originalValue;
    }

    private _isEditing$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _isNew$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _isValid$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    private _isChanged$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    public get isEditing(): boolean { return this._isEditing$.getValue(); }
    public get isNew(): boolean { return this._isNew$.getValue(); }
    public get isValid(): boolean { return this._isValid$.getValue(); }
    public get isChanged(): boolean { return this._isChanged$.getValue(); }

    public get isEditing$(): Observable<boolean> { return this._isEditing$.asObservable(); }
    public get isNew$(): Observable<boolean> { return this._isNew$.asObservable(); }
    public get isValid$(): Observable<boolean> { return this._isValid$.asObservable(); }
    public get isChanged$(): Observable<boolean> { return this._isChanged$.asObservable(); }

    public set isEditing(editing: boolean) {

        if (editing == false) {
            this._isChanged$.next(false);
            this._isValid$.next(true);
            this._isNew$.next(false);
        };
        this._isEditing$.next(editing);
    }
    public set isNew(isNew: boolean) {
        this._isNew$.next(isNew);
    }
    public set isValid(isValid: boolean) {
        this._isValid$.next(isValid);
    }
    public set isChanged(isChanged: boolean) {
        this._isChanged$.next(isChanged);
    }

    public updateIsChanged(currentValue: any) {
        if (this._originalValue === currentValue) {
            console.log("it is the same as the original")
            this.isChanged = false;
        } else {
            console.log("It was not the same as the origin")
            this.isChanged = true;
        }
    }

    public cancelAndReturnOriginalValue(): any {
        this.reset();
        return this._originalValue;
    }
    public reset(): any {
        this._isEditing$.next(false);
        this._isValid$.next(true);
        this._isChanged$.next(false);
        this._isNew$.next(false);
    }

    private _delete$: Subject<boolean> = new Subject();
    public onClickDelete() {
        this._delete$.next(true);
    }
    public get delete$(): Observable<boolean> {
        return this._delete$;
    }

    
    public createNew(){
        this.isNew = true;
    }

    public startEditing() {
        this._isEditing$.next(true);
        this._isValid$.next(false);
    }













    private _mouseIsOver$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public get mouseIsOver(): boolean { return this._mouseIsOver$.getValue(); }
    public get mouseIsOver$(): Observable<boolean> { return this._mouseIsOver$.asObservable(); }
    public onMouseEnter() {
        this._mouseIsOver$.next(true);
    }
    public onMouseLeave() {
        this._mouseIsOver$.next(false);
    }
}