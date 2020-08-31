import * as moment from 'moment';
import { timer, BehaviorSubject, Observable, Subject } from 'rxjs';

export class Clock {
    private _currentTime$: BehaviorSubject<moment.Moment>;
    private _clockMinute$: Subject<moment.Moment> = new Subject();
    private _clockHour$: Subject<moment.Moment> = new Subject();
    private _clockDay$: Subject<moment.Moment> = new Subject();

    public get currentTime(): moment.Moment { return this._currentTime$.getValue(); }
    public get currentTime$(): Observable<moment.Moment> { return this._currentTime$.asObservable(); }

    public get everyClockSecond$(): Observable<moment.Moment> { return this._currentTime$.asObservable(); }
    public get everyClockMinute$(): Observable<moment.Moment> { return this._clockMinute$.asObservable(); }
    public get everyClockHour$(): Observable<moment.Moment> { return this._clockHour$.asObservable(); }
    public get everyClockDay$(): Observable<moment.Moment> { return this._clockDay$.asObservable(); }

    constructor() {
        const now = moment();
        this._currentTime$ = new BehaviorSubject(now);
        const msToNextSecond = moment(now).startOf('second').add(1, 'second').diff(moment(now), 'milliseconds');
        const msToNextMinute = moment(now).startOf('minute').add(1, 'minute').diff(moment(now), 'milliseconds');
        const msToNextHour = moment(now).startOf('hour').add(1, 'hours').diff(moment(now), 'milliseconds');
        const msToNextDay = moment(now).startOf('day').add(24, 'hours').diff(moment(now), 'milliseconds');
        timer(msToNextSecond, (1000 * 1)).subscribe(tick => { this._currentTime$.next(moment()); });
        timer(msToNextMinute, (1000 * 60)).subscribe(tick => { this._clockMinute$.next(moment()); });
        timer(msToNextHour, (1000 * 60 * 60)).subscribe(tick => { this._clockHour$.next(moment()); });
        timer(msToNextDay, (1000 * 60 * 60 * 24)).subscribe(tick => { this._clockDay$.next(moment()); });

    }
}
