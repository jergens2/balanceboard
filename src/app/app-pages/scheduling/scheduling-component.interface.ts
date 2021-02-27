import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface ISchedulingComponent {
    mouseOver: boolean;
    title: string;
    routerLink: string;
    description: string;
    icon: IconDefinition;
}