import { ITLEFActivitySliderBarItem } from "./activity-slider-bar-item.interface";
import { duration } from "moment";
import { Subject, Observable } from "rxjs";

export class ActivitySliderBar {



    private _sliderBarItems: ITLEFActivitySliderBarItem[] = [];
    public get sliderBarItems(): ITLEFActivitySliderBarItem[] {
        return this._sliderBarItems;
    }

    // percentageManuallyChanged: boolean = false;

    private changePercent(percent) {
        this.durationPercent = percent;
        this._sliderBarItems = this.buildSliderBarItems();
        this._percentChanged.next(percent);
    }

    durationPercent: number = 0;

    private _percentChanged: Subject<number> = new Subject();
    public get durationPercent$(): Observable<number> {
        return this._percentChanged.asObservable();
    }

    private color: string = "white";
    constructor(durationPercent: number, color: string) {
        this.durationPercent = durationPercent;
        this.color = color;
        this._sliderBarItems = this.buildSliderBarItems();
    }

    private buildSliderBarItems(): ITLEFActivitySliderBarItem[] {
        let sliderBarGridItems: ITLEFActivitySliderBarItem[] = [];
        for (let i = 0; i < 20; i++) {
            let hasValue: boolean = false;
            let backgroundColor: string = "white";
            let percent: number = (i + 1) * 5;
            let hasGrabber: boolean = false;
            if (percent <= this.durationPercent) {
                hasValue = true;
                backgroundColor = this.color;
                if ((percent + 5) > this.durationPercent) {
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
            })

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


    private recalculatePercent(currentSliderBarItem: ITLEFActivitySliderBarItem) {
        let percent = currentSliderBarItem.percent;
        for (let sliderBarItem of this._sliderBarItems) {
            sliderBarItem.hasGrabber = false;
            if (sliderBarItem.percent <= percent) {
                sliderBarItem.hasValue = true;
                sliderBarItem.style["background-color"] = this.color;
                if ((sliderBarItem.percent + 5) > percent) {
                    sliderBarItem.hasGrabber = true;
                }
            } else {
                sliderBarItem.hasValue = false;
                sliderBarItem.style["background-color"] = "white";
            }
        }
        // this.percentageManuallyChanged = true;
        this.changePercent(percent);
    }

}