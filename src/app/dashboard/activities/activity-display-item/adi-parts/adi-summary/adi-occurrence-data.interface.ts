export interface ADIOccurrence {
    dateYYYYMMDD: string;
    startTime: moment.Moment;
    endTime: moment.Moment;
    durationMs: number;
}

export interface ADIOccurrenceData {
    activityTreeId: string;
    occurrences: ADIOccurrence[];
    totalMs: number;
    msPerOccurrence: number;
}
