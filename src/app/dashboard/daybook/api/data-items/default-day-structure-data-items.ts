import { DayStructureDataItem } from "./day-structure-data-item.interface";
import * as moment from 'moment';
import { DayStructureSleepCycle } from "./day-structure-sleep-cycle.enum";
import { DayStructureDataItemType } from "./day-structure-data-item-type.enum";



export default function(time: moment.Moment): DayStructureDataItem[]{
  let dayStructureDataItems: DayStructureDataItem[] = [];

  
  let sleepCycleItems: DayStructureDataItem[] = [];
  let dayStructureItems: DayStructureDataItem[] = [];
  sleepCycleItems.push({
    startTimeISO: moment(time).startOf("day").toISOString(),
    endTimeISO: moment(time).startOf("day").add(7, "hours").toISOString(),
    bodyLabel: "Sleeping",
    startLabel: "Start of calendar day",
    bodyBackgroundColor: "rgba(0, 0, 255, 0.247)",
    activityCategoryDefinitionTreeId: "",
    sleepCycle: DayStructureSleepCycle.Sleeping,
    itemType: DayStructureDataItemType.SleepCycle,
  });
  sleepCycleItems.push({
    startTimeISO: moment(time).startOf("day").add(7, "hours").toISOString(),
    endTimeISO: moment(time).startOf("day").add(23, "hours").toISOString(),
    bodyLabel: "Wake up",
    startLabel: "Awake",
    bodyBackgroundColor: "",
    activityCategoryDefinitionTreeId: "",
    sleepCycle: DayStructureSleepCycle.Awake,
    itemType: DayStructureDataItemType.SleepCycle,
  });
  sleepCycleItems.push({
    startTimeISO: moment(time).startOf("day").add(23, "hours").toISOString(),
    endTimeISO: moment(time).endOf("day").toISOString(),
    bodyLabel: "Sleeping",
    startLabel: "Fall asleep",
    bodyBackgroundColor: "rgba(0, 0, 255, 0.247)",
    activityCategoryDefinitionTreeId: "",
    sleepCycle: DayStructureSleepCycle.Sleeping,
    itemType: DayStructureDataItemType.SleepCycle,
  });
  
  
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").toISOString(),
    endTimeISO: moment(time).startOf("day").add(7, "hours").toISOString(),
    bodyLabel: "Sleeping",
    startLabel: "",
    bodyBackgroundColor: "",
    activityCategoryDefinitionTreeId: "",
    sleepCycle: DayStructureSleepCycle.Sleeping,
    itemType: DayStructureDataItemType.StructureItem,
  });
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").add(7, "hours").toISOString(),
    endTimeISO: moment(time).startOf("day").add(7, "hours").add(30, "minutes").toISOString(),
    bodyLabel: "Post-wakeup routine",
    startLabel: "Wake up",
    bodyBackgroundColor: "",
    activityCategoryDefinitionTreeId: "",
    sleepCycle: DayStructureSleepCycle.Awake,
    itemType: DayStructureDataItemType.StructureItem,
  });
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").add(7, "hours").add(30, "minutes").toISOString(),
    endTimeISO: moment(time).startOf("day").add(12, "hours").toISOString(),
    bodyLabel: "Morning",
    startLabel: "",
    bodyBackgroundColor: "",
    activityCategoryDefinitionTreeId: "",
    sleepCycle: DayStructureSleepCycle.Awake,
    itemType: DayStructureDataItemType.StructureItem,
  });
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").add(12, "hours").toISOString(),
    endTimeISO: moment(time).startOf("day").add(18, "hours").toISOString(),
    bodyLabel: "Afternoon",
    startLabel: "",
    bodyBackgroundColor: "",
    activityCategoryDefinitionTreeId: "",
    sleepCycle: DayStructureSleepCycle.Awake,
    itemType: DayStructureDataItemType.StructureItem,
  });
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").add(18, "hours").toISOString(),
    endTimeISO: moment(time).startOf("day").add(22, "hours").add(30, "minutes").toISOString(),
    bodyLabel: "Evening",
    startLabel: "",
    bodyBackgroundColor: "",
    activityCategoryDefinitionTreeId: "",
    sleepCycle: DayStructureSleepCycle.Awake,
    itemType: DayStructureDataItemType.StructureItem,
  });
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").add(22, "hours").add(30, "minutes").toISOString(),
    endTimeISO: moment(time).startOf("day").add(23, "hours").toISOString(),
    bodyLabel: "Bedtime routine",
    startLabel: "",
    bodyBackgroundColor: "",
    activityCategoryDefinitionTreeId: "",
    sleepCycle: DayStructureSleepCycle.Awake,
    itemType: DayStructureDataItemType.StructureItem,
  });
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").add(23, "hours").toISOString(),
    endTimeISO: moment(time).endOf("day").toISOString(),
    bodyLabel: "Sleeping",
    startLabel: "",
    bodyBackgroundColor: "",
    activityCategoryDefinitionTreeId: "",
    sleepCycle: DayStructureSleepCycle.Sleeping,
    itemType: DayStructureDataItemType.StructureItem,
  });
  
  dayStructureDataItems = [ ...sleepCycleItems, ...dayStructureItems];
  return dayStructureDataItems;
}


// // console.log("Default day structure data items", dayStructureDataItems);
// export const defaultDayStructureDataItems: DayStructureDataItem[] = dayStructureDataItems