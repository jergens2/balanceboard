import { TimeUnit } from "../../../shared/utilities/time-unit.enum";

export interface ActivityTargetConfiguration{
    frame: TimeUnit,
    
    minimumOccurrencesPerFrame: number,
    idealOccurrencesPerFrame: number,
    maximumOccurrencesPerFrame: number,

    minimumDurationMinutesPerOccurrence: number;
    idealDurationMinutesPerOccurrence: number;
    maximumDurationMinutesPerOccurrence: number;
    
    minimumDurationMinutesPerFrame: number, 
    idealDurationMinutesPerFrame: number,
    maximumDurationMinutesPerFrame: number,

    asOfDateTimeISO: string;
}