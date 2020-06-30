import * as moment from 'moment';
import { ItemState } from '../../../../../../../shared/utilities/item-state.class';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { TimelogDelineator, TimelogDelineatorType } from '../../../timelog-delineator.class';
import { TSRDrawStatus } from './tsr-draw-status.enum';
import { DaybookTimeScheduleItem } from '../../../../../api/daybook-time-schedule/daybook-time-schedule-item.class';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';

export class TimeSelectionRow {
    constructor(startTime: moment.Moment, endTime: moment.Moment, sectionIndex: number, section: DaybookTimeScheduleItem) {
        this._startTime = startTime;
        this._endTime = endTime;
        this._sectionIndex = sectionIndex;
        if (this._sectionIndex > -1) {
            this._isAvailable = true;
            this._sectionStartTime = moment(section.startTime);
            this._sectionEndTime = moment(section.endTime);
        }

    }

    private _startDragging$: BehaviorSubject<TimeSelectionRow> = new BehaviorSubject(null);
    private _stopDragging$: BehaviorSubject<TimeSelectionRow> = new BehaviorSubject(null);
    private _updateDragging$: BehaviorSubject<TimeSelectionRow> = new BehaviorSubject(null);
    private _deleteDelineator$: Subject<moment.Moment> = new Subject();
    private _editDelineator$: Subject<moment.Moment> = new Subject();
    private _hoverSavedDelineator: boolean = false;

    private _drawDelineator: TimelogDelineator;

    private _delineatorNgStyle: any = {};
    private _gridStyle: any = {};
    private _bodyStyle: any = {};
    private _markedDelineator: TimelogDelineator;

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

    public mouseIsOver: boolean = false;
    public isDragging = false;
    public isEditing = false;
    // private _isDeleting = false;

    public activate() { this._isActiveSection = true; }
    public deactivate() { this._isActiveSection = false; }


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
    public get gridStyle(): any { return this._gridStyle; }
    public get delineatorNgStyle(): any { return this._delineatorNgStyle; }

    public get bodyStyle(): any { return this._bodyStyle; }
    public get diffMS(): number { return this.endTime.diff(this.startTime, 'milliseconds'); }
    public get drawDelineator(): TimelogDelineator { return this._drawDelineator; }

    public get deleteDelineator$(): Observable<moment.Moment> { return this._deleteDelineator$.asObservable(); }
    public get editDelineator$(): Observable<moment.Moment> { return this._editDelineator$.asObservable(); }
    public get startDragging$(): Observable<TimeSelectionRow> { return this._startDragging$.asObservable(); }
    public get updateDragging$(): Observable<TimeSelectionRow> { return this._updateDragging$.asObservable(); }
    public get stopDragging$(): Observable<TimeSelectionRow> { return this._stopDragging$.asObservable(); }

    public get markedDelineator(): TimelogDelineator { return this._markedDelineator; }
    public get markedTime(): string { return this.markedDelineator.time.format('h:mm a') }
    public get hasMarkedDelineator(): boolean {
        if (!this.markedDelineator) {
            return false;
        } else {
            if (this.markedDelineator.delineatorType === TimelogDelineatorType.FRAME_START ||
                this.markedDelineator.delineatorType === TimelogDelineatorType.FRAME_END) {
                return false;
            } else {
                return true;
            }
        }
    }
    public get icon(): IconDefinition { return this._icon; }

    public toString(): string {
        let val: string = this.startTime.format('hh:mm a') + " to " + this.endTime.format('hh:mm a');
        val += "\n\tAvailability section index: " + this.sectionIndex;
        if (this.hasMarkedDelineator) {
            val += "\n\t*Marked delineator: " + this.markedDelineator.time.format('hh:mm a') + " -- " + this.markedDelineator.delineatorType;
        }
        return val;
    }
    public markTimelogDelineator(delineator: TimelogDelineator) {
        if (delineator) {
            this._markedDelineator = delineator;
            this._buildDelineatorsStyle();
            this._tsrDrawStatus = TSRDrawStatus.NOT_DRAWING;
        } else {
            this._markedDelineator = null;
            this._gridStyle = {};
        }
    }

    public deleteDelineator(timelogDelineator: moment.Moment) {
        this._deleteDelineator$.next(timelogDelineator);
    }
    public updateSavedDelineator(newDelineatorTime: moment.Moment) {
        if (newDelineatorTime.isSameOrAfter(this.startTime) && newDelineatorTime.isSameOrBefore(this.endTime)) {
            this._editDelineator$.next(newDelineatorTime);
            this.markTimelogDelineator(new TimelogDelineator(newDelineatorTime, TimelogDelineatorType.SAVED_DELINEATOR));
        } else {

            this._editDelineator$.next(newDelineatorTime);
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
            }
        } else {
            if (this.isAvailable) {
                this._startDragging$.next(this);
            }
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

    public get hoverSavedDelineator(): boolean { return this._hoverSavedDelineator; }
    public onMouseEnterSavedDelineator() {
        this._hoverSavedDelineator = true;
    }
    public onMouseLeaveSavedDelineator() {
        this._hoverSavedDelineator = false;
    }


    // public startDeleting() {
    //     console.log("Start deleting()")
    //     this._isDeleting = true;
    // }

    public reset() {
        this._isActiveSection = false;
        this.isEditing = false;
        // this._isDeleting = false;
        this.isDragging = false;
        this._hoverSavedDelineator = false;
        this.mouseIsOver = false;
        this._drawDelineator = null;
        this._isDrawing = false;
        // this._gridStyle = {};
        // this._bodyStyle = {};
    }



    private _buildDelineatorsStyle() {
        let currentTime = moment(this.startTime);
        if (this.hasMarkedDelineator) {
            if (this.startTime.isSame(this.markedDelineator.time)) {
                this._gridStyle = { 'grid-template-rows': '1fr' };
                this._bodyStyle = { 'grid-row': '1 / span 1' };
            } else {
                const totalMS = moment(this.endTime).diff(this.startTime, 'milliseconds');
                const delineatorMS = moment(this.markedDelineator.time).diff(this.startTime, 'milliseconds');
                if (delineatorMS > 0) {
                    const percent = (delineatorMS / totalMS) * 100;
                    const inversePercent = 100 - percent;
                    this._gridStyle = { 'grid-template-rows': percent.toFixed(0) + '% ' + inversePercent.toFixed(0) + '%' };
                    this._bodyStyle = { 'grid-row': '2 / span 1' };
                } else {
                    console.log('bigtime error')
                }

            }
            const thisType = this.markedDelineator.delineatorType;
            const types = TimelogDelineatorType;
            if (thisType === types.WAKEUP_TIME || thisType === types.FALLASLEEP_TIME) {
                if (thisType === types.WAKEUP_TIME) {
                    this._icon = faSun;
                }
                else { this._icon = faMoon; }
            } else if (thisType === types.NOW) { 
                this._icon = faClock; 
            }
        }
        // console.log("Style is: (grid, body)" , this._gridStyle, this._bodyStyle);
    }

}