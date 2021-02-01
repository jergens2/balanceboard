import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { EventEmitter } from "@angular/core";
import { SidebarNewItemButton } from "./sidebar-new-item-button.interface";
import { ToolType } from "../../../../../toolbox/tool-type.enum";
import { MenuItemType } from "./menu-item-type.enum";
import { faBook, faBookOpen, faCheckCircle, faCogs, faLock, faPlus, faSignOutAlt, faSitemap, faUser } from "@fortawesome/free-solid-svg-icons";

export class MenuItem implements SidebarNewItemButton {


    private _itemType: MenuItemType;
    private _routerLink: string = '';
    private _icon: IconDefinition;
    private _title: string;
    private _sidebarTool: ToolType = null;
    private _sidebarToolIcon: IconDefinition = faPlus;
    private _ngStyleMini: any = {};
    private _ngStylePinned: any = {};

    public sidebarToolComponentMouseOver: boolean = false;

    public get sidebarTool(): ToolType { return this._sidebarTool; }
    public get sidebarToolIcon(): IconDefinition { return this._sidebarToolIcon; }
    public get hasSidebarToolComponent(): boolean { return this.sidebarTool !== null; }
    public get hasRouterLink(): boolean { return this._routerLink !== ''; }
    public get routerLink(): string { return this._routerLink; }
    public get icon(): IconDefinition { return this._icon; }
    public get title(): string { return this._title; }

    public get itemType(): MenuItemType { return this._itemType; }
    public get isLogout(): boolean { return this.itemType === MenuItemType.LOGOUT; }
    public get ngStyleMini(): any { return this._ngStyleMini; }
    public get ngStylePinned(): any { return this._ngStylePinned; }


    constructor(itemType: MenuItemType) {
        this._itemType = itemType;
        if (itemType === MenuItemType.DAYBOOK) {
            this._title = 'Daybook';
            this._routerLink = '/daybook';
            this._icon = faBookOpen;
            this._sidebarTool = ToolType.TIMELOG_ENTRY;

        } else if (itemType === MenuItemType.NOTES) {
            this._title = 'Notes';
            this._routerLink = '/notes';
            this._icon = faBook;
            this._sidebarTool = ToolType.NOTEBOOK_ENTRY;

        } else if (itemType === MenuItemType.TASKS) {
            this._title = 'Tasks';
            this._routerLink = '/tasks';
            this._icon = faCheckCircle;
            this._sidebarTool = ToolType.ACTION_ITEM;

        } else if (itemType === MenuItemType.ACTIVITIES) {
            this._title = 'Activities';
            this._routerLink = '/activities';
            this._icon = faSitemap;
            this._sidebarTool = ToolType.ACTIVITY;

        } else if (itemType === MenuItemType.USER_ACCOUNT) {
            this._title = 'Account';
            this._routerLink = '/user-account';
            this._icon = faUser;
            this._ngStyleMini = {
                'margin-top': '20px',
            };
            this._ngStylePinned = {
                'margin-top': '20px',
            };
        } else if (itemType === MenuItemType.SETTINGS) {
            this._title = 'Settings';
            this._routerLink = '/user-settings';
            this._icon = faCogs;

        } else if (itemType === MenuItemType.LOGOUT) {
            this._title = 'Logout';
            this._icon = faSignOutAlt;
            this._sidebarTool = ToolType.LOCK;
            this._sidebarToolIcon = faLock;
            this._ngStyleMini = {
                'margin-top': '20px',
            };
            this._ngStylePinned = {
                'margin-top': 'auto',
            };
        }

    }




}
