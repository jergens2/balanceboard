import * as moment from 'moment';
import { ItemState } from '../../../../../../../shared/utilities/item-state.class';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { TimelogDelineator, TimelogDelineatorType } from '../../../timelog-delineator.class';

export class TimeSelectionRow {
    constructor(startTime: moment.Moment, endTime: moment.Moment, sectionIndex: number) {
        this.startTime = startTime;
        this.endTime = endTime;
        this._sectionIndex = sectionIndex;
        if(this._sectionIndex > -1){
            this._isAvailable = true;
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
    private _isAvailable: boolean = false;

    public earliestAvailability: moment.Moment;
    public latestAvailability: moment.Moment;

    public startTime: moment.Moment;
    public endTime: moment.Moment;

    public mouseIsOver: boolean = false;
    

    private _isActiveSection: boolean = false;
    public activate(){this._isActiveSection = true;}
    public deactivate(){this._isActiveSection = false;}
    public get isActiveSection(): boolean { return this._isActiveSection; };

    public isDragging = false;

    public isEditing = false;
    public isDeleting = false;
    private _isDrawing: boolean = false;

    // public get ngClass(): any {
    //     return {
    //         'sleep-delineator': this.isSleepDelineator,
    //         'saved-delineator': this.isSavedDelineator,
    //         'push-backwards': this.isDragging,
    //         'is-drawing': this._isDrawing
    //     };
    // }
    public get sectionIndex(): number { return this._sectionIndex; }

    public get deleteDelineator$(): Observable<moment.Moment> { return this._deleteDelineator$.asObservable(); }
    public get editDelineator$(): Observable<moment.Moment> { return this._editDelineator$.asObservable(); }
    public get startDragging$(): Observable<TimeSelectionRow> { return this._startDragging$.asObservable(); }
    public get updateDragging$(): Observable<TimeSelectionRow> { return this._updateDragging$.asObservable(); }
    public get stopDragging$(): Observable<TimeSelectionRow> { return this._stopDragging$.asObservable(); }

    public get markedDelineator(): TimelogDelineator { return this._markedDelineator; }
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
    public get isAvailable(): boolean { return this._isAvailable; }
    public get isDrawing(): boolean { return this._isDrawing; }

    public get existingNotDrawing(): boolean { return !this.isDrawing && this.hasMarkedDelineator;}
    public get drawingNew(): boolean { return this.isDrawing && !this.hasMarkedDelineator;}
    public get drawingOverExisting(): boolean { return this.isDrawing && this.hasMarkedDelineator;}

    public get isSleepDelineator(): boolean {
        if (this.markedDelineator) {
            return this.markedDelineator.isSleepDelineator;
        }
        return false;
    }
    public get isSavedDelineator(): boolean {
        if (this.markedDelineator) {
            return this.markedDelineator.isSaved
        }
        return false;
    }

    public get gridStyle(): any { return this._gridStyle; }
    public get delineatorNgStyle(): any { return this._delineatorNgStyle; }

    public get bodyStyle(): any { return this._bodyStyle; }
    public get diffMS(): number { return this.endTime.diff(this.startTime, 'milliseconds'); }


    public get drawDelineator(): TimelogDelineator { return this._drawDelineator; }

    public get showNowDelineator(): boolean {
        if (this.markedDelineator) {
            if (this.markedDelineator.delineatorType === TimelogDelineatorType.NOW) {
                return true;
            }
        }
        return false;
    }
    public toString(): string { 
        let val: string = this.startTime.format('hh:mm a') + " to " + this.endTime.format('hh:mm a');
        val += "\n\tAvailability section index: " + this.sectionIndex; 
        if(this.hasMarkedDelineator){
            val+="\n\t*Marked delineator: " + this.markedDelineator.time.format('hh:mm a') + " -- " + this.markedDelineator.delineatorType;
        }
        return val;
    }
    public markTimelogDelineator(delineator: TimelogDelineator) {
        if (delineator) {
            this._markedDelineator = delineator;
            this._buildDelineatorsStyle();
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


    // public stopDrawing(){
    //     this._isDrawing = false;
    //     this._drawDelineator = null;
    // }
    public onDrawTLEDelineators(drawStart: moment.Moment, drawEnd?: moment.Moment) {
        this._drawDelineator = null;
        const hasExisting = this.markedDelineator;
        const isSameAsStart: boolean = this.startTime.isSame(drawStart);
        let isSameAsEnd: boolean = false;
        if(drawEnd){
            isSameAsEnd = this.startTime.isSame(drawEnd);
        }
        this._isDrawing = isSameAsStart || isSameAsEnd;


        if(hasExisting && this._isDrawing){
            //case: drawing over existing
            // console.log("DRAWING OVER EXISTING: " + this.startTime.format('hh:mm a'));
            // this._drawDelineator = new TimelogDelineator(this.startTime, TimelogDelineatorType.SAVED_DELINEATOR);
            this._drawDelineator = null;
        }else if(!hasExisting && this._isDrawing){
            // console.log("DRAWING NEW: " + this.startTime.format('hh:mm a'));
            this._drawDelineator = new TimelogDelineator(this.startTime, TimelogDelineatorType.SAVED_DELINEATOR);
        }else if(!this._isDrawing){
            this._drawDelineator = null;
        }
    }
    public onMouseDown() {
        if (this.markedDelineator) {
            if (this.isDeleting) {
                this._deleteDelineator$.next(this.markedDelineator.time);
            } else if (this.markedDelineator.delineatorType === TimelogDelineatorType.SAVED_DELINEATOR) {
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
        this.markTimelogDelineator(null);
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
        this._isActiveSection = false;
        this.isEditing = false;
        this.isDeleting = false;
        this.isDragging = false;
        this._hoverSavedDelineator = false;
        this.mouseIsOver = false;
        this._drawDelineator = null;
        this._isDrawing = false;
        // this._gridStyle = {};
        // this._bodyStyle = {};
    }




    private _buildDelineatorsStyle() {
        // let currentTime = moment(this.startTime);
        if (this.markedDelineator) {

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
                // this._delineatorNgStyle = {
                //     'color': 'navy',
                //     'cursor':'pointer'
                // };
            } else if (thisType === types.TIMELOG_ENTRY_START || thisType === types.TIMELOG_ENTRY_END) {
                // this._delineatorNgStyle = {
                // 'background-color': 'lime',
                // };
            } else if (thisType === types.SAVED_DELINEATOR) {
                // this._delineatorNgStyle = {
                //     'color': 'darkblue',
                //     'cursor': 'pointer'
                // };
            }
        }

        // console.log("Style is: (grid, body)" , this._gridStyle, this._bodyStyle);
    }

}