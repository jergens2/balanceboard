import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { EventEmitter } from "@angular/core";

export class NavItem {
    routerLink: string;
    icon: IconDefinition;
    title: string;

    constructor(title, routerLink, icon){
        this.title = title;
        this.routerLink = routerLink;
        this.icon = icon;
    }

    public clickEmitted: EventEmitter<boolean> = new EventEmitter();

    onClick(){
        this.clickEmitted.emit(true);
    }
}
