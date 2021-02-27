import { ActivityCategoryDefinition } from "../../../../../../activities/api/activity-category-definition.class";

export class TimelogEntryDisplayItemUnit {
    constructor(activity: ActivityCategoryDefinition, milliseconds: number) {
        this._activity = activity;
        this._setColor();
        this.durationMS = milliseconds;

        if (milliseconds > (this.maxMS)) {
            console.log('Error: Unit should not exceed 60 minutes');
        }
        

        this._calculateRadius();
        this._setStyle();
    }

    private maxMS = 1000 * 60 * 60
    private _activity: ActivityCategoryDefinition;
    private _radius: number;
    private _color: string;
    private _ngStyle: Object = {};

    public durationMS: number;
    public get durationMinutes(): number { return this.durationMS / (60 * 1000); }
    public get radius(): number { return this._radius; }
    public get color(): string { return this._color; }
    public get ngStyle(): Object { return this._ngStyle; }

    private _setColor(){
        if (this._activity) { this._color = this._activity.color; } 
        else { this._color = "rgba(0,0,0,0.1)";}
    }
    private _calculateRadius() {
        const maxRadius = 15;
        const pi = Math.PI;
        const maxArea = pi * (maxRadius * maxRadius);
        const areaPerMinute = maxArea / 60;
        const area = this.durationMinutes * areaPerMinute;
        const radius = Math.sqrt(area/Math.PI);
        // console.log(this.durationMinutes + " minutes = " + radius + " radius")
        this._radius = Math.round(radius);
    }
    private _setStyle(){
        const px: string = (this._radius*2) + "px";
        if(this.durationMS === this.maxMS){
            this._ngStyle = {
                'width': px,
                'height': px,
                'border-radius': this._radius/2 + "px",
                'background-color': this.color,
            };
        }else{
            let borderRadius = this._radius/2;
            if(borderRadius < 3){
                borderRadius = 3;
            }
            this._ngStyle = {
                'width': px,
                'height': px,
                'border-radius': borderRadius + "px",
                'background-color': this.color,
            };
        }
        
    }



}