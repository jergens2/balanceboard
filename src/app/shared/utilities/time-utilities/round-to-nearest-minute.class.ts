import * as moment from 'moment';
export class RoundToNearestMinute {
    public static roundToNearestMinute(time: moment.Moment, roundToMinute: number, direction?: "UP" | "DOWN"): moment.Moment {
        let currentMinute: number = time.minute();
        let half = roundToMinute / 2;
        let mod: number = currentMinute % roundToMinute;

        let newMinute: number = 0;
        if (direction != null) {
            if (mod !== 0) {
                if (direction === "UP") {
                    newMinute = currentMinute - mod + roundToMinute
                } else if (direction === "DOWN") {
                    newMinute = currentMinute - mod;
                }
            }
        } else {
            if (mod >= half) {
                newMinute = currentMinute - mod + roundToMinute
            } else {
                newMinute = currentMinute - mod;
            }
        }
        return moment(time).startOf("hour").add(newMinute, "minutes");
    }
}