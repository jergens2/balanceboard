import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { UserDefinedActivity } from '../user-defined-activity.model';
import { ActivitiesService } from '../activities.service';
import { Subscription } from 'rxjs';
import { IActivityInstance } from './activity-instance.interface';
import * as moment from 'moment';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-activity-display',
  templateUrl: './activity-display.component.html',
  styleUrls: ['./activity-display.component.css']
})
export class ActivityDisplayComponent implements OnInit, OnDestroy {

  faSpinner = faSpinner;

  constructor(private activitiesService: ActivitiesService) { }

  ifLoading: boolean = true;

  activityInstances: IActivityInstance[] = [];

  activity: UserDefinedActivity = null;

  private activityDataSubscription: Subscription = new Subscription();

  @Input() set selectedActivity(activity: UserDefinedActivity){
    this.activity = activity;
    this.getActivityData();
  }
  ngOnInit() {
    
  }

  private getActivityData(){
    this.ifLoading = true;
    this.activityInstances = [];
    this.activityDataSubscription.unsubscribe();
    this.activityDataSubscription = this.activitiesService.getActivityData(this.activity).subscribe((response: {data: any, message: string})=>{
      console.log("response from activities service: ", response)
      /*2222
        data is of type TimeSegment[] from server

        need to map data to interface type IActivityInstance
      */

      for(let data of response.data){
        let startTime: moment.Moment = moment(data.startTimeISO);
        let endTime: moment.Moment = moment(data.endTimeISO);
        let durationHours = moment(endTime).diff(moment(startTime), 'minutes')  / 60;
        let instance: IActivityInstance = { startTime: startTime, endTime: endTime, durationHours: durationHours, activityTreeId: this.activity.treeId }
        this.activityInstances.push(instance);
      }




      this.ifLoading = false;
    });
    
  }

  ngOnDestroy(){
    this.activityDataSubscription.unsubscribe();
  }

}
