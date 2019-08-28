import * as moment from 'moment';

export class DurationString{
    public static calculateDurationString(startTime: moment.Moment, endTime: moment.Moment, abbreviate?: boolean): string{
        let minutes: number = moment(endTime).diff(startTime, "minutes");

        let hoursLabel = "hour";
        let minutesLabel = "minute";
        let secondsLabel = "second";
        let daysLabel = "day";
        let abbreviated: boolean = false;
        if(abbreviate === true){
          abbreviated = true;
          hoursLabel = "h";
          minutesLabel = "m";
          secondsLabel = "s";
          daysLabel = "d";
        }

        let durationString: string = "";
        function plurality(value: number, label: string, abbreviated: boolean): string {
          if (value == 1) {
            durationString = "1 " + label + "";
          } else {
            if(abbreviated){
              durationString = "" + value + "" + label;
            }else{
              durationString = "" + value + " " + label + "s";
            }
          }
          return durationString;
        }
        
        let gap: string = ", ";
        if(abbreviated){
          gap = " ";
        }
    
        if (minutes < 60) {
          durationString = plurality(minutes, minutesLabel, abbreviated);
        } else if (minutes >= 60 && minutes < 1440) {
          let hours = Math.floor(minutes / 60);
          minutes = minutes - (hours * 60);
    
          durationString = plurality(hours, hoursLabel, abbreviated) + gap + plurality(minutes, minutesLabel, abbreviated);
        } else if (minutes >= 1440) {
          let days = Math.floor(minutes / 1440);
          minutes = minutes - (days * 1440);
          let remainingString: string = "";
          if (minutes > 60) {
            let hours: number = Math.floor(minutes / 60)
            minutes = minutes - (hours * 60);
            remainingString = plurality(hours, minutesLabel, abbreviated) + gap + plurality(minutes, minutesLabel, abbreviated);
          } else {
            remainingString = plurality(minutes, minutesLabel, abbreviated);
          }
          durationString = plurality(days, daysLabel, abbreviated) + gap + remainingString;
        }
        return durationString;
    }
}