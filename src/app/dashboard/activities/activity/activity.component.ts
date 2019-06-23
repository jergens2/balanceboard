import { Component, OnInit, Input } from '@angular/core';
import { ActivityCategoryDefinition } from '../../../shared/document-definitions/activity-category-definition/activity-category-definition.class';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {

  faTimes = faTimes;
  faEdit = faEdit;

  constructor() { }

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
    console.log("jeclicked")
  }
  onClickEditActivity(){
    console.log("jeclickedzzz")
  }

}
