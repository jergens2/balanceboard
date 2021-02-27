import { DaybookTimeScheduleItem } from './daybook-time-schedule/daybook-time-schedule-item.class';
import { TimelogDelineatorType, TimelogDelineator } from '../widgets/timelog/timelog-large-frame/timelog-body/timelog-delineator.class';

export class DaybookDisplayDelineatorSetter {


    private _displayDelineators: TimelogDelineator[] = [];
    private _displayItems: DaybookTimeScheduleItem[] = [];
    public get displayDelineators(): TimelogDelineator[] { return this._displayDelineators; }
    public get displayItems(): DaybookTimeScheduleItem[] { return this._displayItems; }

    constructor(displayItems: DaybookTimeScheduleItem[]) {
        let allDelineators: TimelogDelineator[] = [];
        if (displayItems.length > 1) {
            for (let i = 0; i < displayItems.length; i++) {
                const itemIndex = i;
                const startDelineatorIndex = i;
                const endDelineatorIndex = i + 1;
                displayItems[i].setItemIndex(itemIndex);

                let startDelineatorType: TimelogDelineatorType = displayItems[i].startDelineator.delineatorType;
                let endDelineatorType: TimelogDelineatorType = displayItems[i].endDelineator.delineatorType;

                const thisItem = displayItems[i];
                const nextItem = displayItems[i + 1];

                if (i === 0) {
                    startDelineatorType = TimelogDelineatorType.DISPLAY_START;
                    endDelineatorType = this._getPriorityDelineator(thisItem.endDelineator.delineatorType,
                        nextItem.startDelineator.delineatorType);
                } else {
                    const prevItem = displayItems[i - 1];
                    if (i > 0 && i < displayItems.length - 1) {
                        startDelineatorType = this._getPriorityDelineator(prevItem.endDelineator.delineatorType,
                            thisItem.startDelineator.delineatorType);
                        endDelineatorType = this._getPriorityDelineator(thisItem.endDelineator.delineatorType,
                            nextItem.startDelineator.delineatorType);
                    } else if (i === displayItems.length - 1) {
                        startDelineatorType = this._getPriorityDelineator(prevItem.endDelineator.delineatorType,
                            thisItem.startDelineator.delineatorType);
                        endDelineatorType = TimelogDelineatorType.DISPLAY_END;
                    }
                }
                const startDelineator = new TimelogDelineator(thisItem.schedItemStartTime, startDelineatorType, startDelineatorIndex);
                const endDelineator = new TimelogDelineator(thisItem.schedItemEndTime, endDelineatorType, endDelineatorIndex);
                displayItems[i].startDelineator = startDelineator;
                displayItems[i].endDelineator = endDelineator;
                displayItems[i].setItemIndex(itemIndex);
                allDelineators = [...allDelineators, startDelineator, endDelineator];
            }
        } else if (displayItems.length === 1) {
            allDelineators = [
                new TimelogDelineator(displayItems[0].schedItemStartTime, TimelogDelineatorType.DISPLAY_START, 0),
                new TimelogDelineator(displayItems[0].schedItemEndTime, TimelogDelineatorType.DISPLAY_END, 1),
            ];
        }
        const duplicatesRemoved: TimelogDelineator[] = [];
        allDelineators.forEach(delineator => {
            if (!duplicatesRemoved.find(item => item.time.isSame(delineator.time))) {
                duplicatesRemoved.push(delineator);
            }
        });
        this._displayDelineators = duplicatesRemoved;
        this._displayItems = displayItems;
    }


    private _getPriorityDelineator(checkD1: TimelogDelineatorType, checkD2: TimelogDelineatorType): TimelogDelineatorType {
        const delineatorDisplayPriority = [
            TimelogDelineatorType.DISPLAY_START,
            TimelogDelineatorType.DISPLAY_END,
            // TimelogDelineatorType.DAY_STRUCTURE_MIDNIGHT,
            TimelogDelineatorType.DRAWING_TLE_START,
            TimelogDelineatorType.DRAWING_TLE_END,
            TimelogDelineatorType.WAKEUP_TIME,
            TimelogDelineatorType.FALLASLEEP_TIME,
            TimelogDelineatorType.SLEEP_ENTRY_START,
            TimelogDelineatorType.SLEEP_ENTRY_END,
            TimelogDelineatorType.TIMELOG_ENTRY_START,
            TimelogDelineatorType.TIMELOG_ENTRY_END,
            TimelogDelineatorType.NOW,
            TimelogDelineatorType.SAVED_DELINEATOR,
            TimelogDelineatorType.DAY_STRUCTURE,
            TimelogDelineatorType.AVAILABLE_ITEM_START,
            TimelogDelineatorType.AVALABLE_ITEM_END,
            TimelogDelineatorType.CUSTOM,
            TimelogDelineatorType.SCHEDULE_START,
            TimelogDelineatorType.SCHEDULE_END,
        ];
        const d1PriorityIndex = delineatorDisplayPriority.findIndex(item => item === checkD1);
        const d2PriorityIndex = delineatorDisplayPriority.findIndex(item => item === checkD2);
        if (d1PriorityIndex < d2PriorityIndex) {
            return delineatorDisplayPriority[d1PriorityIndex];
        } else {
            return delineatorDisplayPriority[d2PriorityIndex];
        }
    }
}
