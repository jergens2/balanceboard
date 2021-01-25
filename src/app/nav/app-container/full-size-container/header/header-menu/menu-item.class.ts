import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { EventEmitter } from "@angular/core";
import { HeaderMenu } from "./header-menu.class";
import { SidebarNewItemButton } from "./sidebar-new-item-button.interface";
import { ToolType } from "../../../../../toolbox/tool-type.enum";
import { MenuItemType } from "./menu-item-type.enum";
import { faBook, faBookOpen, faCheckCircle, faCogs, faSignOutAlt, faSitemap } from "@fortawesome/free-solid-svg-icons";

export class MenuItem implements SidebarNewItemButton{
    routerLink: string;
    icon: IconDefinition;
    title: string;

    subMenu: HeaderMenu = null;

    private _itemType: MenuItemType;
    public get itemType(): MenuItemType{ return this._itemType; }

    public get isLogout(): boolean { return this.itemType === MenuItemType.LOGOUT; }

    constructor(itemType: MenuItemType) {
        this._itemType = itemType;
        if(itemType === MenuItemType.DAYBOOK){
            this.title = 'Daybook';
            this.routerLink = '/daybook';
            this.icon = faBookOpen;
        }else if(itemType === MenuItemType.NOTES){
            this.title = 'Notes';
            this.routerLink = '/notes';
            this.icon = faBook;
        }else if(itemType === MenuItemType.TASKS){
            this.title = 'Tasks';
            this.routerLink = '/tasks';
            this.icon = faCheckCircle;
        }else if(itemType === MenuItemType.ACTIVITIES){
            this.title = 'Activities';
            this.routerLink = '/activities';
            this.icon = faSitemap;
        }else if(itemType === MenuItemType.LOGOUT){
            this.title = 'Logout';
            this.routerLink = '/auth';
            this.icon = faSignOutAlt;
        }else if(itemType === MenuItemType.SETTINGS){
            this.title = 'Settings';
            this.routerLink = '/user-settings';
            this.icon = faCogs;
        }
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
