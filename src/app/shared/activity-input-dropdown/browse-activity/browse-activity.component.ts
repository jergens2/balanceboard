import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityCategoryDefinition } from '../../document-definitions/activity-category-definition/activity-category-definition.class';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-browse-activity',
  templateUrl: './browse-activity.component.html',
  styleUrls: ['./browse-activity.component.css']
})
export class BrowseActivityComponent implements OnInit {

  faCaretRight = faCaretRight;
  faCaretDown = faCaretDown;

  isExpanded: boolean = false;
  onClickExpand(){
    this.isExpanded = !this.isExpanded;
  }

  constructor() { }

  @Input() activity: ActivityCategoryDefinition;
  @Output() activitySelected: EventEmitter<ActivityCategoryDefinition> = new EventEmitter();

  ngOnInit() {
  }


  onSelectActivity(activity: ActivityCategoryDefinition){
    this.activitySelected.emit(activity);
  }
}
