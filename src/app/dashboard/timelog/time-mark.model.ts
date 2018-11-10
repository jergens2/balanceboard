import { CategorizedActivity } from "./categorized-activity.model";
import * as moment from 'moment';


export class TimeMark{

    public id: string;
    public timeISO: string;
    private timeMoment: moment.Moment;
    public description: string;
    public activities: CategorizedActivity[];

    public previousTimeMarkId: string;

    public userId: string;

    constructor(id: string, userId: string, timeISO: string){
        this.id = id;
        this.userId = userId;
        this.timeISO = timeISO;
        this.timeMoment = moment(timeISO); 
    }

    get time(): moment.Moment{
        return this.timeMoment;
    }
}