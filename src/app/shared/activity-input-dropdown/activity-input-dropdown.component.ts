import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { faCaretDown, faCaretRight, faSitemap, faSearch } from '@fortawesome/free-solid-svg-icons';

import { Subscription, Observable, fromEvent } from 'rxjs';
import { ActivityDropdownListItem } from './activity-dropdown-list-item.interface';
import { ActivityTree } from '../document-definitions/activity-category-definition/activity-tree.class';
import { ActivityCategoryDefinition } from '../document-definitions/activity-category-definition/activity-category-definition.class';
import { ActivityCategoryDefinitionService } from '../document-definitions/activity-category-definition/activity-category-definition.service';

@Component({
  selector: 'app-activity-input-dropdown',
  templateUrl: './activity-input-dropdown.component.html',
  styleUrls: ['./activity-input-dropdown.component.css']
})
export class ActivityInputDropdownComponent implements OnInit {


  faSitemap = faSitemap;
  faSearch = faSearch;

  searchAction: string = "search";
  onChangeAction(newAction: string){
    this.searchAction = newAction;
  }

  onActivitySelected(activity: ActivityCategoryDefinition){
    this.valueChanged.emit(activity);
  }

  activitiesTree: ActivityTree;




  faCaretDown = faCaretDown;
  faCaretRight = faCaretRight;


  


  @Output() valueChanged: EventEmitter<ActivityCategoryDefinition> = new EventEmitter<ActivityCategoryDefinition>();
  @Input('initialValue') set initialValue(providedParent: ActivityCategoryDefinition)  {
    // if(providedParent != null){
    //   this.activityTextInputValue = providedParent.name;
    // }
    
  }; 

  constructor(private activityCategoryDefinitionService: ActivityCategoryDefinitionService) { }

  ngOnInit() {
    this.activitiesTree = this.activityCategoryDefinitionService.activitiesTree;
    
  }


  activityTextInputValue: string = "";
  onActivityInputKeyUp(event: KeyboardEvent){
    let searchValue: string = (event.target as HTMLInputElement).value;
    this.searchForActivities(searchValue);
  }

  private searchForActivities(searchValue: string){

    let searchResults: ActivityCategoryDefinition[] = [];

    this.activitiesTree.allActivities.forEach((activity)=>{
      console.log(activity.name)
      console.log(activity.fullNamePath);
    })

    for(let activity of this.activitiesTree.allActivities){
      // if(activity.name.)
    }
    console.log("val is:  " + this.activityTextInputValue)
  }

  

}
