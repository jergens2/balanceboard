import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { EventEmitter } from "@angular/core";
import { HeaderService } from "./header/header.service";
import { Router } from "@angular/router";

export class NavItem {
    routerLink: string;
    icon: IconDefinition;
    title: string;

    private router: Router;

    constructor(title, routerLink, icon) {
        this.title = title;
        this.routerLink = routerLink;
        this.icon = icon;
    }

    public clickEmitted$: EventEmitter<boolean> = new EventEmitter();

    onClick() {
        this.clickEmitted$.emit(true);
    }
}
