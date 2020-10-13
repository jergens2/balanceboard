import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import * as moment from 'moment';
import { ItemState } from '../../../../../../shared/utilities/item-state.class';
import { TimelogZoomType } from './timelog-zoom-type.enum';

export class TimelogZoomItem {

    private _ngClass: string[] = [];
    private _isFirst: boolean = false;
    private _isLast: boolean = false;
    private _isActive: boolean = false;

    constructor(startTime: moment.Moment, endTime: moment.Moment, type: TimelogZoomType, icon: IconDefinition, label: string) {
        this.zoomType = type;
        this.startTime = moment(startTime);
        this.endTime = moment(endTime);
        this.icon = icon;
        this.label = label;
    }


    public icon: IconDefinition;
    public get isActive(): boolean { return this._isActive; }
    public set isActive(isActive: boolean) {
        this._isActive = isActive;
        const foundIndex = this._ngClass.findIndex(item => item === 'is-active');
        if (isActive === true) {
            if (foundIndex === -1) {
                this._ngClass.push('is-active');
            }
        } else {
            if (foundIndex >= 0) {
                this._ngClass.splice(foundIndex, 1);
            }
        }
    }
    public set isFirst(isFirst: boolean) {
        this._isFirst = isFirst;
        this._ngClass = ['first-item'];
    }
    public set isLast(isLast: boolean) {
        this._isLast = isLast;
        this._ngClass = ['last-item'];
    }
    public get isLast(): boolean { return this._isLast; }
    public get isFirst(): boolean { return this._isFirst; }
    public zoomType: TimelogZoomType;
    public startTime: moment.Moment;
    public endTime: moment.Moment;
    public label: string = '';

    public get ngClass(): string[] { return this._ngClass; }

    public toString(): string { return this.zoomType + ": " + this.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this.endTime.format('YYYY-MM-DD hh:mm a'); };
}
