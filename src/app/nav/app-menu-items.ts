import { MenuItem } from "./header/header-menu/menu-item.class";
import { faSitemap, faCheckCircle, faBookOpen, faBook, faListUl, faCalendar, faUsers } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { HeaderMenu } from "./header/header-menu/header-menu.class";
import { ToolType } from "../toolbox-menu/tool-type.enum";
import { MenuItemType } from "./header/header-menu/menu-item-type.enum";




// menuItems.push(new MenuItem('Home', '/home', faHome));

const daybookMenu = new MenuItem(MenuItemType.DAYBOOK);
const notebookItem: MenuItem = new MenuItem(MenuItemType.NOTES);
const tasksItem: MenuItem = new MenuItem(MenuItemType.TASKS);
const activityItem = new MenuItem(MenuItemType.ACTIVITIES);

notebookItem.sidebarToolComponent = ToolType.NOTEBOOK_ENTRY;
daybookMenu.sidebarToolComponent = ToolType.TIMELOG_ENTRY;
tasksItem.sidebarToolComponent = ToolType.ACTION_ITEM;

// const daybookMenuItems: MenuItem[] = [new MenuItem('Daily Task List', '/daily-task-list', faListUl)];
// daybookMenu.subMenu = new HeaderMenu('Daybook submenu', daybookMenuItems);

// menuItems.push(new MenuItem('Social', '/social', faUsers));
// let schedulingMenu = new MenuItem('Scheduling', '/scheduling', faCalendar);
// schedulingMenu.sidebarToolComponent = ToolType.FUTURE_EVENT;
// let schedulingMenuItems: MenuItem[] = [
//     new MenuItem('Schedule Rotations', '/schedule-rotations', faClock),
//     new MenuItem('Day Templates', '/day-templates', faClock),
//     new MenuItem('Reccurring Tasks', '/recurring-tasks', faClock),
// ];
// schedulingMenu.subMenu = new HeaderMenu('Scheduling submenu', schedulingMenuItems);
// menuItems.push(schedulingMenu);
// menuItems.push(new MenuItem('Goals', '/goals', faTrophy));
// menuItems.push(new MenuItem('Meal Planning', '/meal-planning', faAppleAlt));


// let financeMenu = new MenuItem('Finances', '/finances', faDollarSign)
// let financeSubMenuItems: MenuItem[] = [];
// financeSubMenuItems.push(new MenuItem('Budget', '/budget', faChartPie));
// financeSubMenuItems.push(new MenuItem('Net Worth', '/networth', faChartLine));
// financeMenu.subMenu = new HeaderMenu('Finance submenu', financeSubMenuItems);
// menuItems.push(financeMenu);

// let healthMenu = new MenuItem('Health', '/health', faBriefcaseMedical);
// let healthSubMenuItems: MenuItem[] = [];
// healthSubMenuItems.push(new MenuItem('Body Weight', '/body-weight', faWeight))
// healthMenu.subMenu = new HeaderMenu('Health submenu', healthSubMenuItems);
// menuItems.push(healthMenu);




const menuItems: MenuItem[] = [
    daybookMenu,
    notebookItem,
    tasksItem,
    activityItem,
];

export const appMenuItems: MenuItem[] = menuItems;

