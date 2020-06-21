
import * as moment from 'moment';
// import { ItemState } from '../../../../shared/utilities/item-state.class';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { TimelogEntryItem } from './timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';

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
    // CUSTOM = 'CUSTOM',
    DRAWING_TLE_START = 'DRAWING_TLE_START',
    DRAWING_TLE_END = 'DRAWING_TLE_END'
}

export class TimelogDelineator {

    constructor(time: moment.Moment, type: TimelogDelineatorType) {
        this._time = moment(time);
        this._delineatorType = type;
        this._setIcon();
    }

    public toString(): string {
        return this._time.format('hh:mm a') + " : " + this.delineatorType
    }

    private _time: moment.Moment;
    private _icon: IconDefinition;
    private _delineatorType: TimelogDelineatorType;

    private _nowLineCrossesTLE: boolean = false;

    public ngStyle: any = {};
    public timelogEntryStart: TimelogEntryItem;
    public timelogEntryEnd: TimelogEntryItem;

    public isVisible = false;
    public label = '';
    public nextDelineator: TimelogDelineator;
    public previousDelineator: TimelogDelineator;

    /** Used for when drawing TimelogEntry  */
    public isTemporary: boolean = false;

    public get time(): moment.Moment { return this._time; }
    public set time(time: moment.Moment) { this._time = moment(time); }
    public get icon(): IconDefinition { return this._icon; }
    public get delineatorType(): TimelogDelineatorType { return this._delineatorType; };

    public setNowLineCrossesTLE(){ 
        // console.log("Now line crosses timelog entry")
        this._nowLineCrossesTLE = true; }
    public get nowLineCrossesTLE(): boolean { return this._nowLineCrossesTLE; }

    public get isSleepDelineator(): boolean { return this._delineatorType === TimelogDelineatorType.WAKEUP_TIME || this._delineatorType === TimelogDelineatorType.FALLASLEEP_TIME; }

    public get isSaved(): boolean { return this._delineatorType === TimelogDelineatorType.SAVED_DELINEATOR; }
    private _setIcon() {
        // todo:
        // if wakeupTime: sun, nowtime: clock, fallAsleeptime: moon.

    }
}

