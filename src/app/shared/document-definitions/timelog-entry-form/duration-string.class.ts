import * as moment from 'moment';

export class DurationString{
    public static calculateDurationString(startTime: moment.Moment, endTime: moment.Moment): string{
        let minutes: number = moment(endTime).diff(startTime, "minutes");

        function plurality(value: number, name: string): string {
          if (value == 1) {
            return "1 " + name + "";
          } else {
            return "" + value + " " + name + "s";
          }
        }
    
        if (minutes < 60) {
          return plurality(minutes, "minute");
        } else if (minutes >= 60 && minutes < 1440) {
          let hours = Math.floor(minutes / 60);
          minutes = minutes - (hours * 60);
    
          return plurality(hours, "hour") + ", " + plurality(minutes, "minute");
        } else if (minutes >= 1440) {
          let days = Math.floor(minutes / 1440);
          minutes = minutes - (days * 1440);
          let remainingString: string = "";
          if (minutes > 60) {
            let hours: number = Math.floor(minutes / 60)
            minutes = minutes - (hours * 60);
            remainingString = plurality(hours, "hour") + "," + plurality(minutes, "minute");
          } else {
            remainingString = plurality(minutes, "minute");
          }
          return plurality(days, "day") + ", " + remainingString;
        }
    
    
        return "";
    }
}