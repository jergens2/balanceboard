
import * as moment from 'moment';
// import { ItemState } from '../../../../shared/utilities/item-state.class';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { TimelogEntryItem } from './timelog-entry/timelog-entry-item.class';

export enum TimelogDelineatorType {
    SCHEDULE_START = 'SCHEDULE_START', // very beginning of the schedule
    SCHEDULE_END = 'SCHEDULE_END', // very end of the schedule

    DISPLAY_START = 'DISPLAY_START', // very beginning of the display
    DISPLAY_END = 'DISPLAY_END', // very end of the display

    SLEEP_ENTRY_START = 'SLEEP_ENTRY_START', // generic start of a sleep entry
    SLEEP_ENTRY_END = 'SLEEP_ENDTRY_END', // generic end of a sleep entry

    FALLASLEEP_TIME = 'FALLASLEEP_TIME', // a specific start to a sleep entry
    WAKEUP_TIME = 'WAKEUP_TIME', // a specific end to a sleep entry

    TIMELOG_ENTRY_START = 'TIMELOG_ENTRY_START',
    TIMELOG_ENTRY_END = 'TIMELOG_ENTRY_END',

    DRAWING_TLE_START = 'DRAWING_TLE_START',
    DRAWING_TLE_END = 'DRAWING_TLE_END',

    AVAILABLE_ITEM_START = 'AVAILABLE_ITEM_START',
    AVALABLE_ITEM_END = 'AVAILABLE_ITEM_END',

    NOW = 'NOW',

    SAVED_DELINEATOR = 'SAVED_DELINEATOR',

    DAY_STRUCTURE = 'DAY_STRUCTURE',
    // DAY_STRUCTURE_MIDNIGHT = 'DAY_STRUCTURE_MIDNIGHT',

    CUSTOM = 'CUSTOM',

    DEFAULT = 'DEFAULT' // placeholder
}

export class TimelogDelineator {

    private _time: moment.Moment;
    private _icon: IconDefinition;
    private _delineatorType: TimelogDelineatorType;

    private _nowLineCrossesTLE: boolean = false;
    private _splitBehavior: 'NONE' | 'SOFT' | 'HARD' = 'NONE';

    public ngStyle: any = {};
    public timelogEntryStart: TimelogEntryItem;
    public timelogEntryEnd: TimelogEntryItem;

    public isVisible = false;
    public label = '';
    public nextDelineator: TimelogDelineator;
    public previousDelineator: TimelogDelineator;

    /**
     * This number should
     */
    public scheduleIndex = -1;

    constructor(time: moment.Moment, type: TimelogDelineatorType, index: number = -1) {
        this._time = moment(time);
        this._delineatorType = type;
        this._setIcon();
        this.scheduleIndex = index;
    }

    public toString(): string {
        return this.scheduleIndex + '\t' + this._time.format('YYYY-MM-DD hh:mm a') + ' : ' + this.delineatorType;
    }




    public get time(): moment.Moment { return this._time; }
    public set time(time: moment.Moment) { this._time = moment(time); }
    public get icon(): IconDefinition { return this._icon; }
    public get delineatorType(): TimelogDelineatorType { return this._delineatorType; }
    public get splitBehavior(): 'NONE' | 'SOFT' | 'HARD' { return this._splitBehavior; }

    public setNowLineCrossesTLE() {
        // console.log("Now line crosses timelog entry")
        this._nowLineCrossesTLE = true;
    }
    public get nowLineCrossesTLE(): boolean { return this._nowLineCrossesTLE; }

    public get isSleepDelineator(): boolean {
        return this._delineatorType === TimelogDelineatorType.WAKEUP_TIME
            || this._delineatorType === TimelogDelineatorType.FALLASLEEP_TIME;
    }

    public get isSaved(): boolean { return this._delineatorType === TimelogDelineatorType.SAVED_DELINEATOR; }
    private _setIcon() {
        // todo:
        // if wakeupTime: sun, nowtime: clock, fallAsleeptime: moon.

    }
}

