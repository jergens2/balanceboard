import { MenuItem } from "./header/header-menu/menu-item.model";
import { faHome, faSitemap, faProjectDiagram, faListOl, faDollarSign, faChartPie, faChartLine, faBriefcaseMedical, faWeight, faCogs, faSignOutAlt, faBookOpen, faCog, faAppleAlt, faTrophy, faBook } from "@fortawesome/free-solid-svg-icons";
import { faCalendarAlt, faLightbulb, faClock } from "@fortawesome/free-regular-svg-icons";
import { Subscription } from "rxjs";
import { HeaderMenu } from "./header/header-menu/header-menu.model";


let menuItems: MenuItem[] = [];

menuItems.push(new MenuItem('Home','/home',faHome));
menuItems.push(new MenuItem('Daybook','/daybook',faBookOpen));
menuItems.push(new MenuItem('Notebooks','/notebooks', faBook));
menuItems.push(new MenuItem('Schedule','/schedule', faClock ));
menuItems.push(new MenuItem('Day Templates','/day-templates', faClock ));
// menuItems.push(new MenuItem('Month Planner', '/month_planner', faCalendarAlt));
// menuItems.push(new MenuItem('Year Planner', '/year_planner', faCalendarAlt));
menuItems.push(new MenuItem('Activities','/activities',faSitemap));
menuItems.push(new MenuItem('Idea Log','/idea-log',faLightbulb));
menuItems.push(new MenuItem('Productivity','/productivity',faProjectDiagram));
menuItems.push(new MenuItem('Tasks','/ivylee-creation',faListOl));
menuItems.push(new MenuItem('Goals','/goals',faTrophy));
menuItems.push(new MenuItem('Meal Planning','/meal-planning',faAppleAlt));


let financeMenu = new MenuItem('Finances','/finances',faDollarSign)
let financeSubMenuItems: MenuItem[] = [];
financeSubMenuItems.push(new MenuItem('Budget','/budget',faChartPie));
financeSubMenuItems.push(new MenuItem('Net Worth','/networth', faChartLine));
financeMenu.subMenu = new HeaderMenu('Finance submenu', financeSubMenuItems); 
menuItems.push(financeMenu);

let healthMenu = new MenuItem('Health','/health',faBriefcaseMedical);
let healthSubMenuItems: MenuItem[] = [];
healthSubMenuItems.push(new MenuItem('Body Weight','/body-weight',faWeight))
healthMenu.subMenu = new HeaderMenu('Health submenu', healthSubMenuItems);
menuItems.push(healthMenu);

export const appMenuItems: MenuItem[] = menuItems;

