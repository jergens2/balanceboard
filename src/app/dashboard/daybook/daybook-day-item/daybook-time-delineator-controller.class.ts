import * as moment from 'moment';
import { Subject, Observable } from 'rxjs';

export class DaybookTimeDelineatorController {

    constructor(dateYYYYMMDD: string, timeDelineations: moment.Moment[]) {
        this._dateYYYYMMDD = dateYYYYMMDD;
        // console.log("Delinator Controller: timeDelineators: " + timeDelineations.length, timeDelineations )
        this._allDayDelineators = Object.assign([], timeDelineations);
        // console.log("all saved delineators for day: " + dateYYYYMMDD)
        // timeDelineations.forEach(item => console.log("    " + item.format('YYYY-MM-DD hh:mm:ss a')))
    }

    private _dateYYYYMMDD: string;
    private _allDayDelineators: moment.Moment[] = [];

    private _saveChanges$: Subject<moment.Moment[]> = new Subject();

    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }
    public get savedTimeDelineators(): moment.Moment[] {
        return this._allDayDelineators;
    }

    public get saveChanges$(): Observable<moment.Moment[]> { return this._saveChanges$.asObservable(); }


    public saveTimeDelineators(delineators: moment.Moment[]) {
        this._allDayDelineators = Object.assign([], delineators);
        this._saveChanges();
    }
    public deleteDelineator(time: moment.Moment) {
        // console.log("DELETING DELINEATOR: " + time.format('hh:mm a'))
        const foundDelineator = this._allDayDelineators.find(item => item.isSame(time));
        if (foundDelineator) {
            this._allDayDelineators.splice(this._allDayDelineators.indexOf(foundDelineator), 1);
            this._saveChanges();
        } else {
            console.log('Error:  could not delete delineator because could not find time: ' + time.format('hh:mm a'))
        }
    }

    public updateDelineator(originalTime, saveNewDelineator: moment.Moment) {
        console.log("UPDATING DELINEATOR: " + originalTime.format('hh:mm a') + " changed to " + saveNewDelineator.format('hh:mm a'))
        const foundOriginal = this._allDayDelineators.find(item => item.isSame(originalTime));
        if (foundOriginal) {
            this._allDayDelineators.splice(this._allDayDelineators.indexOf(foundOriginal), 1, saveNewDelineator);
            this._saveChanges();
        } else {
            console.log('Error:  did not find original time (' + originalTime.format('hh:mm a') + ') in the time delineations array: ', this._allDayDelineators);
        }
    }

    private _saveChanges(){
        this._validateDelineators();
        const startTime = moment(this.dateYYYYMMDD).startOf('day');
        const endTime = moment(startTime).add(24,'hours');
        const thisDayItems = this._allDayDelineators.filter(item => item.isSameOrAfter(startTime) && item.isBefore(endTime));
        // console.log("SAVING THIS DAY TIME DELINEATOR ITEMS")
        // thisDayItems.forEach(item => console.log("   " + item.format('YYYY-MM-DD hh:mm a')))
        this._saveChanges$.next(thisDayItems);
    }

    private _validateDelineators() {
        // console.log("VALIDATING TIME DELINEATORS: " + this._allDayDelineators.length)
        // this._allDayDelineators.forEach((item) => console.log("  " + item.format('YYYY-MM-DD hh:mm a')))
        this._allDayDelineators = this._allDayDelineators.sort((d1, d2) => {
            if (d1.isBefore(d2)) { return -1; }
            if (d1.isAfter(d2)) { return 1; }
            return 0;
        });
        if (this._allDayDelineators.length > 1) {
            for (let i = 1; i < this._allDayDelineators.length; i++) {
                if (this._allDayDelineators[i].isSame(this._allDayDelineators[i - 1])) {
                    this._allDayDelineators.splice(i, 1);
                    i--;
                }
            }
        }

    }
}