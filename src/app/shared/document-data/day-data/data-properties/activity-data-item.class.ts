
export interface DayDataActivityDataItemInterface {
    activityTreeId: string,
    durationMinutes: number
}
export class DayDataActivityDataItem{

    public get httpRequestObject(): any{
        return {
            activityTreeId: this.activityTreeId,
            durationMinutes: this.durationMinutes,
        }
    }

    activityTreeId: string = "";
    durationMinutes: number = 0;

    constructor(activityTreeId: string, durationMinutes: number){
        this.activityTreeId = activityTreeId;
        this.durationMinutes = durationMinutes;
    }
}