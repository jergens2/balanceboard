import { Component, OnInit, Input } from '@angular/core';
import { ActivityCategoryDefinition } from '../../../shared/document-definitions/activity-category-definition/activity-category-definition.class';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { Modal } from '../../../modal/modal.class';
import { ModalComponentType } from '../../../modal/modal-component-type.enum';
import { ModalService } from '../../../modal/modal.service';
import { IModalOption } from '../../../modal/modal-option.interface';
import { ActivityCategoryDefinitionService } from '../../../shared/document-definitions/activity-category-definition/activity-category-definition.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {

  faTimes = faTimes;
  faEdit = faEdit;

  constructor(private modalService: ModalService, private activitiesService: ActivityCategoryDefinitionService) { }

  @Input() activity: ActivityCategoryDefinition;

  ngOnInit() {
  }

  mouseOverHeader: boolean = false;
  onMouseEnterHeader(){
    // console.log("onmouseEnter")
    this.mouseOverHeader = true;
  }

  onMouseLeaveHeader(){
    // console.log("onmouseLeave")
    this.mouseOverHeader = false;
  }

  expanded: boolean = false;
  onClickHeader(){
    this.expanded = !this.expanded;
    console.log("Clicked:", this.activity.name)
  }

  onClickDeleteActivity(){
    let modalOptions: IModalOption[] = [
      {
        value: "Delete",
        dataObject: null,
      },
      {
        value: "Cancel",
        dataObject: null,
      }
    ]
    let modal: Modal = new Modal("Delect Activity: "+this.activity.name + "?", "", null, modalOptions, null, ModalComponentType.Confirm);
    this.modalService.activeModal = modal;
    this.modalService.modalResponse$.subscribe((response) => {
      if(response.value == "Delete"){
        this.activitiesService.deleteActivity(this.activity);
      }
    });
  }
  onClickEditActivity(){
    let modal: Modal = new Modal("Edit Activity "+this.activity.name, "", this.activity, [], null, ModalComponentType.ActivityCategoryDefinition);
    this.modalService.activeModal = modal;
    this.modalService.modalResponse$.subscribe((response) => {
      console.log("modal response:", response);
    });
  }

}
