export class GenericDataEntry{
    public id: string;
    public userId: string;

    public createdTimeISO: string;
    public startTimeISO: string;
    public endTimeISO: string;

    public description: string;
    public category: string;
    public dataType: string;
    public dataObject: Object;

    constructor(id: string, userId: string, createdTimeISO: string, dataType: string, dataObject: Object){
        this.id = id;
        this.userId = userId;
        this.createdTimeISO = createdTimeISO;
        this.dataType = dataType;
        this.dataObject = dataObject;
    }

    /*
        2018-07-12
        At some point the dataType should be an enum instead of a string?  At this time it is a string, 
        expected dataType strings:
    
        -    IvyLeeTaskList
        -    
        


    */
}