import { SleepDataFormActions } from './sleep-data-form-actions.enum';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { SleepManager } from '../../sleep-manager.class';
import { TimelogEntryActivity } from '../../../api/data-items/timelog-entry-activity.interface';
import * as moment from 'moment';
import { DurationString } from '../../../../../shared/time-utilities/duration-string.class';

export class SleepDataForm {
    constructor() { }

    private _formInputWakeupTime: moment.Moment;
    private _formInputPrevFallAsleep: moment.Moment;
    private _formInputStartEnergyPercent: number;
    private _formInputDreams: string[] = [];
    private _formInputDurationPercent: number;
    private _formInputActivities: TimelogEntryActivity[] = [];
    private _formInputBedTime: moment.Moment;
    private _formInputNextWakeup: moment.Moment;

    private _wakeupTimeIsSet: boolean = false;
    private _prevFallAsleepSet: boolean = false;
    private _durationSet: boolean = false;
    private _durationString: string = '';
    private _sleepPeriodDurationString: string = '';
    private _energyIsSet: boolean = false;
    private _dreamsSet: boolean = false;

    private _formAction$: BehaviorSubject<SleepDataFormActions> = new BehaviorSubject(SleepDataFormActions.WAKEUP_TIME);
    private _finalize$: Subject<boolean> = new Subject();

    public get wakeupTimeIsSet(): boolean { return this._wakeupTimeIsSet; }
    public get prevFallAsleepTimeIsSet(): boolean { return this._prevFallAsleepSet; }
    public get durationIsSet(): boolean { return this._durationSet; }
    public get energyIsSet(): boolean { return this._energyIsSet; }
    public get dreamsSet(): boolean { return this._dreamsSet; }

    public get formInputWakeupTime(): moment.Moment { return this._formInputWakeupTime; }
    public get formInputPrevFallAsleep(): moment.Moment { return this._formInputPrevFallAsleep; }
    public get formInputStartEnergyPercent(): number { return this._formInputStartEnergyPercent; }
    public get formInputDreams(): string[] { return this._formInputDreams; }
    public get formInputDurationPercent(): number { return this._formInputDurationPercent; }
    public get formInputActivities(): TimelogEntryActivity[] { return this._formInputActivities; }
    public get formInputFallAsleepTime(): moment.Moment { return moment(this._formInputBedTime).add(20, 'minutes'); }
    public get formInputNextWakeup(): moment.Moment { return this._formInputNextWakeup; }

    public get durationString(): string { return this._durationString; }
    public get sleepPeriodDurationString(): string { return this._sleepPeriodDurationString; }

    public get formActionChanged$(): Observable<SleepDataFormActions> { return this._formAction$.asObservable(); }
    public get formAction(): SleepDataFormActions { return this._formAction$.getValue(); }
    public get finalize$(): Observable<boolean> { return this._finalize$.asObservable(); }

    public setAction(formAction: SleepDataFormActions) { this._formAction$.next(formAction); }

    public setformInputWakeupTime(time: moment.Moment) { this._formInputWakeupTime = moment(time); }
    public setformInputPrevFallAsleep(time: moment.Moment) { this._formInputPrevFallAsleep = moment(time); }
    public setformInputDurationPercent(percent: number) { this._formInputDurationPercent = percent; }
    public setStartEnergy(percent: number) { this._formInputStartEnergyPercent = percent; }
    public setformInputDreams(dreams: string[]) { this._formInputDreams = dreams; }
    public setformInputBedtime(bedtime: moment.Moment) { this._formInputBedTime = moment(bedtime); }
    public setformInputNextWakeup(nextWakeup: moment.Moment) { this._formInputNextWakeup = moment(nextWakeup); }

    public onClickForward() {
        if (this.formAction === SleepDataFormActions.WAKEUP_TIME) {
            this._wakeupTimeIsSet = true;
            this._formAction$.next(SleepDataFormActions.PREV_SLEEP_TIME);
        } else if (this.formAction === SleepDataFormActions.PREV_SLEEP_TIME) {
            this._prevFallAsleepSet = true;
            const start = moment(this.formInputPrevFallAsleep);
            const end = moment(this.formInputWakeupTime);
            const durationMs = moment(end).diff(start, 'milliseconds');
            const durationString = DurationString.getDurationStringFromMS(durationMs, true);
            this._sleepPeriodDurationString = durationString;
            this._formAction$.next(SleepDataFormActions.SLEEP_DURATION);
        } else if (this.formAction === SleepDataFormActions.SLEEP_DURATION) {
            this._durationSet = true;
            const durationMS = this.formInputWakeupTime.diff(this.formInputPrevFallAsleep, 'milliseconds')
                * (this._formInputDurationPercent / 100)
            this._durationString = DurationString.getDurationStringFromMS(durationMS, true);
            this._formAction$.next(SleepDataFormActions.ENERGY);
        } else if (this.formAction === SleepDataFormActions.ENERGY) {
            this._energyIsSet = true;
            this._formAction$.next(SleepDataFormActions.DREAMS);
        } else if (this.formAction === SleepDataFormActions.DREAMS) {
            this._dreamsSet = true;
            this._formAction$.next(SleepDataFormActions.BEDTIME);
            // } else if (this.formAction === SleepManagerFormActions.NEXT_WAKEUP_TIME) {
            //     this._formAction$.next(SleepManagerFormActions.BEDTIME);
            // 
        } else if (this.formAction === SleepDataFormActions.BEDTIME) {
            this._finalize$.next(true);
        }
    }
    public onClickBack() {
        if (this.formAction === SleepDataFormActions.PREV_SLEEP_TIME) {
            this._formAction$.next(SleepDataFormActions.WAKEUP_TIME);
        } else if (this.formAction === SleepDataFormActions.SLEEP_DURATION) {
            this._formAction$.next(SleepDataFormActions.PREV_SLEEP_TIME);
        } else if (this.formAction === SleepDataFormActions.ENERGY) {
            this._formAction$.next(SleepDataFormActions.SLEEP_DURATION);
        } else if (this.formAction === SleepDataFormActions.DREAMS) {
            this._formAction$.next(SleepDataFormActions.ENERGY);
        } else if (this.formAction === SleepDataFormActions.BEDTIME) {
            this._formAction$.next(SleepDataFormActions.DREAMS);
        }
    }
}
