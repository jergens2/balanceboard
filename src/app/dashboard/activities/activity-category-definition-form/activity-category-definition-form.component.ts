import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivityCategoryDefinitionService } from '../api/activity-category-definition.service';
import { ActivityTree } from '../api/activity-tree.class';
import { faCheckCircle, faCircle, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { ModalService } from '../../../modal/modal.service';
import { ActivityCategoryDefinitionHttpShape } from '../api/activity-category-definition-http-shape.interface';
import { Guid } from '../../../shared/utilities/guid.class';
import { ActivityDurationSetting } from '../api/activity-duration.enum';
import { DefaultActivityCategoryDefinitions } from '../api/default-activity-category-definitions.class';



@Component({
  selector: 'app-activity-category-definition-form',
  templateUrl: './activity-category-definition-form.component.html',
  styleUrls: ['./activity-category-definition-form.component.css']
})
export class ActivityCategoryDefinitionFormComponent implements OnInit {


  faCheckCircle = faCheckCircle;
  faCircle = faCircle;
  faTrashAlt = faTrashAlt;

  ifTopLevelActivity: boolean = true;

  private _activity: ActivityCategoryDefinition = null;
  private _action: string = "new";

  parentActivity: ActivityCategoryDefinition = null;

  @Input("activityCategoryDefinition") public set activity(activity: ActivityCategoryDefinition) {
    if (activity) {
      this._activity = activity;
      this._action = "edit";
      let topLevelActivityString = activity.userId + "_TOP_LEVEL";
      if (activity.parentTreeId == topLevelActivityString) {
        this.ifTopLevelActivity = true;
        this.parentActivity = null;
      } else {
        this.ifTopLevelActivity = false;
        this.parentActivity = this.activityCategoryDefinitionService.findActivityByTreeId(activity.parentTreeId);
      }

      this.pickedColor = activity.color;
    }

  }
  public get activity(): ActivityCategoryDefinition {
    return this._activity;
  }

  @Input() set formAction(action: "string") {
    this._action = action;
  }

  get action(): string {
    return this._action;
  }

  // @Output() formClosed: EventEmitter<string> = new EventEmitter<string>();

  constructor(private activityCategoryDefinitionService: ActivityCategoryDefinitionService, private modalService: ModalService) { }

  activityForm: FormGroup = null;
  private activityTree: ActivityTree = null;
  pickedColor: string = "#fafafa";




  ngOnInit() {
    this.activityTree = this.activityCategoryDefinitionService.activitiesTree;
    if (this._action == "new") {
      this.activityForm = new FormGroup({
        'name': new FormControl(null, Validators.required),
        'description': new FormControl(),
        'parent': new FormControl(null, Validators.required),
        'color': new FormControl("#ffffff", Validators.required)

      });
    } else if (this._action == "edit") {

      let parentActivityId: string = "";
      if (this.ifTopLevelActivity) {
        parentActivityId = this.activityCategoryDefinitionService.userId + "_TOP_LEVEL";
      } else {
        parentActivityId = this.parentActivity.treeId;
      }

      this.activityForm = new FormGroup({
        'name': new FormControl(this.activity.name, Validators.required),
        'description': new FormControl(this.activity.description),
        'parent': new FormControl(parentActivityId, Validators.required),
        'color': new FormControl(this.activity.color, Validators.required)

      });

      this.onColorSelected(this.activity.color);
    }
  }


  onActivityInputDropdownValueChanged(activity: ActivityCategoryDefinition) {
    this.parentActivity = activity;
  }

  get activityName(): string {
    if (this._activity) {
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

  colorPicked: boolean = false;
  onColorSelected(value: string) {
    this.colorPicked = true;
    this.pickedColor = value;
    this.activityForm.controls["color"].setValue(value);
  }

  onClickCancel() {
    // this.formClosed.emit("CANCEL");
    this.modalService.closeModal();
  }

  onClickSaveActivity() {

    // this.activityForm.patchValue({'color': this.pickedColor});

    let parentActivityId: string;
    if (this.ifTopLevelActivity) {
      parentActivityId = this.activityCategoryDefinitionService.userId + "_TOP_LEVEL";
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
       
        let newActivity: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(this.activityCategoryDefinitionService.userId))
        newActivity.name = this.activityForm.controls['name'].value;
        newActivity.description = this.activityForm.controls['description'].value;
        newActivity.color = this.activityForm.controls['color'].value;
        newActivity.parentTreeId = parentActivityId;
        
        console.log("Saving " , newActivity);
        this.activityCategoryDefinitionService.saveActivity(newActivity);
        
      } else {
        console.log("Is parentActivityID null ? ", parentActivityId);
        console.log("Error : Form is invalid.");
      }

    }
    else if (this._action == "edit") {
      if (this.activityForm.valid) {

        let modifyActivity: ActivityCategoryDefinition = Object.assign({}, this.activity);
        modifyActivity.name = this.activityForm.controls['name'].value;
        modifyActivity.description = this.activityForm.controls['description'].value;
        modifyActivity.parentTreeId = parentActivityId;
        modifyActivity.color = this.activityForm.controls['color'].value;
        this.activityCategoryDefinitionService.updateActivity$(modifyActivity);
        // this.formClosed.emit("SAVE_EDIT");
      } else {
        console.log("Error : Form is invalid.")
      }
    }


    this.modalService.closeModal();
  }

  public get saveDisabled(): string {
    // if(this.activityForm.valid){
    //   return "";
    // }else{
    //   return "disabled";
    // }
    return "";
  }

  confirmDelete: boolean = false;
  onClickTrash() {
    this.confirmDelete = true;
  }
  onClickDeleteActivity() {
    this.activityCategoryDefinitionService.permanentlyDeleteActivity$(this.activity);
    this.modalService.closeModal();
  }


}
