import { SleepManagerFormActions } from "./smfa-actions.enum";
import { BehaviorSubject, Subject, Observable } from "rxjs";
import { SleepManager } from "../sleep-manager.class";
import { TimelogEntryActivity } from "../../api/data-items/timelog-entry-activity.interface";
import * as moment from 'moment';

export class SleepManagerForm {
    private _manager: SleepManager;
    constructor(manager: SleepManager) {
        this._manager = manager;
    }

    private _formInputWakeupTime: moment.Moment;
    private _formInputPrevFallAsleep: moment.Moment;
    private _formInputStartEnergyPercent: number;
    private _formInputDreams: string[];
    private _formInputDurationPercent: number;
    private _formInputActivities: TimelogEntryActivity[];
    private _formInputBedTime: moment.Moment;
    private _formInputNextWakeup: moment.Moment;

    private _wakeupTimeIsSet: boolean = false;
    private _prevFallAsleepSet: boolean = false;

    public get wakeupTimeIsSet(): boolean { return this._wakeupTimeIsSet; }
    public get prevFallAsleepTimeIsSet(): boolean { return this._prevFallAsleepSet; }


    public get formInputWakeupTime(): moment.Moment { return this._formInputWakeupTime; }
    public get formInputPrevFallAsleep(): moment.Moment { return this._formInputPrevFallAsleep; } 
    public get formInputStartEnergyPercent(): number { return this._formInputStartEnergyPercent; }
    public get formInputDreams(): string[] { return this._formInputDreams; }
    public get formInputDurationPercent(): number { return this._formInputDurationPercent; }
    public get formInputActivities(): TimelogEntryActivity[] { return this._formInputActivities; }
    public get formInputBedTime(): moment.Moment { return this._formInputBedTime; }
    public get formInputNextWakeup(): moment.Moment { return this._formInputNextWakeup; }

    public setformInputWakeupTime(time: moment.Moment){
        this._formInputWakeupTime = moment(time);
        console.log("Form input wakeup time has been set to: " + time.format('hh:mm a'))
    }
    public setformInputPrevFallAsleep(time: moment.Moment){
        this._formInputPrevFallAsleep = moment(time);
    }

    public onClickForward() {
        if (this.formAction === SleepManagerFormActions.WAKEUP_TIME) { 
            this._wakeupTimeIsSet = true;
            this._formAction$.next(SleepManagerFormActions.PREV_SLEEP_TIME); }
        else if (this.formAction === SleepManagerFormActions.PREV_SLEEP_TIME) { 
            this._prevFallAsleepSet = true;
            this._formAction$.next(SleepManagerFormActions.SLEEP_DURATION); 
        }
        else if (this.formAction === SleepManagerFormActions.SLEEP_DURATION) { this._formAction$.next(SleepManagerFormActions.DREAMS); }
        else if (this.formAction === SleepManagerFormActions.DREAMS) { this._formAction$.next(SleepManagerFormActions.NEXT_WAKEUP_TIME); }
        else if (this.formAction === SleepManagerFormActions.NEXT_WAKEUP_TIME) { this._formAction$.next(SleepManagerFormActions.BEDTIME); }
        else if (this.formAction === SleepManagerFormActions.BEDTIME) { this._nextFallAsleepNext(); }
    }


    public onClickBack() {
        if (this.formAction === SleepManagerFormActions.PREV_SLEEP_TIME) { this._formAction$.next(SleepManagerFormActions.WAKEUP_TIME); }
        else if (this.formAction === SleepManagerFormActions.SLEEP_DURATION) { this._formAction$.next(SleepManagerFormActions.PREV_SLEEP_TIME); }
        else if (this.formAction === SleepManagerFormActions.DREAMS) { this._formAction$.next(SleepManagerFormActions.SLEEP_DURATION); }
        else if (this.formAction === SleepManagerFormActions.NEXT_WAKEUP_TIME) { this._formAction$.next(SleepManagerFormActions.DREAMS); }
        else if (this.formAction === SleepManagerFormActions.BEDTIME) { this._formAction$.next(SleepManagerFormActions.NEXT_WAKEUP_TIME); }
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
    private _nextFallAsleepNext() {
        console.log("final action")
    }

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