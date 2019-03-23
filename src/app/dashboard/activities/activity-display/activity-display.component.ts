import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { UserDefinedActivity } from '../user-defined-activity.model';
import { ActivitiesService } from '../activities.service';
import { Subscription } from 'rxjs';
import { IActivityInstance } from './activity-instance.interface';
import * as moment from 'moment';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { ActivityTree } from '../activity-tree.model';
import { TimeSegment } from '../../daybook/time-log/time-segment.model';

@Component({
  selector: 'app-activity-display',
  templateUrl: './activity-display.component.html',
  styleUrls: ['./activity-display.component.css']
})
export class ActivityDisplayComponent implements OnInit, OnDestroy {

  faSpinner = faSpinner;
  faEdit = faEdit;

  constructor(private activitiesService: ActivitiesService) { }

  ifLoading: boolean = true;

  activityInstances: IActivityInstance[] = [];
  activityTimeSegments: TimeSegment[] = [];

  activity: UserDefinedActivity = null;

  private activityDataSubscription: Subscription = new Subscription();

  action: string = "view";

  @Output() displayClosed: EventEmitter<boolean> = new EventEmitter();

  @Input() set selectedActivity(activity: UserDefinedActivity) {
    this.action = "view";
    this.activity = activity;
    this.getActivityData();
  }
  ngOnInit() {
    this.action = "view";

    this.activitiesService.activitiesTree$.subscribe((newTree: ActivityTree) => {
      let foundActivity = newTree.findActivityByTreeId(this.activity.treeId);
      this.activity = Object.assign({}, foundActivity);
      this.getActivityData();
    });


  }

  private getActivityData() {
    this.ifLoading = true;
    this.activityInstances = [];
    this.activityDataSubscription.unsubscribe();
    this.activityDataSubscription = this.activitiesService.getActivityData(this.activity).subscribe((timeSegments: TimeSegment[]) => {
      let activityInstances: IActivityInstance[] = [];
      for (let timeSegment of timeSegments) {

        let timeForThisActivity: number = 0;
        if(timeSegment.activities.length > 1){
          
          let timeSegmentDuration: number = moment(timeSegment.endTimeISO).diff(moment(timeSegment.startTimeISO), 'minutes');
          timeForThisActivity =  timeSegmentDuration / timeSegment.activities.length;

        }else{
          timeForThisActivity = moment(timeSegment.endTimeISO).diff(moment(timeSegment.startTimeISO), 'minutes');
        }

        let durationHours: number = timeForThisActivity / 60;
        let instance: IActivityInstance = { startTime: moment(timeSegment.startTime), endTime: moment(timeSegment.endTime), durationHours: durationHours, activityTreeId: this.activity.treeId }
        activityInstances.push(instance);
      }

      this.activityTimeSegments = timeSegments;
      this.activityInstances = activityInstances
      this.ifLoading = false;
    });

  }

  onClickEdit() {
    this.action = "edit";
  }

  onFormClosed(val: string) {
    this.action = "view";
    if (val == "DELETE") {
      this.displayClosed.emit();
    }

  }

  ngOnDestroy() {
    this.activityDataSubscription.unsubscribe();
  }

  onClickCloseActivity() {
    this.displayClosed.emit();
    this.ngOnDestroy();
  }

}
