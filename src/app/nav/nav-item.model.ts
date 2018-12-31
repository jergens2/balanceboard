import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export class NavItem {
    routerLink: string;
    icon: IconDefinition;
    title: string;

    constructor(title, routerLink, icon){
        this.title = title;
        this.routerLink = routerLink;
        this.icon = icon;
    }
}
