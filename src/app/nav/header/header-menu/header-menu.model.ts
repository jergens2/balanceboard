import { MenuItem } from "./menu-item.model";
import { Subscription } from "rxjs";

export class HeaderMenu{
    name: string;
    isOpen: boolean = false;
    menuOpenSubscription: Subscription = new Subscription();
    menuItems: MenuItem[];


    constructor(name: string, menuItems: MenuItem[]){
        this.name = name;
        this.menuItems = Object.assign([] , menuItems);
        for(let menuItem of this.menuItems){
            menuItem.clickEmitted$.subscribe((click)=>{
                this.closeMenu();
            })
        }
    }

    closeMenu(){
        this.menuOpenSubscription.unsubscribe();
        this.menuItems.forEach((menuItem: MenuItem)=>{
            menuItem.closeSubMenu();
        })
        this.isOpen = false;
    }

}