export class GenericDataEntry{
    public id: string;
    public userId: string;

    public createdTimeISO: string;
    public startTimeISO: string;
    public endTimeISO: string;

    public description: string;
    public category: string;
    public dataObject: Object;

    constructor(id: string, userId: string, createdTimeISO: string, dataObject: Object){
        this.id = id;
        this.userId = userId;
        this.createdTimeISO = createdTimeISO;
        this.dataObject = dataObject;
    }
    


}