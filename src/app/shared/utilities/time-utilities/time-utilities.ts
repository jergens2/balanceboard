import * as moment from 'moment';
export class TimeUtilities {
    public static roundToNearestMinute(time: moment.Moment, roundToMinute: number): moment.Moment {
        let currentMinute: number = time.minute();
        let half = roundToMinute / 2;
        let mod: number = currentMinute % roundToMinute;
        let newMinute: number;
        if (mod >= half) {
            newMinute = currentMinute - mod + roundToMinute
        } else {
            newMinute = currentMinute - mod;
        }
        return moment(time).startOf("hour").add(newMinute, "minutes");
    }

    public static roundUpToCeiling(time: moment.Moment, ceilingMinute: 5 | 10 | 15 | 20 | 30): moment.Moment {
        const mod = time.minute() % ceilingMinute
        if (mod === 0) {
            return moment(time).add(ceilingMinute, 'minutes');
        } else {
            let currentTime = moment(time).startOf('hour');
            
            while (currentTime.isSameOrBefore(moment(time).startOf('hour').add(1, 'hour'))) {
                if (currentTime.isAfter(time)) {
                    // console.log("Rounding up time (by : " + ceilingMinute + "): " + time.format('hh:mm a') + "  :output: " + currentTime.format('hh:mm a'))
                    return currentTime;
                }
                currentTime = moment(currentTime).add(ceilingMinute, 'minutes');
            }
            console.log('error: did not find a time:  ('+ceilingMinute+') : ' + time.format('hh:mm a') );
        }
        return time;
    }
    public static roundDownToFloor(time: moment.Moment, floorMinute: 5 | 10 | 15 | 20 | 30): moment.Moment {
        
        const mod = time.minute() % floorMinute
        if (mod === 0) {
            return time;
        } else {
            let currentTime = moment(time).startOf('hour').add(1, 'hour');
            while (currentTime.isSameOrAfter(moment(time).startOf('hour'))) {
                if (currentTime.isBefore(time)) {
                    // console.log("Rounding down time (by : " + floorMinute + "): " + time.format('hh:mm a') + "  :output: " + currentTime.format('hh:mm a'))
                    return currentTime;
                }
                currentTime = moment(currentTime).subtract(floorMinute, 'minutes');
            }
            console.log('error: did not find a time');
        }        
        return time;
    }
}