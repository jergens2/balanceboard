import { Component, OnInit, Input } from '@angular/core';
import { IActivityInstance } from '../activity-instance.interface';
import { UserDefinedActivity } from '../../user-defined-activity.model';

import * as moment from 'moment';

@Component({
  selector: 'app-activity-planning',
  templateUrl: './activity-planning.component.html',
  styleUrls: ['./activity-planning.component.css']
})
export class ActivityPlanningComponent implements OnInit {


  private _activityInstances: IActivityInstance[];
  private _activity: UserDefinedActivity;

  @Input() set activityInstances(activityInstances: IActivityInstance[]) {
    this._activityInstances = activityInstances;
  }
  @Input() set activity(activity: UserDefinedActivity) {
    this._activity = activity;
  }

  constructor() { }

  ngOnInit() {
    
    
    let weeksAverages: number[] = [];
    let totalAverage: number = 0;
    let currentWeekMarker: moment.Moment = moment(this._activityInstances[0].startTime).startOf('week');
    let endWeekMarker: moment.Moment = moment(currentWeekMarker).add(7,'days');
    
    let weekSum: number = 0;
    for(let instance of this._activityInstances){
      if(moment(instance.startTime).isSameOrAfter(currentWeekMarker) && moment(instance.startTime).isBefore(moment(endWeekMarker))){
        weekSum += instance.durationHours;
      }else if(moment(instance.startTime).isAfter(currentWeekMarker)){
        weeksAverages.push(weekSum);
        weekSum = 0;
        weekSum += instance.durationHours;
        currentWeekMarker = moment(currentWeekMarker).add(7,'days');
        endWeekMarker = moment(endWeekMarker).add(7,'days');
      }else{
        console.log("Wtf")
      }

    }

    console.log("weekSums is", weeksAverages);
    let totalSum: number = 0;
    for(let sum of weeksAverages){
      totalSum += sum;
    }
    totalAverage = totalSum / weeksAverages.length;

    console.log("average per all week:", totalAverage);

  }

}
