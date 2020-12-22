import * as moment from 'moment';
import { timer, BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

export class Clock {

    private _currentTime$: BehaviorSubject<moment.Moment>;

    private _clockSecond$: Subject<moment.Moment> = new Subject();
    private _clockMinute$: Subject<moment.Moment> = new Subject();
    private _clockHour$: Subject<moment.Moment> = new Subject();
    private _clockDay$: Subject<moment.Moment> = new Subject();

    private _clockSubs: Subscription[] = [];
    private _everySecondSub: Subscription = new Subscription();

    public get currentTime(): moment.Moment { return this._currentTime$.getValue(); }
    public get currentTime$(): Observable<moment.Moment> { return this._currentTime$.asObservable(); }

    public get everyClockSecond$(): Observable<moment.Moment> { return this._clockSecond$.asObservable(); }
    public get everyClockMinute$(): Observable<moment.Moment> {  return this._clockMinute$.asObservable(); }
    public get everyClockHour$(): Observable<moment.Moment> { return this._clockHour$.asObservable(); }
    public get everyClockDay$(): Observable<moment.Moment> { return this._clockDay$.asObservable(); }

    /**
     * 
     * @param specifyTime should only be used for testing purposes.
     */
    constructor(specifyTime?: moment.Moment) {
        let currentTime = moment();
        if (specifyTime) {
            // This should only be used for testing purposes.
            console.log("\n\n*** WARNING: Clock time was set to specific time of: " + specifyTime.format('YYYY-MM-DD hh:mm a') + "\n\n\n")
            currentTime = moment(specifyTime);
        }
        this._rebuild(currentTime);
    }
    /** Should only be used for testing purposes */
    public specifyTime(setTime: moment.Moment) {
        console.log("\n\n*** WARNING: Clock time was set to specific time of: " + setTime.format('YYYY-MM-DD hh:mm a') + "\n\n\n")
        this._rebuild(setTime);
    }
    private _rebuild(currentTime: moment.Moment) {
        const nowTimeReality = moment();
        const diffFromNowMs: number = moment(currentTime).diff(nowTimeReality, 'milliseconds');
        if (!this._currentTime$) {
            this._currentTime$ = new BehaviorSubject(currentTime);
        } else {
            this._currentTime$.next(currentTime);
        }

        
        const msToNextSecond = moment(this.currentTime).startOf('second').add(1, 'second').diff(moment(this.currentTime), 'milliseconds');
        this._everySecondSub.unsubscribe();
        this._everySecondSub = timer(msToNextSecond, 1000).subscribe(()=>{
            this._currentTime$.next(moment().add(diffFromNowMs, 'milliseconds'));
            this._everySecond();
        });
    }

    private _everySecond(){
        // console.log("EVERY SECOND: " + this.currentTime.format('hh:mm:ss SSS a'));
        const hour: number = this.currentTime.hour();
        const minute: number = this.currentTime.minute();
        const second: number = this.currentTime.second();
        this._clockSecond$.next(this.currentTime);
        if(second === 0){
            // console.log("Every minute!  "  + this.currentTime.format('hh:mm:ss SSS a'))
            this._clockMinute$.next(this.currentTime);
        }
        if(minute === 0 && second === 0){
            this._clockHour$.next(this.currentTime);
        }
        if(hour === 0 && minute === 0 && second === 0){
            this._clockDay$.next(this.currentTime);
        }
    }
}
