import { ITLEFActivitySliderBarItem } from "./activity-slider-bar-item.interface";
import { duration } from "moment";
import { Subject, Observable } from "rxjs";

export class ActivitySliderBar {



    private _sliderBarItems: ITLEFActivitySliderBarItem[] = [];
    public get sliderBarItems(): ITLEFActivitySliderBarItem[] {
        return this._sliderBarItems;
    }


    private changePercent(percent) {
        if(this.durationPercent != percent){
            this.durationPercent = percent;
            this.updateSliderBarItems(); 
            this._percentChanged.next(percent);
        }
        
    }

    durationPercent: number = 0;

    private _percentChanged: Subject<number> = new Subject();
    public get durationPercent$(): Observable<number> {
        return this._percentChanged.asObservable();
    }

    private color: string = "white";
    private maxPercent: number;
    constructor(durationPercent: number, maxPercent:number, color: string) {
        this.color = color;
        this.maxPercent = maxPercent;
        this._sliderBarItems = this.buildSliderBarItems();
        this.changePercent(durationPercent);
    }
    update(durationPercent: number, maxPercent: number){
        this.maxPercent = maxPercent;
        this.durationPercent = durationPercent;
        this.updateSliderBarItems();
    }


    private units: number = 50;
    // Be aware that this units value must be the same number of grid columns in the component.css file.
    private percentPerUnit = 100 / this.units;



    private updateSliderBarItems(){        
        for(let sliderBarItem of this._sliderBarItems){
            sliderBarItem.hasGrabber = false;
            if (sliderBarItem.percent <= this.durationPercent) {
                sliderBarItem.hasValue = true;
                sliderBarItem.style["background-color"] = this.color;
                if ((sliderBarItem.percent + this.percentPerUnit) > this.durationPercent) {
                    sliderBarItem.hasGrabber = true;
                }
            }else{
                sliderBarItem.style["background-color"] = "white";
                sliderBarItem.hasValue = false;
            }
        }
    }

    private buildSliderBarItems(): ITLEFActivitySliderBarItem[] {
        let sliderBarGridItems: ITLEFActivitySliderBarItem[] = [];
        for (let i = 0; i < this.units; i++) {
            let hasValue: boolean = false;
            let backgroundColor: string = "white";
            let percent: number = (i + 1) * this.percentPerUnit;
            let hasGrabber: boolean = false;
            if (percent <= this.durationPercent) {
                hasValue = true;
                backgroundColor = this.color;
                if ((percent + this.percentPerUnit) > this.durationPercent) {
                    hasGrabber = true;
                }
            }
            let style: any = {
                "grid-column": "" + (i + 1).toFixed(0) + "/span 1",
                "background-color": backgroundColor,
            }
            sliderBarGridItems.push({
                hasValue: hasValue,
                hasGrabber: hasGrabber,
                mouseOver: false,
                style: style,
                percent: percent,
            });
        }

        return sliderBarGridItems;
    }

    isActive: boolean = false;
    activate() {
        this.isActive = true;
    }
    deactivate() {
        this.isActive = false;
    }

    mouseOverSliderBarItem(sliderBarItem: ITLEFActivitySliderBarItem) {
        if (this.isActive) {
            this.recalculatePercent(sliderBarItem);
        }
    }

    mouseUpSliderBarItem(sliderBarItem: ITLEFActivitySliderBarItem) {
        if (this.isActive) {
            this.recalculatePercent(sliderBarItem);
        }
        this.isActive = false;
    }

    onClickBarItem(sliderBarItem: ITLEFActivitySliderBarItem){
        this.recalculatePercent(sliderBarItem);
        this.isActive = false;
    }


    private recalculatePercent(currentSliderBarItem: ITLEFActivitySliderBarItem) {
        let percent = currentSliderBarItem.percent;
        if(percent != this.durationPercent){
            if(percent >= this.maxPercent){
                percent = this.maxPercent;
            }
            for (let sliderBarItem of this._sliderBarItems) {
                sliderBarItem.hasGrabber = false;
                if (sliderBarItem.percent <= percent) {
                    sliderBarItem.hasValue = true;
                    sliderBarItem.style["background-color"] = this.color;
                    if ((sliderBarItem.percent + this.percentPerUnit) > percent) {
                        sliderBarItem.hasGrabber = true;
                    }
                } else {
                    sliderBarItem.hasValue = false;
                    sliderBarItem.style["background-color"] = "white";
                }
            }
            this.changePercent(percent);
        }
    }

}