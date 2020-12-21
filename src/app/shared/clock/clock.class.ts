import * as moment from 'moment';
import { timer, BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

export class Clock {

    private _currentTime$: BehaviorSubject<moment.Moment>;

    private _clockSecond$: Subject<moment.Moment> = new Subject();
    private _clockMinute$: Subject<moment.Moment> = new Subject();
    private _clockHour$: Subject<moment.Moment> = new Subject();
    private _clockDay$: Subject<moment.Moment> = new Subject();

    private _subscriptions: Subscription[] = [];

    public get currentTime(): moment.Moment { return this._currentTime$.getValue(); }
    public get currentTime$(): Observable<moment.Moment> { return this._currentTime$.asObservable(); }

    public get everyClockSecond$(): Observable<moment.Moment> { return this._clockSecond$.asObservable(); }
    public get everyClockMinute$(): Observable<moment.Moment> { return this._clockMinute$.asObservable(); }
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
        if (!this._currentTime$) {
            this._currentTime$ = new BehaviorSubject(currentTime);
        } else {
            this._currentTime$.next(currentTime);
        }
        this._currentTime$ = new BehaviorSubject(currentTime);
        const msToNextSecond = moment(currentTime).startOf('second').add(1, 'second').diff(moment(currentTime), 'milliseconds');
        const msToNextMinute = moment(currentTime).startOf('minute').add(1, 'minute').diff(moment(currentTime), 'milliseconds');
        const msToNextHour = moment(currentTime).startOf('hour').add(1, 'hours').diff(moment(currentTime), 'milliseconds');
        const msToNextDay = moment(currentTime).startOf('day').add(24, 'hours').diff(moment(currentTime), 'milliseconds');
        this._subscriptions.forEach(s => s.unsubscribe());
        this._subscriptions = [
            timer(msToNextSecond, (1000 * 1)).subscribe(tick => {
                currentTime = moment(currentTime).add(1, 'seconds');
                this._currentTime$.next(moment(currentTime));
                this._clockSecond$.next(moment(currentTime));
            }),
            timer(msToNextMinute, (1000 * 60)).subscribe(tick => {
                this._clockMinute$.next(moment(currentTime));
            }),
            timer(msToNextHour, (1000 * 60 * 60)).subscribe(tick => {
                this._clockHour$.next(moment(currentTime));
            }),
            timer(msToNextDay, (1000 * 60 * 60 * 24)).subscribe(tick => {
                this._clockDay$.next(moment(currentTime));
            }),
        ];

    }
}
