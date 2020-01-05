import { TimelogEntryItem } from "../../widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class";

export interface DaybookTimelogEntryTemplate{
    timelogEntry: TimelogEntryItem;
    isFirstOfDay: boolean;
    isLastOfDay: boolean;
}