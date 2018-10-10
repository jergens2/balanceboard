import { CategorizedActivity } from "./categorized-activity.model";


export class TimeMark{

    public id: string;
    public timeISO: string;
    public description: string;
    public activities: CategorizedActivity[];

    public userId: string;

    constructor(id: string, userId: string, timeISO: string){
        this.id = id;
        this.userId = userId;
        this.timeISO = timeISO;
    }
}