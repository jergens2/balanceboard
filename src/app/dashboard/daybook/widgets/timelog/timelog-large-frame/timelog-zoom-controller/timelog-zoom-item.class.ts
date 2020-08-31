import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import * as moment from 'moment';
import { ItemState } from '../../../../../../shared/utilities/item-state.class';
import { TimelogZoomType } from './timelog-zoom-type.enum';

export class TimelogZoomItem{

    constructor(startTime: moment.Moment, endTime: moment.Moment, type: TimelogZoomType, icon: IconDefinition, label: string){ 
        this.zoomType = type;
        this.startTime = moment(startTime);
        this.endTime = moment(endTime);
        this.icon = icon;
        this.label = label;
    }


    public icon: IconDefinition;
    public isActive: boolean = false;
    public isFirst: boolean = false;
    public isLast: boolean = false;
    public zoomType: TimelogZoomType;
    public startTime: moment.Moment;
    public endTime: moment.Moment;
    public label: string = '';
}