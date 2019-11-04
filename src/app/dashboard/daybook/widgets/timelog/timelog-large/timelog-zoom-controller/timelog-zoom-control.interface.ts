import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import * as moment from 'moment';
import { ItemState } from "../../../../../../shared/utilities/item-state.class";

export interface TimelogZoomControl{
    icon: IconDefinition;
    isActive: boolean;
    isFirst: boolean;
    isLast: boolean;
    name: "24" | "AWAKE" | "8" | "LIST" | "CUSTOM";
    startTime: moment.Moment;
    endTime: moment.Moment;
    itemState: ItemState;
}