export interface ADIOccurrenceData {
    activityTreeId: string;
    occurrences: {
        dateYYYYMMDD: string,
        startTime: moment.Moment,
        endTime: moment.Moment,
        durationMs: number,
    }[];
    totalMs: number;
    msPerOccurrence: number;
}