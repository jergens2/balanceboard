export interface ITemplateTimeRange{ 
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;

    /*
        By the definition and arrangement, a time range cannot lapse past midnight.  if in practice it would, then you would need to set up 2 separate ranges, 
        one from startTime -> midnight, and one from start of day (midnight) -> endTime

    */
}