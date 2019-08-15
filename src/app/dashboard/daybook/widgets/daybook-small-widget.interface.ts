import { DaybookDayItem } from "../api/daybook-day-item.class";
import { EventEmitter } from "@angular/core";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface DaybookSmallWidget{
    // onClickExpand(): void;
    activeDay: DaybookDayItem;
    // expand: EventEmitter<boolean>;
    // faExpand: IconDefinition;
}