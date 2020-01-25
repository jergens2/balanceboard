import * as moment from 'moment';
import { ItemState } from '../../../../../../../shared/utilities/item-state.class';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { TimelogDelineator } from '../../../timelog-delineator.class';
import { TimeSchedule } from '../../../../../../../shared/utilities/time-utilities/time-schedule.class';
import { TimeScheduleItem } from '../../../../../../../shared/utilities/time-utilities/time-schedule-item.class';

export class TimeSelectionRow {
    constructor(startTime: moment.Moment, endTime: moment.Moment, rowIndex: number) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.rowIndex = rowIndex;
    }


    public mouseIsOver: boolean = false;
    private _startDragging$: BehaviorSubject<TimeSelectionRow> = new BehaviorSubject(null);
    private _stopDragging$: BehaviorSubject<TimeSelectionRow> = new BehaviorSubject(null);
    private _updateDragging$: BehaviorSubject<TimeSelectionRow> = new BehaviorSubject(null);
    private _hoverSavedDelineator: boolean = false;
    // private _mouseIsDown = false;
    // private _mouseDown$: Subject<boolean> = new Subject();
    // private _mouseUp$: Subject<boolean> = new Subject();

    private _drawDelineator: TimelogDelineator;

    private _savedDelineatorStyle: any = { 'grid-template-rows': "1fr", };
    private _savedDelineatorTime: moment.Moment;

    private _deleteDelineator$: Subject<moment.Moment> = new Subject();
    private _editDelineator$: Subject<moment.Moment> = new Subject();

    public sectionIndex: number = -1;
    public earliestAvailability: moment.Moment;
    public latestAvailability: moment.Moment;
     

    public startTime: moment.Moment;
    public endTime: moment.Moment;

    public rowIndex: number;
    public isAvailable = false;
    public isGrabbingSection = false; 

    public isEditing = false;
    public isDeleting = false;


    public get deleteDelineator$(): Observable<moment.Moment> { return this._deleteDelineator$.asObservable(); }
    public get editDelineator$(): Observable<moment.Moment> { return this._editDelineator$.asObservable(); }
    public get startDragging$(): Observable<TimeSelectionRow> { return this._startDragging$.asObservable(); }
    public get updateDragging$(): Observable<TimeSelectionRow> { return this._updateDragging$.asObservable(); }
    public get stopDragging$(): Observable<TimeSelectionRow> { return this._stopDragging$.asObservable(); }


    public setDelineator(delineator: moment.Moment) {
        if (delineator) {
            this._savedDelineatorTime = moment(delineator);
            this._buildDelineatorsStyle();
        }else{
            this._savedDelineatorTime = null;
            this._savedDelineatorStyle = null;
        }
        
    }
    public updateSavedDelineator(newDelineatorTime: moment.Moment){
        if(newDelineatorTime.isSameOrAfter(this.startTime) && newDelineatorTime.isSameOrBefore(this.endTime)){
            this._editDelineator$.next(newDelineatorTime);
            this.setDelineator(newDelineatorTime);
        }else{

            this._editDelineator$.next(newDelineatorTime);
            this.setDelineator(null);
        }
    }
    public get savedDelineatorTime(): moment.Moment { return this._savedDelineatorTime; }

    public get delineatorStyle(): any { return this._savedDelineatorStyle; }

    public get diffMS(): number { return this.endTime.diff(this.startTime, 'milliseconds'); }

    // public get mouseIsDown(): boolean { return this._mouseIsDown; }
    // public get mouseDown$(): Observable<boolean> { return this._mouseDown$.asObservable(); }
    // public get mouseUp$(): Observable<boolean> { return this._mouseUp$.asObservable(); }

    public get drawDelineator(): TimelogDelineator { return this._drawDelineator; }

    public onDrawDelineator(newDelineator: TimelogDelineator) {
        // console.log("DRAWING THE DELINEATOR IN THE ROW")
        this._drawDelineator = newDelineator;
    }
    public startEditing(){
        this.isEditing = true;
    }

    public onMouseDown() {

        if(this.isDeleting || this.isEditing){
            if(this.isDeleting){
                console.log('we deleting')
                if(this.savedDelineatorTime){
                    this._deleteDelineator$.next(this.savedDelineatorTime); 
                }else{
                    console.log('Bigtime error with saved delineator.')
                }
                
            }else if(this.isEditing){
                console.log('we editing')
                // this.isEditing = true;
                console.log(this.savedDelineatorTime.toISOString())
                console.log(this.savedDelineatorTime.format('hh:mm a'))
                console.log(this.savedDelineatorTime.format('HH:mm'))
            }

            
        }else{
            if(this.isAvailable){
                console.log("Row Class: Start dragging")
                this._startDragging$.next(this);
            }
        }
    }
    public onMouseUp(startRow: TimeSelectionRow) {
        console.log("mouse up", startRow)
        if(this.isEditing || this.isDeleting){

        }else{
            if(startRow){
                if(this.isDeleting){
                    console.log("this.isDeleting === true", this.isDeleting);
                }else if(this.isEditing){
                    console.log("this.isEditing === true, ", this.isEditing);
                }else{
                    console.log("Neither deleting or editing, so STOP DRAGGING");
                    this._stopDragging$.next(this);
                } 
    
            }
        }
        
    }
    public onMouseEnter(startRow: TimeSelectionRow) {
        if(startRow){
            if(this.sectionIndex === startRow.sectionIndex){
                this._updateDragging$.next(this);
            }else{

            }
        }
    }


    public hideSavedDelineator(){
        this.setDelineator(null);
    }

    public get hoverSavedDelineator(): boolean { return this._hoverSavedDelineator; }
    public onMouseEnterSavedDelineator(){
        this._hoverSavedDelineator = true;
    }
    public onMouseLeaveSavedDelineator(){
        this._hoverSavedDelineator = false;
    }
    public onMouseLeave() { 
        this.mouseIsOver = false;
        this.isEditing = false;
        this.isDeleting = false;
        this._hoverSavedDelineator = false;
    }
    // public onEditDelineator(){ 
    //     this.isEditing = true; 
    // }

    public startDeleting(){ 
        this.isDeleting = true;
    }

    public reset() {
        this.isGrabbingSection = false;
        this.isEditing = false;
        this.isDeleting = false;
        this._hoverSavedDelineator = false;
        this.mouseIsOver = false;
        this._drawDelineator = null;
    }




    private _buildDelineatorsStyle() {
        // let currentTime = moment(this.startTime);
        if (this.savedDelineatorTime) {


            if (this.startTime.isSame(this.savedDelineatorTime)) {


                this._savedDelineatorStyle = { 'margin-top':'0' };


            } else if (this.endTime.isSame(this.savedDelineatorTime)) {



                this._savedDelineatorStyle = { 'margin-top':'100%' };
            }else{
                const totalMS = moment(this.endTime).diff(this.startTime, 'milliseconds');
                const delineatorMS = moment(this.savedDelineatorTime).diff(this.startTime, 'milliseconds');
                if(delineatorMS > 0){
                    const percent = (delineatorMS / totalMS) * 100;

                    this._savedDelineatorStyle = { 'margin-top': percent.toFixed(0) + '%' };
                }else{
                    console.log('bigtime error')
                }
                
            }


        }

        console.log("Style is: " , this._savedDelineatorStyle);
    }


}