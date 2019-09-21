import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faEdit, faArrowAltCircleRight, faArrowAltCircleDown } from '@fortawesome/free-regular-svg-icons';
import { Modal } from '../../../modal/modal.class';
import { ModalComponentType } from '../../../modal/modal-component-type.enum';
import { ModalService } from '../../../modal/modal.service';
import { IModalOption } from '../../../modal/modal-option.interface';
import { ActivityCategoryDefinitionService } from '../api/activity-category-definition.service';
import { ActivityListItem } from './activity-list-item.class';

@Component({
  selector: 'app-activity-list-item',
  templateUrl: './activity-list-item.component.html',
  styleUrls: ['./activity-list-item.component.css']
})
export class ActivityListItemComponent implements OnInit {

  faTimes = faTimes;
  faEdit = faEdit;

  constructor(private modalService: ModalService, private activitiesService: ActivityCategoryDefinitionService) { }

  @Input() activity: ActivityCategoryDefinition;
  @Output() activityOpened: EventEmitter<ActivityCategoryDefinition> = new EventEmitter();
  public onClickActivity(){
    this.activityOpened.emit(this.activity);
  }
  public onChildActivityOpened(childActivity: ActivityCategoryDefinition){
    this.activityOpened.emit(childActivity);
  }

  activityListItem: ActivityListItem;

  ngOnInit() {
    this.activityListItem = new ActivityListItem(this.activity);
    this.activityListItem.onClickExpand();
  }

  faArrowAltCircleRight = faArrowAltCircleRight;
  faArrowAltCircleDown = faArrowAltCircleDown;







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
