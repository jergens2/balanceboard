import * as moment from 'moment';
export class RoundToNearestMinute{
    public static roundToNearestMinute(time: moment.Moment, roundToMinute: number): moment.Moment{
        let currentMinute: number = time.minute();
        let half = roundToMinute/2;
        let mod: number = currentMinute % roundToMinute;

        let newMinute: number = 0;
        if(mod >= half){
            newMinute = currentMinute - mod + roundToMinute
        }else{
            newMinute = currentMinute - mod;
        }
        let newTime: moment.Moment;
        if(newMinute == 60){
            newTime = moment(time).startOf("hour").add(60, "minutes");
        }else{
            newTime = moment(time).minute(newMinute);
        }
        return newTime;
    }
}