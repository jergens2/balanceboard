import { MenuItem } from "./app-container/full-size-container/header/header-menu/menu-item.class";
import { MenuItemType } from "./app-container/full-size-container/header/header-menu/menu-item-type.enum";

const menuItems: MenuItem[] = [
    new MenuItem(MenuItemType.DAYBOOK),
    new MenuItem(MenuItemType.NOTES),
    new MenuItem(MenuItemType.TASKS),
    new MenuItem(MenuItemType.ACTIVITIES),
    new MenuItem(MenuItemType.USER_ACCOUNT),
    new MenuItem(MenuItemType.SETTINGS),
    new MenuItem(MenuItemType.LOGOUT),

];

export const appMenuItems: MenuItem[] = menuItems;

