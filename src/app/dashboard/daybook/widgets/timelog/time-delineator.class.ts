
import * as moment from 'moment';
import { ItemState } from '../../../../shared/utilities/item-state.class';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';


export class TimeDelineator{

    constructor(time: moment.Moment, type: "DEFAULT" | "SLEEP", icon?: IconDefinition, iconColor?: string){
        this._time = moment(time);
        this._itemState = new ItemState(this._time);
        this.delineatorType = type;
        if(icon){
            this._icon = icon;
        }
        if(iconColor){
            this._ngStyle = { "color": iconColor };
        }
    }

    private _time: moment.Moment;
    public get time(): moment.Moment { return this._time; }

    private _itemState: ItemState;
    public get itemState(): ItemState{ return this._itemState; }

    public delineatorType: "DEFAULT" | "SLEEP";

    public get mouseIsOver(): boolean { return this._itemState.mouseIsOver; }

    private _icon: IconDefinition;
    public get icon(): IconDefinition { return this._icon; }

    private _ngStyle: any = {};
    public get ngStyle(): any { return this._ngStyle; }



}