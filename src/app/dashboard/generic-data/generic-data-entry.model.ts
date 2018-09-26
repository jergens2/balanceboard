import { GenericDataType } from "./generic-data-type.model";

export class GenericDataEntry{
    public id: string;
    public userId: string;

    public dateUpdatedISO: string;

    public description: string;
    public category: string;
    public dataType: GenericDataType;
    public dataObject: Object;

    constructor(id: string, userId: string, dateUpdatedISO: string, dataType: GenericDataType, dataObject: Object){
        this.id = id;
        this.userId = userId;
        this.dateUpdatedISO = dateUpdatedISO;
        this.dataType = dataType;
        this.dataObject = dataObject;
    }

}