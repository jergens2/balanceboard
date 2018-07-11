
export class EventActivity{
    public id: string;
    public startTimeISO: string;
    public endTimeISO: string;
    public description: string;
    public category: string;
    public userId: string;

    constructor(id: string, userId: string, startTimeISO: string, endTimeISO: string, description: string, category: string){
        this.id = id;
        this.userId = userId;
        this.startTimeISO = startTimeISO;
        this.endTimeISO = endTimeISO;
        this.description = description;
        this.category = category;
    }
}