
import * as moment from 'moment';
// import { ItemState } from '../../../../shared/utilities/item-state.class';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export enum TimelogDelineatorType {
    FRAME_START = 'FRAME_START',
    FRAME_END = 'FRAME_END',
    WAKEUP_TIME = 'WAKEUP_TIME',
    FALLASLEEP_TIME = 'FALLASLEEP_TIME',
    NOW = 'NOW',
    TIMELOG_ENTRY_START = 'TIMELOG_ENTRY_START',
    TIMELOG_ENTRY_END = 'TIMELOG_ENTRY_END',
    SAVED_DELINEATOR = 'SAVED_DELINEATOR',
    DAY_STRUCTURE = 'DAY_STRUCTURE',

}

export class TimelogDelineator {

    constructor(time: moment.Moment, type: TimelogDelineatorType) {

        this._time = moment(time);
        this.delineatorType = type;

        // this._itemState = new ItemState(this._time);
        // this._isConfirmed = isConfirmed;

        // if (icon) { 
        //     this._icon = icon;
        // }
        // if (iconColor) {
        //     this._ngStyle = { 'color': iconColor };
        // }

        this._setIcon();
    }


    private _setIcon(){
        // todo:
        // if wakeupTime: sun, nowtime: clock, fallAsleeptime: moon.
        
    }

    public label = '';

    public get isTimelogEntry(): boolean {
        return this.delineatorType === 'TIMELOG_ENTRY_START';
    }
    public get durationSeconds(): number {
        if (this._nextDelineatorTime !== null) {
            return moment(this._nextDelineatorTime).diff(moment(this._time), 'seconds');
        } else {
            return 0;
        }
    }

    public isVisible = false;

    private _time: moment.Moment;
    public get time(): moment.Moment { return this._time; }

    private _nextDelineatorTime: moment.Moment;
    public get nextDelineatorTime(): moment.Moment { return this._nextDelineatorTime; }
    public set nextDelineatorTime(time: moment.Moment) { this._nextDelineatorTime = moment(time); }

    // private _itemState: ItemState;
    // public get itemState(): ItemState { return this._itemState; }

    public delineatorType: TimelogDelineatorType;

    // public get mouseIsOver(): boolean { return this._itemState.mouseIsOver; }

    private _icon: IconDefinition;
    public get icon(): IconDefinition { return this._icon; }

    private _ngStyle: any = {};
    public get ngStyle(): any { return this._ngStyle; }



}

