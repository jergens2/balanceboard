import { TimeOfDay } from "./time-of-day-enum";

export class TimeOfDayConverter{

    public static convertToString(timeOfDay: TimeOfDay, lowerCase?: boolean): string{
        if(timeOfDay == TimeOfDay.EarlyMorning){
            if(lowerCase){
                return "early morning";
            }else{
                return "Early morning";
            }
        }
        if(timeOfDay == TimeOfDay.Morning){
            if(lowerCase){
                return "morning";
            }else{
                return "Morning";
            }
        }
        if(timeOfDay == TimeOfDay.Afternoon){
            if(lowerCase){
                return "afternoon";
            }else{
                return "Afternoon";
            }
        }
        if(timeOfDay == TimeOfDay.Evening){
            if(lowerCase){
                return "evening";
            }else{
                return "Evening";
            }
        }
        return "";
    }

    public static convertToUnit(timeOfDay: string): TimeOfDay{
        timeOfDay = timeOfDay.toLowerCase();
        if(timeOfDay == "early morning"){
            return TimeOfDay.EarlyMorning;
        }else if(timeOfDay == "morning"){
            return TimeOfDay.Morning;
        }else if(timeOfDay == "afternoon"){
            return TimeOfDay.Afternoon;
        }else if(timeOfDay == "evening"){
            return TimeOfDay.Evening;
        }
        return null;
    }


}