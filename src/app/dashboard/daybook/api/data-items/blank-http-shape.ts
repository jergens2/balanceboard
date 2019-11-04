import { DaybookDayItemHttpShape } from "../daybook-day-item-http-shape.interface";

let blankDaybookItemHttpShape: DaybookDayItemHttpShape = {
    _id: "",
    userId: "",
    dateYYYYMMDD: "",
    daybookTimelogEntryDataItems: [],
    timeDelineators: [],
    daybookActivityDataItems: [],
    dailyTaskListDataItems: [],
    dayStructureDataItems: [],
    sleepCycleDataItems: [],
    sleepProfile: {
        sleepQuality: null,
        previousFallAsleepTimeISO: "",
        previousFallAsleepTimeUtcOffsetMinutes: -1,
        wakeupTimeISO: "",
        wakeupTimeUtcOffsetMinutes: -1,
        bedtimeISO: "",
        bedtimeUtcOffsetMinutes: -1,
        fallAsleepTimeISO: "",
        fallAsleepTimeUtcOffsetMinutes: -1,
        estimatedSleepDurationMinutes: -1,
    },
    dailyWeightLogEntryKg: -1,
    scheduledActivityItems: [],  // this includes activities and routines.: [],
    dayTemplateId: "",
    scheduledEventIds: [],
    notebookEntryIds: [],
    taskItemIds: [],
}
export default blankDaybookItemHttpShape;