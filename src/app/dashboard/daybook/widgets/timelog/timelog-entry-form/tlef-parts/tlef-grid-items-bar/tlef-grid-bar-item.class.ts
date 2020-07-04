import * as moment from 'moment';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFFormCase } from '../../tlef-form-case.enum';


export class TLEFGridBarItem {

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _isAvailable: boolean;

    private _formCase: TLEFFormCase;
    /**
     * An alternative name might be TimelogEntryFormDisplayGridBarItem or TLEFDisplayGridBarItem
     * 
     * The grid bar items are for the timelog entry form.
     */
    constructor(startTime: moment.Moment, endTime: moment.Moment, isAvailable: boolean, formCase: TLEFFormCase, backgroundColor: string) {
        this._startTime = startTime;
        this._endTime = endTime;
        this._isAvailable = isAvailable;
        this._formCase = formCase;
        this._backgroundColor = backgroundColor;
    }

    private _mouseIsOver: boolean = false;

    // private _itemIndex: number = -1;
    // public setItemIndex(index: number) { this._itemIndex = index; }
    // public get itemIndex(): number { return this._itemIndex; }
    

    public get mouseIsOver(): boolean { return this._mouseIsOver; }
    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }

    public get formCase(): TLEFFormCase { return this._formCase; }

    private _backgroundColor: string = "";
    public get backgroundColor(): string { return this._backgroundColor; }

    public isCurrent = false;
    public isActive = false;
    public isDrawing: boolean = false;

    public index = -1;

    public get isSleepItem(): boolean { 
        return this.formCase === TLEFFormCase.SLEEP;
    }
    public get isTimelogEntryItem(): boolean { 
        return this.formCase !== TLEFFormCase.SLEEP;
    }
    public get isAvailable(): boolean { 
        return this._isAvailable;
    }

    public buildTLE(): TimelogEntryItem{
        return new TimelogEntryItem(this.startTime, this.endTime);
    }


    onMouseEnter() {
        this._mouseIsOver = true;
    }
    onMouseLeave() {
        this._mouseIsOver = false;
    }

    // private _click$: Subject<DisplayGridBarItem> = new Subject();
    // public onClick(){
    //     this._click$.next(this);
    // }
    // public get click$(){ return this._click$.asObservable();}


}