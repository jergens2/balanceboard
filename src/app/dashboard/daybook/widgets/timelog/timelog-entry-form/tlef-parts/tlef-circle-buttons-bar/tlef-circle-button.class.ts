import { TLEFFormCase } from '../../tlef-form-case.enum';
import { DaybookTimeScheduleStatus } from '../../../../../display-manager/daybook-time-schedule/daybook-time-schedule-status.enum';
import { Subject } from 'rxjs';

export class TLEFCircleButton {

    private _formCase: TLEFFormCase;
    private _itemIndex: number = -1;
    private _backgroundColor: string = "";
    private _mouseIsOver: boolean = false;
    private _clickedIndex$: Subject<number> = new Subject();
    private _scheduleStatus: DaybookTimeScheduleStatus;
    private _isCurrent: boolean = false;

    public get scheduleStatus(): DaybookTimeScheduleStatus { return this._scheduleStatus; }
    public get isSleepStatus(): boolean { return this.scheduleStatus === DaybookTimeScheduleStatus.SLEEP; }
    public get isActiveStatus(): boolean { return this.scheduleStatus === DaybookTimeScheduleStatus.ACTIVE; }
    public get isAvailableStatus(): boolean { return this.scheduleStatus === DaybookTimeScheduleStatus.AVAILABLE; }
    public get itemIndex(): number { return this._itemIndex; }
    public get mouseIsOver(): boolean { return this._mouseIsOver; }
    public get backgroundColor(): string { return this._backgroundColor; }
    public get formCase(): TLEFFormCase { return this._formCase; }
    // public get caseIsNewCurrent(): boolean { return this.formCase === TLEFFormCase.NEW_CURRENT; }
    // public get caseIsNewCurrentFuture(): boolean { return this.formCase === TLEFFormCase.NEW_CURRENT_FUTURE; }
    public get clickedIndex$() { return this._clickedIndex$.asObservable(); }
    public get isCurrent(): boolean { return this._isCurrent; }

    public isCurrentlyOpen: boolean = false;

    // public isDrawing: boolean = false;

    constructor(itemIndex: number, scheduleStatus: DaybookTimeScheduleStatus, formCase: TLEFFormCase, backgroundColor: string) {
        this._itemIndex = itemIndex;
        this._scheduleStatus = scheduleStatus;
        this._formCase = formCase;
        this._backgroundColor = backgroundColor;
    }

    public setAsCurrent() { this._isCurrent = true; }

    public onMouseEnter() { this._mouseIsOver = true; }
    public onMouseLeave() { this._mouseIsOver = false; }
    public onClick() { this._clickedIndex$.next(this.itemIndex); }

}
