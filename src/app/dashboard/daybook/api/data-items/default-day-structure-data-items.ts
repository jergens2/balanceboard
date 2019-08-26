import { DayStructureDataItem } from "./day-structure-data-item.interface";
import * as moment from 'moment';
import { DayStructureTimeOfDay } from "./day-structure-time-of-day.enum";



export default function (time: moment.Moment): DayStructureDataItem[] {
  let dayStructureItems: DayStructureDataItem[] = [];
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").toISOString(),
    endTimeISO: moment(time).startOf("day").add(7, "hours").toISOString(),
    bodyLabel: "Sleeping",
    startLabel: "",
    bodyBackgroundColor: "rgba(0, 0, 255, 0.1)",
    activityCategoryDefinitionTreeId: "",
    timeOfDay: DayStructureTimeOfDay.Other,
  });
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").add(7, "hours").toISOString(),
    endTimeISO: moment(time).startOf("day").add(7, "hours").add(30, "minutes").toISOString(),
    bodyLabel: "Post-wakeup routine",
    startLabel: "Wake up",
    bodyBackgroundColor: "rgba(0, 0, 0, 0.01)",
    activityCategoryDefinitionTreeId: "",
    timeOfDay: DayStructureTimeOfDay.Other,
  });
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").add(7, "hours").add(30, "minutes").toISOString(),
    endTimeISO: moment(time).startOf("day").add(12, "hours").toISOString(),
    bodyLabel: "Morning",
    startLabel: "",
    bodyBackgroundColor: "rgba(0, 0, 0, 0.01)",
    activityCategoryDefinitionTreeId: "",
    timeOfDay: DayStructureTimeOfDay.Morning,
  });
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").add(12, "hours").toISOString(),
    endTimeISO: moment(time).startOf("day").add(18, "hours").toISOString(),
    bodyLabel: "Afternoon",
    startLabel: "",
    bodyBackgroundColor: "rgba(0, 0, 0, 0.01)",
    activityCategoryDefinitionTreeId: "",
    timeOfDay: DayStructureTimeOfDay.Afternoon,
  });
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").add(18, "hours").toISOString(),
    endTimeISO: moment(time).startOf("day").add(22, "hours").add(30, "minutes").toISOString(),
    bodyLabel: "Evening",
    startLabel: "",
    bodyBackgroundColor: "rgba(0, 0, 0, 0.01)",
    activityCategoryDefinitionTreeId: "",
    timeOfDay: DayStructureTimeOfDay.Evening,
  });
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").add(22, "hours").add(30, "minutes").toISOString(),
    endTimeISO: moment(time).startOf("day").add(23, "hours").toISOString(),
    bodyLabel: "Bedtime routine",
    startLabel: "",
    bodyBackgroundColor: "rgba(0, 0, 0, 0.01)",
    activityCategoryDefinitionTreeId: "",
    timeOfDay: DayStructureTimeOfDay.Other,
  });
  dayStructureItems.push({
    startTimeISO: moment(time).startOf("day").add(23, "hours").toISOString(),
    endTimeISO: moment(time).endOf("day").toISOString(),
    bodyLabel: "Sleeping",
    startLabel: "",
    bodyBackgroundColor: "rgba(0, 0, 255, 0.1)",
    activityCategoryDefinitionTreeId: "",
    timeOfDay: DayStructureTimeOfDay.Other,
  });
  return dayStructureItems;
}

