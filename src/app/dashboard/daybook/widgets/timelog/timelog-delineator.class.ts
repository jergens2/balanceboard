
import * as moment from 'moment';
// import { ItemState } from '../../../../shared/utilities/item-state.class';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { TimelogEntryItem } from './timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';

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
        this._delineatorType = type;
        this._setIcon();
    }

    
    
    private _time: moment.Moment;
    private _icon: IconDefinition;
    private _delineatorType: TimelogDelineatorType;
    
    public ngStyle: any = {};
    public timelogEntryStart: TimelogEntryItem;
    public timelogEntryEnd: TimelogEntryItem;
    
    public isVisible = false;
    public label = '';
    public nextDelineator: TimelogDelineator;
    public previousDelineator: TimelogDelineator;

    public get time(): moment.Moment { return this._time; }
    public get icon(): IconDefinition { return this._icon; }
    public get delineatorType(): TimelogDelineatorType { return this._delineatorType; };

    


    private _setIcon(){
        // todo:
        // if wakeupTime: sun, nowtime: clock, fallAsleeptime: moon.
        
    }
}

