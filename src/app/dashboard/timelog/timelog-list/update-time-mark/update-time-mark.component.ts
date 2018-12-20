import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { CategorizedActivity } from '../../activities/categorized-activity.model';
import { TimeMark } from '../../time-mark.model';
import { ITimeMarkTile } from '../timeMarkTile.interface';
import { TimeMarkActivity } from '../../time-mark-activity.model';
import { faCircle, faTimes, faCog } from '@fortawesome/free-solid-svg-icons';


export interface ITimeMarkUpdateActivity{
  ifUpdateActivity: boolean
  
}

@Component({
  selector: 'app-update-time-mark',
  templateUrl: './update-time-mark.component.html',
  styleUrls: ['./update-time-mark.component.css']
})
export class UpdateTimeMarkComponent implements OnInit {

  constructor() { }

  updateTimeMarkForm: FormGroup;
  faCircle = faCircle;

  faCog = faCog;
  faTimes = faTimes;

  timeMarkTile: ITimeMarkTile;
  private unsavedTimeMark: TimeMark = null;
  get tileActivities(): TimeMarkActivity[]{
    return this.unsavedTimeMark.activities;
  }
  

  @Output('update') updatedTimeMark: EventEmitter<TimeMark> = new EventEmitter(); 
  @Output() cancel: EventEmitter<ITimeMarkTile> = new EventEmitter();
  @Input('updateTimeMark') set updateTimeMark(timeMarkTile: ITimeMarkTile) {
    this.timeMarkTile = timeMarkTile;
    let tileTimeMark = this.timeMarkTile.timeMark;
    this.unsavedTimeMark = new TimeMark(tileTimeMark.id, tileTimeMark.userId, tileTimeMark.startTimeISO, tileTimeMark.endTimeISO);
    for(let activity of tileTimeMark.activities){
      this.unsavedTimeMark.activities.push(new TimeMarkActivity(Object.assign({}, activity.activity)))
    }

  }

  ngOnInit() {
    this.updateTimeMarkForm = new FormGroup({
      'description': new FormControl(this.timeMarkTile.timeMark.description)
    })
  }


  onClickDeleteActivity(activity: TimeMarkActivity){
    let newActivities = this.unsavedTimeMark.activities;
    newActivities.splice(newActivities.indexOf(activity), 1);
    this.unsavedTimeMark.activities = newActivities;
    
  }

  onClickUpdateActivity(activity: TimeMarkActivity){
    this.ifActivityForm = true;
  }


  onActivityUpdated(activity){
    console.log("activity updated", activity);
  }

  ifActivityForm: boolean = false;
  onCloseActivityForm($event){
    this.ifActivityForm = false;
  }

  onClickSaveChanges(){
    this.unsavedTimeMark.description = this.updateTimeMarkForm.get('description').value;
    this.updatedTimeMark.emit(this.unsavedTimeMark);
    this.timeMarkTile.ifUpdateTimeMark = false;
  }

  onClickCancel(){
    this.timeMarkTile.ifUpdateTimeMark = false;
  }



  activityName(activity: any){
    if(activity.activityTreeId){
      return activity.activity.name;
    }else{
      let oldActivityType: any = activity;
      return oldActivityType.activity.name
    }
  }
  activityColor(activity: any){
    if(activity.activityTreeId){
      return activity.activity.color;
    }else{
      let oldActivityType: any = activity;
      return oldActivityType.activity.color;
    }
  }

}
