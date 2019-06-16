import * as moment from 'moment';


export interface IActivityInstance {

    startTime: moment.Moment;
    endTime: moment.Moment;
    durationHours: number; 

    activityTreeId: string;

}