import * as moment from 'moment';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { TimelogDelineator, TimelogDelineatorType } from '../timelog-delineator.class';
import { TSRDrawStatus } from './tsr-draw-status.enum';
import { DaybookTimeScheduleItem } from '../../../../../display-manager/daybook-time-schedule/daybook-time-schedule-item.class';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { TimeInput } from '../../../../../../../shared/components/time-input/time-input.class';

export class TimeSelectionRow {
    constructor(startTime: moment.Moment, endTime: moment.Moment, sectionIndex: number, section: DaybookTimeScheduleItem) {
        this._startTime = startTime;
        this._endTime = endTime;
        this._sectionIndex = sectionIndex;
        if (this._sectionIndex > -1) {
            this._isAvailable = true;
            this._sectionStartTime = moment(section.schedItemStartTime);
            this._sectionEndTime = moment(section.schedItemEndTime);
        }
    }

    private _startDragging$: BehaviorSubject<TimeSelectionRow> = new BehaviorSubject(null);
    private _stopDragging$: BehaviorSubject<TimeSelectionRow> = new BehaviorSubject(null);
    private _updateDragging$: BehaviorSubject<TimeSelectionRow> = new BehaviorSubject(null);
    private _deleteDelineator$: Subject<moment.Moment> = new Subject();
    private _editDelineator$: Subject<{ prevVal: moment.Moment, nextVal: moment.Moment }> = new Subject();

    private _delineatorNgStyle: any = {};
    private _delineatorNgClass: any = {};
    private _gridNgStyle: any = {};

    private _markedDelineator: TimelogDelineator;
    private _hoverSavedDelineator: boolean = false;
    private _drawDelineator: TimelogDelineator;

    private _sectionIndex: number = -1;
    private _sectionEndTime: moment.Moment;
    private _sectionStartTime: moment.Moment;

    private _isAvailable: boolean = false;
    private _isActiveSection: boolean = false;
    private _isDrawing: boolean = false;

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _tsrDrawStatus: TSRDrawStatus;
    private _icon: IconDefinition = null;

    private _timeInput: TimeInput;

    public mouseIsOver: boolean = false;
    public isDragging = false;
    public isEditing = false;

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    public get sectionStartTime(): moment.Moment { return this._sectionStartTime; }
    public get sectionEndTime(): moment.Moment { return this._sectionEndTime; }
    public get sectionIndex(): number { return this._sectionIndex; }

    public get isAvailable(): boolean { return this._isAvailable; }
    public get isDrawing(): boolean { return this._isDrawing; }
    public get isActiveSection(): boolean { return this._isActiveSection; };
    public get tsrDrawStatus(): TSRDrawStatus { return this._tsrDrawStatus; }

    public get existingNotDrawing(): boolean { return this.tsrDrawStatus === TSRDrawStatus.NOT_DRAWING; }
    public get drawingNew(): boolean { return this.tsrDrawStatus === TSRDrawStatus.DRAWING_NEW; }
    public get drawingOverExisting(): boolean { return this.tsrDrawStatus === TSRDrawStatus.DRAWING_OVER; }

    public get delineatorNgStyle(): any { return this._delineatorNgStyle; }
    public get delineatorNgClass(): any { return this._delineatorNgClass; }

    public get gridNgStyle(): any { return this._gridNgStyle; }
    public get diffMS(): number { return this.endTime.diff(this.startTime, 'milliseconds'); }
    public get drawDelineator(): TimelogDelineator { return this._drawDelineator; }

    public get deleteDelineator$(): Observable<moment.Moment> { return this._deleteDelineator$.asObservable(); }
    public get editDelineator$(): Observable<{ prevVal: moment.Moment, nextVal: moment.Moment }> {
        return this._editDelineator$.asObservable();
    }
    public get startDragging$(): Observable<TimeSelectionRow> { return this._startDragging$.asObservable(); }
    public get updateDragging$(): Observable<TimeSelectionRow> { return this._updateDragging$.asObservable(); }
    public get stopDragging$(): Observable<TimeSelectionRow> { return this._stopDragging$.asObservable(); }

    public get markedDelineator(): TimelogDelineator { return this._markedDelineator; }
    public get markedTime(): string { return this.markedDelineator.time.format('h:mm a') }
    public get hasMarkedDelineator(): boolean {
        if (!this.markedDelineator) {
            return false;
        } else {
            if (this.markedDelineator.delineatorType === TimelogDelineatorType.DISPLAY_START ||
                this.markedDelineator.delineatorType === TimelogDelineatorType.DISPLAY_END) {
                return false;
            } else {
                return true;
            }
        }
    }
    public get icon(): IconDefinition { return this._icon; }
    public get hoverSavedDelineator(): boolean { return this._hoverSavedDelineator; }

    public get timeInput(): TimeInput { return this._timeInput; }

    public activate() { this._isActiveSection = true; }
    public deactivate() { this._isActiveSection = false; }

    public toString(): string {
        let val: string = this.startTime.format('hh:mm a') + ' to ' + this.endTime.format('hh:mm a');
        val += '\n\tAvailability section index: ' + this.sectionIndex;
        if (this.hasMarkedDelineator) {
            val += '\n\t*Marked delineator: ' +
                this.markedDelineator.time.format('hh:mm a') + ' -- ' + this.markedDelineator.delineatorType;
        }
        return val;
    }
    public markTimelogDelineator(delineator: TimelogDelineator) {
        if (delineator) {
            this._markedDelineator = delineator;
            this._buildDelineatorsStyle();
            this._tsrDrawStatus = TSRDrawStatus.NOT_DRAWING;
            this._timeInput = new TimeInput(this._markedDelineator.time);
            this._timeInput.showDate = false;
            this._timeInput.incrementMinutes = 1;
        } else {
            this._markedDelineator = null;
            this._gridNgStyle = {};
        }

    }
    public deleteDelineator(timelogDelineator: moment.Moment) {
        this._deleteDelineator$.next(timelogDelineator);
    }
    public updateSavedDelineator() {
        const newValue: moment.Moment = this._timeInput.timeValue;
        if (newValue.isSameOrAfter(this.startTime) && newValue.isSameOrBefore(this.endTime)) {
            this._editDelineator$.next({ prevVal: this.markedDelineator.time, nextVal: newValue });
            this.markTimelogDelineator(new TimelogDelineator(newValue, TimelogDelineatorType.SAVED_DELINEATOR));
        } else {
            this._editDelineator$.next({ prevVal: this.markedDelineator.time, nextVal: newValue });
            this.markTimelogDelineator(null);
        }
    }
    public onDrawTLEDelineators(drawStart: moment.Moment, drawEnd?: moment.Moment) {
        this._drawDelineator = null;
        const hasExisting = this.markedDelineator;
        let isSameAsStart: boolean = this.startTime.isSame(drawStart);
        if (this.hasMarkedDelineator) {
            if (this.markedDelineator.time.isSame(drawStart)) {
                isSameAsStart = true;
            }
        }
        let isSameAsEnd: boolean = false;
        if (drawEnd) {
            isSameAsEnd = this.startTime.isSame(drawEnd);
            if (this.hasMarkedDelineator) {
                if (this.markedDelineator.time.isSame(drawEnd)) {
                    isSameAsEnd = true;
                }
            }
        }
        this._isDrawing = isSameAsStart || isSameAsEnd;
        if (hasExisting && this._isDrawing) {
            //case: drawing over existing
            // this._drawDelineator = new TimelogDelineator(this.startTime, TimelogDelineatorType.SAVED_DELINEATOR);
            this._drawDelineator = null;
            this._tsrDrawStatus = TSRDrawStatus.DRAWING_OVER;
        } else if (!hasExisting && this._isDrawing) {
            this._drawDelineator = new TimelogDelineator(this.startTime, TimelogDelineatorType.SAVED_DELINEATOR);
            this._tsrDrawStatus = TSRDrawStatus.DRAWING_NEW;
        } else if (!this._isDrawing) {
            this._drawDelineator = null;
            this._tsrDrawStatus = TSRDrawStatus.NOT_DRAWING;
        }
    }
    public onMouseDown() {
        if (this.markedDelineator) {
            if (this.markedDelineator.delineatorType === TimelogDelineatorType.SAVED_DELINEATOR) {
                this.isEditing = true;
            } else if (this.markedDelineator.delineatorType === TimelogDelineatorType.DAY_STRUCTURE) {
                if (this.isAvailable) { this._startDragging$.next(this); }
            }
        } else {
            if (this.isAvailable) { this._startDragging$.next(this); }
        }
    }
    public onMouseUp(startRow: TimeSelectionRow) {
        if (this.isEditing) {
        } else {
            if (startRow) {
                this._stopDragging$.next(this);
            }
        }
    }
    public onMouseEnter(startRow: TimeSelectionRow) {
        if (startRow) {
            this._updateDragging$.next(this);
            this.isDragging = true;
        }
    }
    public onMouseLeave(startRow: TimeSelectionRow) {
        this.mouseIsOver = false;
        this.isEditing = false;
        // this._isDeleting = false;
        this._hoverSavedDelineator = false;
    }
    public hideSavedDelineator() {
        this.markTimelogDelineator(null);
    }
    public onMouseEnterSavedDelineator() {
        this._hoverSavedDelineator = true;
    }
    public onMouseLeaveSavedDelineator() {
        this._hoverSavedDelineator = false;
    }

    public reset() {
        this._isActiveSection = false;
        this.isEditing = false;
        this.isDragging = false;
        this._hoverSavedDelineator = false;
        this.mouseIsOver = false;
        this._drawDelineator = null;
        this._isDrawing = false;
    }

    private _buildDelineatorsStyle() {
        if (this.hasMarkedDelineator) {
            if (this.startTime.isSame(this.markedDelineator.time)) {
                this._gridNgStyle = { 'grid-template-rows': '1fr' };
                this._delineatorNgStyle = { 'grid-row': '1 / span 1' };
            } else {
                const totalMS = moment(this.endTime).diff(this.startTime, 'milliseconds');
                const delineatorMS = moment(this.markedDelineator.time).diff(this.startTime, 'milliseconds');
                if (delineatorMS > 0) {
                    const percent = (delineatorMS / totalMS) * 100;
                    const inversePercent = 100 - percent;
                    this._gridNgStyle = { 'grid-template-rows': percent.toFixed(0) + '% ' + inversePercent.toFixed(0) + '%' };
                    this._delineatorNgStyle = { 'grid-row': '2 / span 1' };
                } else {
                    console.log('bigtime error')
                }

            }
            // console.log("DELINEATOR GRID STYLE: " + this.toString() +"\n\t", this._gridNgStyle)
            const thisType = this.markedDelineator.delineatorType;
            if (thisType === TimelogDelineatorType.WAKEUP_TIME || thisType === TimelogDelineatorType.FALLASLEEP_TIME) {
                if (thisType === TimelogDelineatorType.WAKEUP_TIME) {
                    this._icon = faSun;
                    this._delineatorNgClass = ['delineator-wake-up'];
                }
                else {
                    this._icon = faMoon;
                    this._delineatorNgClass = ['delineator-fall-asleep'];
                }
            } else if (thisType === TimelogDelineatorType.NOW) {
                this._icon = faClock;
                this._delineatorNgClass = ['delineator-now'];
            } else if (thisType === TimelogDelineatorType.DAY_STRUCTURE) {
                this._delineatorNgClass = ['delineator-day-structure'];
            } else if (thisType === TimelogDelineatorType.TIMELOG_ENTRY_START || thisType === TimelogDelineatorType.TIMELOG_ENTRY_END) {
                this._delineatorNgClass = ['delineator-timelog-entry'];
            } else if (thisType === TimelogDelineatorType.SAVED_DELINEATOR) {
                this._delineatorNgClass = ['delineator-saved'];
            }
        }
        // console.log("Style is: (grid, body)" , this._gridStyle, this._bodyStyle);
    }

}
