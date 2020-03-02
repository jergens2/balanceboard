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
    sleepInputItem: {
        startSleepTimeISO: "",
        startSleepTimeUtcOffsetMinutes: -1,
        endSleepTimeISO: "",
        endSleepTimeUtcOffsetMinutes: -1,
        energyAtStartUserInput: -1,
        energyAtEndUserInput: -1,
        percentAsleep: -1,
        embeddedNote: "",
        noteIds: [],
        customSleepProfile: null,
    },
    sleepEnergyLevelInputs: [],

    dailyWeightLogEntryKg: -1,
    scheduledActivityItems: [],  // this includes activities and routines.: [],
    dayTemplateId: "",
    scheduledEventIds: [],
    notebookEntryIds: [],
    taskItemIds: [],
}
export default blankDaybookItemHttpShape;