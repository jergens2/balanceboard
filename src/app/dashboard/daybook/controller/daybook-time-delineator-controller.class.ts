import * as moment from 'moment';

export class DaybookTimeDelineatorController{

    constructor(dateYYYYMMDD: string, timeDelineations: moment.Moment[]) {
        // console.log("Rebuilding Timelog Controller")
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._timeDelineations = timeDelineations;
    }

    private _dateYYYYMMDD: string;
    private _timeDelineations: moment.Moment[];
    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }
    public get timeDelineations(): moment.Moment[] { return this._timeDelineations; }
}