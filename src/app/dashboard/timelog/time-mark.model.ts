import { CategorizedActivity } from "./categorized-activity.model";


export class TimeMark{

    public id: string;
    public explicitTimeISO: string;
    public description: string;
    public activitiesPriod: CategorizedActivity[];

    public userId: string;

    constructor(){

    }
}