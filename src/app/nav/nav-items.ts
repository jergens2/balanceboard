import { NavItem } from "./nav-item.model";
import { faHome, faSitemap, faProjectDiagram, faListOl, faDollarSign, faChartPie, faChartLine, faBriefcaseMedical, faWeight, faCogs, faSignOutAlt, faBookOpen, faCog } from "@fortawesome/free-solid-svg-icons";
import { faCalendarAlt, faLightbulb } from "@fortawesome/free-regular-svg-icons";


let navItems: NavItem[] = [];

navItems.push(new NavItem('Home','/home',faHome));
navItems.push(new NavItem('Daybook','/daybook',faBookOpen));
navItems.push(new NavItem('Month Planner', '/month_planner', faCalendarAlt))
navItems.push(new NavItem('Year Planner', '/year_planner', faCalendarAlt))
navItems.push(new NavItem('Time Log','/timelog',faCalendarAlt));
navItems.push(new NavItem('Activities','/activities',faSitemap));
navItems.push(new NavItem('Idea Log','/idea_log',faLightbulb));
navItems.push(new NavItem('Productivity','/productivity',faProjectDiagram));
navItems.push(new NavItem('Work Task List','/ivyleeCreation',faListOl));
navItems.push(new NavItem('Finances','/finances',faDollarSign));
navItems.push(new NavItem('Budget','/budget',faChartPie));
navItems.push(new NavItem('Net Worth','/networth', faChartLine));
navItems.push(new NavItem('Health','/health',faBriefcaseMedical));
navItems.push(new NavItem('Body Weight','/bodyWeight',faWeight));
navItems.push(new NavItem('Settings','/user_settings',faCogs));


export const navigationItems: NavItem[] = navItems;

