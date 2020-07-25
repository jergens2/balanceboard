import { Observable } from "rxjs";
import { ButtonMenuItem } from "./button-menu-item.class";

export class ButtonMenu {

    private _items: ButtonMenuItem[] = [];

    constructor() {

    }

    public get menuItems(): ButtonMenuItem[] { return this._items; }

    public addItem$(label: string): Observable<boolean> {
        const newItem = new ButtonMenuItem(label);
        this._items.push(newItem);
        this._updateItemsNgClass();
        return newItem.itemSelected$;
    }

    public openItem(label: string){
        const foundItem = this.menuItems.find(item => item.label === label);
        if(foundItem){
            this.openItemClicked(foundItem);
        }
    }
    public openItemClicked(itemClicked: ButtonMenuItem){
        console.log("Opening item: " + itemClicked.label)
        this.menuItems.forEach(menuItem => {
            if(menuItem.label === itemClicked.label){
              menuItem.selectItem();
            }else{
              menuItem.deselectItem();
            }
          });
    }

    private _updateItemsNgClass() {
        for (let i = 0; i < this._items.length; i++) {
            let classes: string[] = [];
            const isFirst = i === 0;
            const isLast = i === this._items.length - 1;
            if (isFirst || isLast) {
                if (isFirst) { classes.push('is-first'); }
                if (isLast) { classes.push('is-last'); }
            }
            this._items[i].ngClass = classes;
        }

    }
}