
export interface RecurringTaskRepitition{
    value: number,
    period: RecurringTaskRepititionPeriod,
    startDate: string,
}

export enum RecurringTaskRepititionPeriod {
    Hours = "hours",
    Days = "days",
    Weeks = "weeks",
    Months = "months",
    Years = "years"
}
