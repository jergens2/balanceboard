import * as moment from 'moment';

export class DayTemplate{


    id: string;
    name: string; // can be anything, but basic ones will be "Weekend", "Work day", "School day", "Holiday", etc.

    dayOfRotation: number;  //not zero-based; 1, 2, 3, 4, 5, 6, 7 ...
    date: string; //YYYY-MM-DD


    sleepTimeRanges: {startTime: moment.Moment, endTime: moment.Moment} = null
    nonDiscretionaryTimeRanges: {startTime: moment.Moment, endTime: moment.Moment} = null;
    discretionaryTimeRanges: {startTime: moment.Moment, endTime: moment.Moment} = null;

    /*
        what about "Somewhat-Discretionary" time, such as routine stuff like Gym, Cooking, Cleaning, Chores, Errands, etc.

    */


    constructor(dayOfRotation: number, date: moment.Moment){
        this.dayOfRotation = dayOfRotation;
        this.date = moment(date).format('YYYY-MM-DD');
    }


}