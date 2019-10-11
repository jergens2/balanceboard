import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import * as moment from 'moment';
import { ItemState } from "../../../../../../shared/utilities/item-state.class";

export interface TimelogZoomButton{
    icon: IconDefinition;
    isActive: boolean;
    name: string;
    startTime: moment.Moment;
    endTime: moment.Moment;
    ngClass: string[];
    itemState: ItemState;
}