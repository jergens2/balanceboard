import * as moment from 'moment';
import { Subject, Observable } from 'rxjs';

export class DaybookTimeDelineatorController{

    constructor(dateYYYYMMDD: string, timeDelineations: moment.Moment[]) {
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
    public deleteDelineator(time: moment.Moment){
        const foundDelineator = this._timeDelineations.find(item => item.isSame(time));
        if(foundDelineator){
            this._timeDelineations.splice(this._timeDelineations.indexOf(foundDelineator), 1);
            this._saveChanges$.next(this._timeDelineations);
        }else{
            console.log('Error:  could not delete delineator because could not find time: ' + time.format('hh:mm a'))
        }
    }

    public updateDelineator(originalTime, saveNewDelineator){
        const foundOriginal = this._timeDelineations.find(item => item.isSame(originalTime));
        if(foundOriginal){
            this._timeDelineations.splice(this._timeDelineations.indexOf(foundOriginal), 1, saveNewDelineator);
            this._saveChanges$.next(this._timeDelineations);
        }else{
            console.log('Error:  did not find original time ('+originalTime.format('hh:mm a')+') in the time delineations array: ' , this._timeDelineations);
        }
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
                    this._timeDelineations.splice(i, 1);
                    i--;
                }
            }
        }
        
    }
}