import { NavItem } from "./nav-item.model";
import { faHome, faSitemap, faProjectDiagram, faListOl, faDollarSign, faChartPie, faChartLine, faBriefcaseMedical, faWeight, faCogs, faSignOutAlt, faBookOpen, faCog } from "@fortawesome/free-solid-svg-icons";
import { faCalendarAlt, faLightbulb } from "@fortawesome/free-regular-svg-icons";


let menuItems: NavItem[] = [];

menuItems.push(new NavItem('Home','/home',faHome));
menuItems.push(new NavItem('Daybook','/daybook',faBookOpen));
menuItems.push(new NavItem('Month Planner', '/month_planner', faCalendarAlt))
menuItems.push(new NavItem('Year Planner', '/year_planner', faCalendarAlt))
menuItems.push(new NavItem('Time Log','/timelog',faCalendarAlt));
menuItems.push(new NavItem('Activities','/activities',faSitemap));
menuItems.push(new NavItem('Idea Log','/idea_log',faLightbulb));
menuItems.push(new NavItem('Productivity','/productivity',faProjectDiagram));
menuItems.push(new NavItem('Work Task List','/ivyleeCreation',faListOl));
menuItems.push(new NavItem('Finances','/finances',faDollarSign));
menuItems.push(new NavItem('Budget','/budget',faChartPie));
menuItems.push(new NavItem('Net Worth','/networth', faChartLine));
menuItems.push(new NavItem('Health','/health',faBriefcaseMedical));
menuItems.push(new NavItem('Body Weight','/bodyWeight',faWeight));
menuItems.push(new NavItem('Settings','/user_settings',faCogs));


export const appMenuItems: NavItem[] = menuItems;

