import * as moment from 'moment';
import { ActivityCategoryDefinition } from '../../activities/api/activity-category-definition/activity-category-definition.class';

export class ScheduleItem {

    startTime: moment.Moment;
    endTime: moment.Moment;

    public get date(): string{ 
        return moment(this.startTime).format('YYYY-MM-DD');
    }

    constructor( startTime: moment.Moment, endTime: moment.Moment){
        this.startTime = moment(startTime);
        this.endTime = moment(endTime);
    }

    name: string;
    activity: ActivityCategoryDefinition;

    style: any;

}