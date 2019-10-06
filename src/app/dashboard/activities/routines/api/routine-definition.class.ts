import { RoutineDefinitionHttpShape } from "./routine-definition-http-shape.interface";
import { RoutineDefinitionFrequency } from "./routine-definition-frequency.interface";
import { TimeOfDay } from "../../../../shared/utilities/time-utilities/time-of-day-enum";
import { TimeRange } from "../../../../shared/utilities/time-utilities/time-range.interface";

export class RoutineDefinition{

    private _httpShape: RoutineDefinitionHttpShape;
    public get httpShape(): RoutineDefinitionHttpShape{
        return this._httpShape;
    }
    public setHttpShape(httpShape: RoutineDefinitionHttpShape){
        this._httpShape = httpShape;
    }

    public get id(): string{ return this._httpShape._id; }
    public get userId(): string{ return this._httpShape.userId; }
    public get routineTreeId(): string { return this._httpShape.routineTreeId; }
    public get name(): string{ return this._httpShape.name };
    public get frequencies(): RoutineDefinitionFrequency[] { return this._httpShape.frequencies; }
    public get timeOfDay(): TimeOfDay { return this._httpShape.timeOfDay; }
    public get timeOfDayRanges(): TimeRange[] { return this._httpShape.timeOfDayRanges; }
    public get activityIds(): string[] { return this._httpShape.activityIds; }
    public get childOfRoutineId(): string { return this._httpShape.childOfRoutineId; }

    constructor(httpShape: RoutineDefinitionHttpShape){
        this.setHttpShape(httpShape);
    }





}