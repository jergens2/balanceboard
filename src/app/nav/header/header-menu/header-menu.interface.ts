import { NavItem } from "../../nav-item.model";
import { Subscription } from "rxjs";

export interface IHeaderMenu{
    name: string;
    isOpen: boolean;
    menuOpenSubscription: Subscription;
    menuItems: NavItem[];
}