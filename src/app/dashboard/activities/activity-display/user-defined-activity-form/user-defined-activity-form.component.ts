import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserDefinedActivity } from '../../user-defined-activity.model';

@Component({
  selector: 'app-user-defined-activity-form',
  templateUrl: './user-defined-activity-form.component.html',
  styleUrls: ['./user-defined-activity-form.component.css']
})
export class UserDefinedActivityFormComponent implements OnInit {


  private _activity: UserDefinedActivity = null;
  private _action: string = "new";
  @Input() set activity(activity: UserDefinedActivity){
    this._activity = activity;
    this._action = "modify";
  }

  @Output() formClosed: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }


  ngOnInit() {
    console.log("action is ", this._action);
  }


  onClickCancel(){
    this.formClosed.emit(true);
  }

}
