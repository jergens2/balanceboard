
export interface IActivityData {
    totalMinutes: number;
    totalHours: number;
    minutes: number;
    hours: number;
    activities: {
       name: string,
       durationMinutes: number 
    }[];
}