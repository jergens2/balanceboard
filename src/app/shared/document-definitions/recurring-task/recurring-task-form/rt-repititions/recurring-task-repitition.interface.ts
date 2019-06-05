
export interface RecurringTaskRepitition{
    value: number,
    period: RecurringTaskRepititionPeriod,
    startDate: string,
}

export enum RecurringTaskRepititionPeriod {
    Hours = "HOURS",
    Days = "DAYS",
    Weeks = "WEEKS",
    Months = "MONTHS",
    Years = "Years"
}