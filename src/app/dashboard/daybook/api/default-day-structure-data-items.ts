import { DayStructureDataItem } from "./data-items/day-structure-data-item.interface";
import * as moment from 'moment';
import { DayStructureSleepCycle } from "./data-items/day-structure-sleep-cycle.enum";

let dayStructureDataItems: DayStructureDataItem[] = [];
let now: moment.Moment = moment();
dayStructureDataItems.push({
  startTimeISO: moment(now).startOf("day").toISOString(),
  endTimeISO: moment(now).startOf("day").add(7, "hours").toISOString(),
  bodyLabel: "Sleeping",
  startLabel: "Start of calendar day",
  bodyBackgroundColor: "rgba(0, 102, 255, 0.3)",
  activityCategoryDefinitionTreeId: "",
  isDraggable: false,
  sleepCycle: DayStructureSleepCycle.SleepingPreWakeup,
});
dayStructureDataItems.push({
  startTimeISO: moment(now).startOf("day").add(7, "hours").toISOString(),
  endTimeISO: moment(now).startOf("day").add(7, "hours").toISOString(),
  bodyLabel: "",
  startLabel: "Wake up",
  bodyBackgroundColor: "rgba(255, 136, 0, 0.1)",
  activityCategoryDefinitionTreeId: "",
  isDraggable: true,
  sleepCycle: DayStructureSleepCycle.Wakeup
});
dayStructureDataItems.push({
  startTimeISO: moment(now).startOf("day").add(7, "hours").toISOString(),
  endTimeISO: moment(now).startOf("day").add(7, "hours").add(30, "minutes").toISOString(),
  bodyLabel: "Post wakeup (morning routine)",
  startLabel: "Wake up",
  bodyBackgroundColor: "rgba(0, 102, 255, 0.1)",
  activityCategoryDefinitionTreeId: "",
  isDraggable: true,
  sleepCycle: DayStructureSleepCycle.PostWakeup
});
dayStructureDataItems.push({
  startTimeISO: moment(now).startOf("day").add(7, "hours").add(30, "minutes").toISOString(),
  endTimeISO: moment(now).startOf("day").add(12, "hours").toISOString(),
  bodyLabel: "Morning",
  startLabel: "",
  bodyBackgroundColor: "rgba(255, 136, 0, 0.1)",
  activityCategoryDefinitionTreeId: "",
  isDraggable: true,
  sleepCycle: DayStructureSleepCycle.Awake
});
dayStructureDataItems.push({
  startTimeISO: moment(now).startOf("day").add(12, "hours").toISOString(),
  endTimeISO: moment(now).startOf("day").add(18, "hours").toISOString(),
  bodyLabel: "Afternoon",
  startLabel: "Noon",
  bodyBackgroundColor: "rgba(255, 136, 0, 0.1)",
  activityCategoryDefinitionTreeId: "",
  isDraggable: false,
  sleepCycle: DayStructureSleepCycle.Awake,
});
dayStructureDataItems.push({
  startTimeISO: moment(now).startOf("day").add(18, "hours").toISOString(),
  endTimeISO: moment(now).startOf("day").add(22, "hours").add(30, "minutes").toISOString(),
  bodyLabel: "Evening",
  startLabel: "",
  bodyBackgroundColor: "rgba(0, 102, 255, 0.1)",
  activityCategoryDefinitionTreeId: "",
  isDraggable: true,
  sleepCycle: DayStructureSleepCycle.Awake
});

dayStructureDataItems.push({
  startTimeISO: moment(now).startOf("day").add(22, "hours").add(30, "minutes").toISOString(),
  endTimeISO: moment(now).startOf("day").add(22, "hours").add(30, "minutes").toISOString(),
  bodyLabel: "",
  startLabel: "Bedtime",
  bodyBackgroundColor: "",
  activityCategoryDefinitionTreeId: "",
  isDraggable: true,
  sleepCycle: DayStructureSleepCycle.Bedtime
});
dayStructureDataItems.push({
  startTimeISO: moment(now).startOf("day").add(22, "hours").add(30, "minutes").toISOString(),
  endTimeISO: moment(now).startOf("day").add(23, "hours").toISOString(),
  bodyLabel: "Pre sleeping",
  startLabel: "Bedtime",
  bodyBackgroundColor: "rgba(0, 102, 255, 0.3)",
  activityCategoryDefinitionTreeId: "",
  isDraggable: true,
  sleepCycle: DayStructureSleepCycle.AwakePreSleeping
});
dayStructureDataItems.push({
  startTimeISO: moment(now).startOf("day").add(23, "hours").toISOString(),
  endTimeISO: moment(now).endOf("day").toISOString(),
  bodyLabel: "Sleeping",
  startLabel: "Fall Asleep",
  bodyBackgroundColor: "rgba(0, 102, 255, 0.3)",
  activityCategoryDefinitionTreeId: "",
  isDraggable: true,
  sleepCycle: DayStructureSleepCycle.SleepingPostBedtime
});
dayStructureDataItems.push({
  startTimeISO: moment(now).endOf("day").toISOString(),
  endTimeISO: moment(now).endOf("day").add(1, "millisecond").toISOString(),
  bodyLabel: "",
  startLabel: "End of calendar day",
  bodyBackgroundColor: "",
  activityCategoryDefinitionTreeId: "",
  isDraggable: false,
  sleepCycle: DayStructureSleepCycle.SleepingPostBedtime
});

dayStructureDataItems = dayStructureDataItems.sort((d1, d2) => {
  if (d1.startTimeISO < d2.startTimeISO) {
    return -1;
  }
  if (d1.startTimeISO > d2.startTimeISO) {
    return 1;
  }
  return 0;
});
console.log("Default day structure data items", dayStructureDataItems);
export const defaultDayStructureDataItems: DayStructureDataItem[] = dayStructureDataItems