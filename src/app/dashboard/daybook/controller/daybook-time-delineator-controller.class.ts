import * as moment from 'moment';
import { Subject, Observable } from 'rxjs';

export class DaybookTimeDelineatorController{

    constructor(dateYYYYMMDD: string, timeDelineations: moment.Moment[]) {
        // console.log("Rebuilding Timelog Controller")
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._timeDelineations = timeDelineations;
    }

    private _dateYYYYMMDD: string;
    private _timeDelineations: moment.Moment[];
    
    private _saveChanges$: Subject<moment.Moment[]> = new Subject();
    
    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }
    public get timeDelineations(): moment.Moment[] { return this._timeDelineations; }

    public get saveChanges$(): Observable<moment.Moment[]> { return this._saveChanges$.asObservable(); }


    public saveTimeDelineator$(time: moment.Moment){
        this._timeDelineations.push(time);
        this._validateDelineators();
        this._saveChanges$.next(this._timeDelineations);
    }

    private _validateDelineators(){
        this._timeDelineations = this._timeDelineations.sort((d1, d2)=>{
            if(d1.isBefore(d2)){ return -1; }
            if(d1.isAfter(d2)) { return 1; }
            return 0;
        });
        if(this._timeDelineations.length > 1){
            for(let i=1; i<this._timeDelineations.length;i++){
                if(this._timeDelineations[i].isSame(this._timeDelineations[i-1])){
                    this._timeDelineations.splice(i);
                    i--;
                }
            }
        }
        
    }
}