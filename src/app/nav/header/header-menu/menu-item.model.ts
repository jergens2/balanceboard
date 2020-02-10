import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { EventEmitter } from "@angular/core";
import { HeaderMenu } from "./header-menu.model";
import { SidebarNewItemButton } from "../../sidebar/sidebar-new-item-button.interface";
import { ToolType } from "../../../toolbox-menu/tool-type.enum";

export class MenuItem implements SidebarNewItemButton{
    routerLink: string;
    icon: IconDefinition;
    title: string;

    subMenu: HeaderMenu = null;

    

    constructor(title: string, routerLink: string, icon: IconDefinition) {
        this.title = title;
        this.routerLink = routerLink;
        this.icon = icon;
    }

    public clickEmitted$: EventEmitter<boolean> = new EventEmitter();

    click() {
        this.clickEmitted$.emit(true);
    }

    closeSubMenu(){
        if(this.subMenu){
            if(this.subMenu.menuItems.length > 0){
                this.subMenu.menuItems.forEach((menuItem: MenuItem)=>{
                    menuItem.closeSubMenu();
                })
            }
            this.subMenu.closeMenu();
        }
    }



    sidebarToolComponent: ToolType = null;
    sidebarToolComponentMouseOver: boolean = false;

}
