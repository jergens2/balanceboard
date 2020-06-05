import * as moment from 'moment';
import { ItemState } from '../../../../../../../shared/utilities/item-state.class';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { TimelogDelineator, TimelogDelineatorType } from '../../../timelog-delineator.class';
import { TimeScheduleOldnComplicated } from '../../../../../../../shared/utilities/time-utilities/time-schedule-old-complicated.class';
import { TimeScheduleItem } from '../../../../../../../shared/utilities/time-utilities/time-schedule-item.class';

export class TimeSelectionRow {
    constructor(startTime: moment.Moment, endTime: moment.Moment, rowIndex: number) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.rowIndex = rowIndex;


    }

    private _startDragging$: BehaviorSubject<TimeSelectionRow> = new BehaviorSubject(null);
    private _stopDragging$: BehaviorSubject<TimeSelectionRow> = new BehaviorSubject(null);
    private _updateDragging$: BehaviorSubject<TimeSelectionRow> = new BehaviorSubject(null);
    private _hoverSavedDelineator: boolean = false;

    private _drawDelineator: TimelogDelineator;

    private _delineatorNgStyle: any = {};
    private _gridStyle: any = {};
    private _bodyStyle: any = {};
    private _timelogDelineator: TimelogDelineator;

    private _deleteDelineator$: Subject<moment.Moment> = new Subject();
    private _editDelineator$: Subject<moment.Moment> = new Subject();

    public sectionIndex: number = -1;
    public earliestAvailability: moment.Moment;
    public latestAvailability: moment.Moment;

    public startTime: moment.Moment;
    public endTime: moment.Moment;

    public mouseIsOver: boolean = false;
    public rowIndex: number;
    public isAvailable = false;
    public isGrabbingSection = false;
    public isDragging = false;

    public isEditing = false;
    public isDeleting = false;
    public ngClassIsDrawing = false;

    public get deleteDelineator$(): Observable<moment.Moment> { return this._deleteDelineator$.asObservable(); }
    public get editDelineator$(): Observable<moment.Moment> { return this._editDelineator$.asObservable(); }
    public get startDragging$(): Observable<TimeSelectionRow> { return this._startDragging$.asObservable(); }
    public get updateDragging$(): Observable<TimeSelectionRow> { return this._updateDragging$.asObservable(); }
    public get stopDragging$(): Observable<TimeSelectionRow> { return this._stopDragging$.asObservable(); }

    public get timelogDelineator(): TimelogDelineator { return this._timelogDelineator; }

    public get gridStyle(): any { return this._gridStyle; }
    public get delineatorNgStyle(): any { return this._delineatorNgStyle; }

    public get bodyStyle(): any { return this._bodyStyle; }
    public get diffMS(): number { return this.endTime.diff(this.startTime, 'milliseconds'); }


    public get drawDelineator(): TimelogDelineator { return this._drawDelineator; }
    public get showTimelogDelineator(): boolean {
        if (this.timelogDelineator) {
            const doNotShow: TimelogDelineatorType[] = [
                TimelogDelineatorType.FRAME_START,
                TimelogDelineatorType.FRAME_END,
                TimelogDelineatorType.NOW
            ];
            if (!this.isEditing && doNotShow.indexOf(this.timelogDelineator.delineatorType) === -1) {
                return true;
            }
        }
        return false;
    }
    public get showNowDelineator(): boolean {
        if (this.timelogDelineator) {
            if (this.timelogDelineator.delineatorType === TimelogDelineatorType.NOW) {
                return true;
            }
        }
        return false;
    }
    public setDelineator(delineator: TimelogDelineator) {
        if (delineator) {
            this._timelogDelineator = delineator;
            this._buildDelineatorsStyle();
        } else {
            this._timelogDelineator = null;
            this._gridStyle = {};
        }
        // if (this.timelogDelineator) {
        //     console.log("TIME LOG DELINEATOR:  " + this.timelogDelineator.time.format('hh:mm a') + " : " + this.timelogDelineator.delineatorType)
        // }
    }

    public deleteDelineator(timelogDelineator: moment.Moment) {
        this._deleteDelineator$.next(timelogDelineator);
    }
    public updateSavedDelineator(newDelineatorTime: moment.Moment) {
        if (newDelineatorTime.isSameOrAfter(this.startTime) && newDelineatorTime.isSameOrBefore(this.endTime)) {
            this._editDelineator$.next(newDelineatorTime);
            this.setDelineator(new TimelogDelineator(newDelineatorTime, TimelogDelineatorType.SAVED_DELINEATOR));
        } else {

            this._editDelineator$.next(newDelineatorTime);
            this.setDelineator(null);
        }
    }


    public onDrawDelineator(drawStart: moment.Moment, drawEnd?: moment.Moment) {
        // console.log("DRAWING THE DELINEATOR IN THE ROW")

        if (drawStart && drawEnd) {
            if (this.timelogDelineator) {
                if (this.timelogDelineator.time.isSame(drawStart) || this.timelogDelineator.time.isSame(drawEnd)) {
                    this.ngClassIsDrawing = true;
                } else {
                    this.ngClassIsDrawing = false;
                }
                this._drawDelineator = null;
            } else {
                this.ngClassIsDrawing = false;

                if (drawStart.isSame(this.startTime) || drawEnd.isSame(this.startTime)) {
                    this._drawDelineator = new TimelogDelineator(this.startTime, TimelogDelineatorType.SAVED_DELINEATOR);

                } else if (drawStart.isAfter(this.startTime) && drawStart.isBefore(this.endTime)) {
                    this._drawDelineator = new TimelogDelineator(drawStart, TimelogDelineatorType.SAVED_DELINEATOR);
                } else if (drawEnd.isAfter(this.startTime) && drawEnd.isBefore(this.endTime)) {
                    this._drawDelineator = new TimelogDelineator(drawEnd, TimelogDelineatorType.SAVED_DELINEATOR);
                } else {
                    this._drawDelineator = null;
                }
            }
        } else if (drawStart && !drawEnd) {
            if (this.timelogDelineator) {
                if (this.timelogDelineator.time.isSame(drawStart)) {
                    this.ngClassIsDrawing = true;
                } else {
                    this.ngClassIsDrawing = false;
                }
            } else {
                this.ngClassIsDrawing = false;
                if (this.startTime.isSame(drawStart)) {
                    this._drawDelineator = new TimelogDelineator(drawStart, TimelogDelineatorType.SAVED_DELINEATOR);
                } else {
                    this._drawDelineator = null;
                }
            }
        } else {
            console.log('Error in method TimeSelectionRow.onDrawDelineator(): param values are null')
            this._drawDelineator = null;
            this.ngClassIsDrawing = false;
        }
    }
    public onMouseDown() {
        if (this.timelogDelineator) {
            if (this.isDeleting) {
                this._deleteDelineator$.next(this.timelogDelineator.time);
            } else if (this.timelogDelineator.delineatorType === TimelogDelineatorType.SAVED_DELINEATOR) {
                this.isEditing = true;
            }
        } else {
            if (this.isAvailable) {
                this._startDragging$.next(this);
            }
        }
    }
    public onMouseUp(startRow: TimeSelectionRow) {
        if (this.isEditing || this.isDeleting) {

        } else {
            if (startRow) {
                if (this.isDeleting) {
                    // console.log("this.isDeleting === true", this.isDeleting);
                } else if (this.isEditing) {
                    // console.log("this.isEditing === true, ", this.isEditing);
                } else {
                    // console.log("Neither deleting or editing, so STOP DRAGGING");
                    this._stopDragging$.next(this);
                }

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
        this.isDeleting = false;
        this._hoverSavedDelineator = false;
    }


    public hideSavedDelineator() {
        this.setDelineator(null);
    }

    public get hoverSavedDelineator(): boolean { return this._hoverSavedDelineator; }
    public onMouseEnterSavedDelineator() {
        this._hoverSavedDelineator = true;
    }
    public onMouseLeaveSavedDelineator() {
        this._hoverSavedDelineator = false;
    }


    public startDeleting() {
        this.isDeleting = true;
    }

    public reset() {
        this.isGrabbingSection = false;
        this.isEditing = false;
        this.isDeleting = false;
        this.isDragging = false;
        this._hoverSavedDelineator = false;
        this.mouseIsOver = false;
        this._drawDelineator = null;
        this.ngClassIsDrawing = false;
        // this._gridStyle = {};
        // this._bodyStyle = {};
    }




    private _buildDelineatorsStyle() {
        // let currentTime = moment(this.startTime);
        if (this.timelogDelineator) {

            if (this.startTime.isSame(this.timelogDelineator.time)) {
                this._gridStyle = { 'grid-template-rows': '1fr' };
                this._bodyStyle = { 'grid-row': '1 / span 1' };
            } else {
                const totalMS = moment(this.endTime).diff(this.startTime, 'milliseconds');
                const delineatorMS = moment(this.timelogDelineator.time).diff(this.startTime, 'milliseconds');
                if (delineatorMS > 0) {
                    const percent = (delineatorMS / totalMS) * 100;
                    const inversePercent = 100 - percent;
                    this._gridStyle = { 'grid-template-rows': percent.toFixed(0) + '% ' + inversePercent.toFixed(0) + '%' };
                    this._bodyStyle = { 'grid-row': '2 / span 1' };
                } else {
                    console.log('bigtime error')
                }

            }

            const thisType = this.timelogDelineator.delineatorType;
            const types = TimelogDelineatorType;
            if (thisType === types.WAKEUP_TIME || thisType === types.FALLASLEEP_TIME) {
                // this._delineatorNgStyle = {
                //     'color': 'navy',
                //     'cursor':'pointer'
                // };
            } else if (thisType === types.TIMELOG_ENTRY_START || thisType === types.TIMELOG_ENTRY_END) {
                // this._delineatorNgStyle = {
                // 'background-color': 'lime',
                // };
            } else if (thisType === types.SAVED_DELINEATOR) {
                this._delineatorNgStyle = {
                    'color': 'darkblue',
                    'cursor': 'pointer'
                };
            }
        }

        // console.log("Style is: (grid, body)" , this._gridStyle, this._bodyStyle);
    }

}