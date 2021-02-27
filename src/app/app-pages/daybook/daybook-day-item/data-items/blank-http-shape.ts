import { DaybookDayItemHttpShape } from "../daybook-day-item-http-shape.interface";

let blankDaybookItemHttpShape: DaybookDayItemHttpShape = {
    _id: "",
    userId: "",
    dateYYYYMMDD: "",
    daybookTimelogEntryDataItems: [],
    timeDelineators: [],
    dailyTaskListDataItems: [],
    dayStructureDataItems: [],
    sleepInputItems: [],
    dailyWeightLogEntryKg: -1,
    scheduledActivityItems: [],  // this includes activities and routines.: [],
    dayTemplateId: "",
    scheduledEventIds: [],
    notebookEntryIds: [],
    taskItemIds: [],
}
export default blankDaybookItemHttpShape;