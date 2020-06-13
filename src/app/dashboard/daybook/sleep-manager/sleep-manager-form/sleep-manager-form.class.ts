import { SleepManagerFormActions } from "./smfa-actions.enum";
import { BehaviorSubject, Subject, Observable } from "rxjs";
import { SleepManager } from "../sleep-manager.class";
import { TimelogEntryActivity } from "../../api/data-items/timelog-entry-activity.interface";
import * as moment from 'moment';
import { DurationString } from "../../../../shared/time-utilities/duration-string.class";

export class SleepManagerForm {
    private _manager: SleepManager;
    constructor(manager: SleepManager) {
        this._manager = manager;
    }

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
    private _durationString: string = "";
    private _sleepPeriodDurationString: string = "";
    private _energyIsSet: boolean = false;
    private _dreamsSet: boolean = false;

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

    public setformInputWakeupTime(time: moment.Moment) { this._formInputWakeupTime = moment(time); }
    public setformInputPrevFallAsleep(time: moment.Moment) { this._formInputPrevFallAsleep = moment(time); }
    public setformInputDurationPercent(percent: number) { this._formInputDurationPercent = percent; }
    public setStartEnergy(percent: number) { this._formInputStartEnergyPercent = percent; }
    public setformInputDreams(dreams: string[]) { this._formInputDreams = dreams; }
    public setformInputBedtime(bedtime: moment.Moment) { this._formInputBedTime = moment(bedtime); }
    public setformInputNextWakeup(nextWakeup: moment.Moment) { this._formInputNextWakeup = moment(nextWakeup); }

    public onClickForward() {
        if (this.formAction === SleepManagerFormActions.WAKEUP_TIME) {
            this._wakeupTimeIsSet = true;
            this._formAction$.next(SleepManagerFormActions.PREV_SLEEP_TIME);
        }
        else if (this.formAction === SleepManagerFormActions.PREV_SLEEP_TIME) {
            this._prevFallAsleepSet = true;
            const start = moment(this.formInputPrevFallAsleep);
            const end = moment(this.formInputWakeupTime);
            const durationMs = moment(end).diff(start, 'milliseconds');
            const durationString = DurationString.getDurationStringFromMS(durationMs, true);
            this._sleepPeriodDurationString = durationString;
            this._formAction$.next(SleepManagerFormActions.SLEEP_DURATION);
        }
        else if (this.formAction === SleepManagerFormActions.SLEEP_DURATION) {
            this._durationSet = true;
            const durationMS = this.formInputWakeupTime.diff(this.formInputPrevFallAsleep, 'milliseconds') * (this._formInputDurationPercent / 100)
            this._durationString = DurationString.getDurationStringFromMS(durationMS, true);
            this._formAction$.next(SleepManagerFormActions.ENERGY);
        }
        else if (this.formAction === SleepManagerFormActions.ENERGY) {
            this._energyIsSet = true;
            this._formAction$.next(SleepManagerFormActions.DREAMS);
        }
        else if (this.formAction === SleepManagerFormActions.DREAMS) {
            this._dreamsSet = true;
            this._formAction$.next(SleepManagerFormActions.BEDTIME);
        }
        // else if (this.formAction === SleepManagerFormActions.NEXT_WAKEUP_TIME) {
        //     this._formAction$.next(SleepManagerFormActions.BEDTIME);
        // }
        else if (this.formAction === SleepManagerFormActions.BEDTIME) {
            this._finalize();
        }
    }


    public onClickBack() {
        if (this.formAction === SleepManagerFormActions.PREV_SLEEP_TIME) { this._formAction$.next(SleepManagerFormActions.WAKEUP_TIME); }
        else if (this.formAction === SleepManagerFormActions.SLEEP_DURATION) { this._formAction$.next(SleepManagerFormActions.PREV_SLEEP_TIME); }
        else if (this.formAction === SleepManagerFormActions.ENERGY) { this._formAction$.next(SleepManagerFormActions.SLEEP_DURATION); }
        else if (this.formAction === SleepManagerFormActions.DREAMS) { this._formAction$.next(SleepManagerFormActions.ENERGY); }
        else if (this.formAction === SleepManagerFormActions.BEDTIME) { this._formAction$.next(SleepManagerFormActions.DREAMS); }
    }

    private _formAction$: BehaviorSubject<SleepManagerFormActions> = new BehaviorSubject(SleepManagerFormActions.WAKEUP_TIME);
    public setAction(formAction: SleepManagerFormActions) {
        this._formAction$.next(formAction);
    }
    public get formActionChanged$(): Observable<SleepManagerFormActions> { return this._formAction$.asObservable(); }
    public get formAction(): SleepManagerFormActions { return this._formAction$.getValue(); }



    // private _wakeupTimeNext() {
    //     this._formAction$.next(SleepManagerFormActions.PREV_SLEEP_TIME);
    // }
    // private _prevSleepTimeNext() {

    // }
    // private _sleepDurationNext() {

    // }


    // private _dreamsNext() {

    // }

    // private _nextWakeupNext() {

    // }

    private _finalize$: Subject<boolean> = new Subject();
    private _finalize() {
        this._finalize$.next(true);
    }
    public get finalize$(): Observable<boolean> { return this._finalize$.asObservable(); }

    // private _prevSleepTimeBack() {

    // }
    // private _sleepDurationBack() {

    // }
    // private _dreamsBack() {

    // }
    // private _nextWakeupBack() {

    // }
    // private _nextFallAsleepBack() {

    // }

}