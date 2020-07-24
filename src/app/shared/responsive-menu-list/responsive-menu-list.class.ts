import { Subject, Observable } from "rxjs";
import { ResponsiveMenuListItem } from "./responsive-menu-list-item.class";

export class ResponsiveMenuList{
    
    private _listItems: ResponsiveMenuListItem[] = [];
    
    constructor(){

    }

    public get listItems(): ResponsiveMenuListItem[] { return this._listItems; }

    public addMenuItem$(label: string): Observable<boolean> {
        const newItem = new ResponsiveMenuListItem(label);
        this._listItems.push(newItem);
        return newItem.isSelected$;
    }
}