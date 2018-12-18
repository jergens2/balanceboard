import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { CategorizedActivity } from '../../activities/categorized-activity.model';
import { TimeMark } from '../../time-mark.model';
import { ITimeMarkTile } from '../timeMarkTile.interface';
import { TimeMarkActivity } from '../../time-mark-activity.model';
import { faCircle, faTimes, faCog } from '@fortawesome/free-solid-svg-icons';

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
  @Output() cancel: EventEmitter<ITimeMarkTile> = new EventEmitter();
  @Input('updateTimeMark') set updateTimeMark(timeMarkTile: ITimeMarkTile) {
    this.timeMarkTile = timeMarkTile;
  }

  ngOnInit() {
    this.updateTimeMarkForm = new FormGroup({
      'description': new FormControl(this.timeMarkTile.timeMark.description)
    })
  }



  onClickSaveChanges(){

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
