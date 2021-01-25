import { MenuItem } from "./app-container/full-size-container/header/header-menu/menu-item.class";
import { faSitemap, faCheckCircle, faBookOpen, faBook, faListUl, faCalendar, faUsers } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { HeaderMenu } from "./app-container/full-size-container/header/header-menu/header-menu.class";
import { ToolType } from "../toolbox/tool-type.enum";
import { MenuItemType } from "./app-container/full-size-container/header/header-menu/menu-item-type.enum";




// menuItems.push(new MenuItem('Home', '/home', faHome));

const daybookMenu = new MenuItem(MenuItemType.DAYBOOK);
const notebookItem: MenuItem = new MenuItem(MenuItemType.NOTES);
const tasksItem: MenuItem = new MenuItem(MenuItemType.TASKS);
const activityItem = new MenuItem(MenuItemType.ACTIVITIES);
const logoutItem = new MenuItem(MenuItemType.LOGOUT);

notebookItem.sidebarToolComponent = ToolType.NOTEBOOK_ENTRY;
daybookMenu.sidebarToolComponent = ToolType.TIMELOG_ENTRY;
tasksItem.sidebarToolComponent = ToolType.ACTION_ITEM;
activityItem.sidebarToolComponent = ToolType.ACTIVITY;
logoutItem.sidebarToolComponent = ToolType.LOCK;

const menuItems: MenuItem[] = [
    daybookMenu,
    notebookItem,
    tasksItem,
    activityItem,
    logoutItem,
];

export const appMenuItems: MenuItem[] = menuItems;

