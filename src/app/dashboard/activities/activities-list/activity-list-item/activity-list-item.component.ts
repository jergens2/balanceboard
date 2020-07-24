import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';
import { faTimes, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { faEdit, faArrowAltCircleRight, faArrowAltCircleDown } from '@fortawesome/free-regular-svg-icons';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { ModalService } from '../../../../modal/modal.service';
import { ActivityCategoryDefinitionService } from '../../api/activity-category-definition.service';
import { ActivityListItem } from './activity-list-item.class';

@Component({
  selector: 'app-activity-list-item',
  templateUrl: './activity-list-item.component.html',
  styleUrls: ['./activity-list-item.component.css']
})
export class ActivityListItemComponent implements OnInit {

  faTimes = faTimes;
  faEdit = faEdit;
  public get faTrashAlt() { return faTrashAlt; }

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
  faSyncAlt = faSyncAlt;
}
