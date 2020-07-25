import { DataEntryItemType } from "./data-entry-item-type.enum";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Subject, Observable } from "rxjs";

export class DataEntryInput{
    constructor(dataType: DataEntryItemType, icon: IconDefinition, title: string){
        this.dataType = dataType;
        this.icon = icon;
        this._title = title;
    }

    dataType: DataEntryItemType;
    icon: IconDefinition;
    private _title: string = "";
    public get title(): string{
        return this._title;
    }

    private _isActive: boolean = false;
    public get isActive(): boolean{
        return this._isActive;
    }
    public set isActive(isActive: boolean){
        this._isActive = isActive;
    }


    // private _onSaveData$: Subject<boolean> = new Subject();
    // public get onSaveData$(): Observable<boolean> {
    //     return this._onSaveData$.asObservable();
    // }


    // public saveDataEntry(){
    //     this._onSaveData$.next(true);
    // }

}