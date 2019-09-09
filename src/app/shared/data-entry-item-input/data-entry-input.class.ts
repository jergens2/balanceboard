import { DataEntryItemType } from "./data-entry-item-type.enum";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

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

}