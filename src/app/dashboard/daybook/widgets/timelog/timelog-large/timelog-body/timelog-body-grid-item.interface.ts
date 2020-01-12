import { TimelogDisplayGridItemType } from "../../timelog-display-grid-item.enum";
import * as moment from 'moment';

export interface TimelogBodyGridItem{
    gridItemType: TimelogDisplayGridItemType;
    startTime: moment.Moment;
    endTime: moment.Moment; 
    percent: number;
}