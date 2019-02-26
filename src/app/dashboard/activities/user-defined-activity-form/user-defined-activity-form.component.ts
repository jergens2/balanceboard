import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserDefinedActivity } from '../user-defined-activity.model';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivitiesService } from '../activities.service';
import { ActivityTree } from '../activity-tree.model';
import { faCheckCircle, faCircle  } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-user-defined-activity-form',
  templateUrl: './user-defined-activity-form.component.html',
  styleUrls: ['./user-defined-activity-form.component.css']
})
export class UserDefinedActivityFormComponent implements OnInit {


  faCheckCircle = faCheckCircle;
  faCircle = faCircle;

  ifTopLevelActivity: boolean = true;

  private _activity: UserDefinedActivity = null;
  private _action: string = "new";
  @Input() public set activity(activity: UserDefinedActivity){
    this._activity = activity;
    this._action = "modify";
  }
  public get activity(): UserDefinedActivity{
    return this._activity;
  }

  @Input() set formAction(action: "string"){
    this._action = action;
  }

  @Output() formClosed: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private activitiesService: ActivitiesService) { }

  activityForm: FormGroup = null;
  private activityTree: ActivityTree = null;


  ngOnInit() {
    this.activityTree = this.activitiesService.activitiesTree;

    if(this._action == "new"){

    }else if(this._action == "edit"){
      this.activityForm = new FormGroup({
        'name': new FormControl(this.activity.name, Validators.required),
        'parent': new FormControl(this.activityTree.findActivityById(this.activity.parentTreeId).name, Validators.required),
        'color': new FormControl(this.activity.color)
  
      });
    }
    
    console.log("action is ", this._action);
  }

  get headerAction(): string{
    if(this._action == "new"){
      return "Create New Activity";
    }else if(this._action == "edit"){
      return "Edit Activity: " + this._activity.name;
    }
  }

  onClickCancel(){
    this.formClosed.emit(true);
  }

}
