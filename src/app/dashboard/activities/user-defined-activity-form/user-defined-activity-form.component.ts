import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserDefinedActivity } from '../user-defined-activity.model';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivitiesService } from '../activities.service';
import { ActivityTree } from '../activity-tree.model';
import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons';
import { ModalService } from '../../../modal/modal.service';
import { Modal } from '../../../modal/modal.model';
import { IModalOption } from '../../../modal/modal-option.interface';
import { ModalComponentType } from '../../../modal/modal-component-type.enum';

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

  parentActivity: UserDefinedActivity = null;

  @Input() public set activity(activity: UserDefinedActivity) {
    this._activity = activity;
    this._action = "edit";
    let topLevelActivityString = activity.userId + "_TOP_LEVEL";
    if (activity.parentTreeId == topLevelActivityString) {
      this.ifTopLevelActivity = true;
      this.parentActivity = null;
    } else {
      this.ifTopLevelActivity = false;
      this.parentActivity = this.activitiesService.findActivityByTreeId(activity.parentTreeId);
    }

    this.colorPickerValue = activity.color;
  }
  public get activity(): UserDefinedActivity {
    return this._activity;
  }

  @Input() set formAction(action: "string") {
    this._action = action;
  }

  get action(): string{
    return this._action;
  }

  @Output() formClosed: EventEmitter<string> = new EventEmitter<string>();

  constructor(private activitiesService: ActivitiesService, private modalService: ModalService) { }

  activityForm: FormGroup = null;
  private activityTree: ActivityTree = null;
  colorPickerValue: string = "#fafafa";



  ngOnInit() {
    this.activityTree = this.activitiesService.activitiesTree;
    if (this._action == "new") {
      this.activityForm = new FormGroup({
        'name': new FormControl(null, Validators.required),
        'description': new FormControl(),
        'parent': new FormControl(null, Validators.required),
        'color': new FormControl(null, Validators.required)

      });
    } else if (this._action == "edit") {

      let parentActivityId: string = "";
      if(this.ifTopLevelActivity){
        parentActivityId = this.activitiesService.userId + "_TOP_LEVEL";
      }else{
        parentActivityId = this.parentActivity.treeId;
      }

      this.activityForm = new FormGroup({
        'name': new FormControl(this.activity.name, Validators.required),
        'description': new FormControl(),
        'parent': new FormControl(parentActivityId, Validators.required),
        'color': new FormControl(this.activity.color, Validators.required)

      });
    }
  }


  onActivityInputDropdownValueChanged(activity: UserDefinedActivity) {
    this.parentActivity = activity;
  }

  get activityName(): string {
    if(this._activity){
      return this._activity.name;
    }
    return "";
  }

  get headerAction(): string {
    if (this._action == "new") {
      return "Create New Activity";
    } else if (this._action == "edit") {
      return "Edit Activity: ";
    }
  }

  onClickCancel() {
    this.formClosed.emit("CANCEL");
  }

  onClickSaveActivity() {

    this.activityForm.patchValue({'color': this.colorPickerValue});

    let parentActivityId: string;
    if (this.ifTopLevelActivity) {
      parentActivityId = this.activitiesService.userId + "_TOP_LEVEL";
      this.activityForm.patchValue({ 'parent': parentActivityId });
    } else {
      if (this.parentActivity != null) {
        parentActivityId = this.parentActivity.treeId;
        this.activityForm.patchValue({ 'parent': this.parentActivity.name });
      } else {
        //error ?
      }
    }

    if (this._action == "new") {
      if (this.activityForm.valid && parentActivityId != null) {
        console.log("saving new activity");


        let saveNewActivity: UserDefinedActivity = new UserDefinedActivity('', '', '', this.activityForm.controls['name'].value, this.activityForm.controls['description'].value, parentActivityId, this.activityForm.controls['color'].value);
        this.activitiesService.saveActivity(saveNewActivity);
        this.formClosed.emit("SAVE_NEW");
      } else {
        console.log("Is parentActivityID null ? ", parentActivityId);
        console.log("Error : Form is invalid.");
      }

    }
    else if(this._action == "edit"){
      if (this.activityForm.valid) {

        let modifyActivity: UserDefinedActivity = Object.assign({}, this.activity);
        modifyActivity.name =  this.activityForm.controls['name'].value;
        modifyActivity.description = this.activityForm.controls['description'].value;
        modifyActivity.parentTreeId = parentActivityId;
        modifyActivity.color =  this.activityForm.controls['color'].value;
        this.activitiesService.updateActivity(modifyActivity);
        this.formClosed.emit("SAVE_EDIT");
      } else {
        console.log("Error : Form is invalid.")
      }
    }



  }

  onClickDeleteActivity(){   
    let modalOptions: IModalOption[] = [
      {
        value: "Yes",
        dataObject: null
      },
      {
        value: "No",
        dataObject: null
      }
    ];  
    let modal: Modal = new Modal("Delect Activity", "Confirm: Delete Activity?", null, modalOptions, {}, ModalComponentType.Default);
    let modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption)=>{
      if(selectedOption.value == "Yes"){
        this.activitiesService.deleteActivity(this.activity);
        this.formClosed.emit("DELETE");
      }else if(selectedOption.value == "No"){

      }else{
        //error 
      }
    });
    this.modalService.activeModal = modal;
  }

}
