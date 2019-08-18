import { DayStructureDataItem } from "./data-items/day-structure-data-item.interface";
import * as moment from 'moment';

let dayStructureDataItems: DayStructureDataItem[] = [];
dayStructureDataItems.push({
    startTimeISO: moment().startOf("day").toISOString(),
    endTimeISO: moment().startOf("day").add(7, "hours").toISOString(),
    bodyLabel: "Sleeping",
    startLabel: "Start of calendar day",
    bodyBackgroundColor: "rgba(0, 102, 255, 0.3)",
    activityCategoryDefinitionTreeId: "",
    isSleeping: true,
    isDraggable: false,
  });
  dayStructureDataItems.push({
    startTimeISO: moment().startOf("day").add(7, "hours").toISOString(),
    endTimeISO: moment().startOf("day").add(12, "hours").toISOString(),
    bodyLabel: "Morning",
    startLabel: "Wake up",
    bodyBackgroundColor: "rgba(255, 136, 0, 0.1)",
    activityCategoryDefinitionTreeId: "",
    isSleeping: false,
    isDraggable: true,
  });
  dayStructureDataItems.push({
    startTimeISO: moment().startOf("day").add(12, "hours").toISOString(),
    endTimeISO: moment().startOf("day").add(18, "hours").toISOString(),
    bodyLabel: "Afternoon",
    startLabel: "Noon",
    bodyBackgroundColor: "rgba(255, 136, 0, 0.1)",
    activityCategoryDefinitionTreeId: "",
    isSleeping: false,
    isDraggable: false,
  });
  dayStructureDataItems.push({
    startTimeISO: moment().startOf("day").add(18, "hours").toISOString(),
    endTimeISO: moment().startOf("day").add(23, "hours").toISOString(),
    bodyLabel: "Evening",
    startLabel: "",
    bodyBackgroundColor: "rgba(0, 102, 255, 0.1)",
    activityCategoryDefinitionTreeId: "",
    isSleeping: false,
    isDraggable: true,
  });
  dayStructureDataItems.push({
    startTimeISO: moment().startOf("day").add(23, "hours").toISOString(),
    endTimeISO: moment().endOf("day").toISOString(),
    bodyLabel: "Sleeping",
    startLabel: "Bedtime",
    bodyBackgroundColor: "rgba(0, 102, 255, 0.3)",
    activityCategoryDefinitionTreeId: "",
    isSleeping: true,
    isDraggable: true,
  });
  dayStructureDataItems.push({
    startTimeISO: moment().endOf("day").toISOString(),
    endTimeISO: moment().endOf("day").toISOString(),
    bodyLabel: "",
    startLabel: "End of calendar day",
    bodyBackgroundColor: "",
    activityCategoryDefinitionTreeId: "",
    isSleeping: true,
    isDraggable: false,
  });


export const defaultDayStructureDataItems: DayStructureDataItem[] = dayStructureDataItems;