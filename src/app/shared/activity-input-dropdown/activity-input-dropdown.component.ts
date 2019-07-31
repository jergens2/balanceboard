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
    let targetValue: string = (event.target as HTMLInputElement).value
    this.activityTextInputValue = targetValue;
    if(event.key == "ArrowUp"){
      this.arrowUp();
    }else if(event.key == "ArrowDown"){
      this.arrowDown();
    }else{
      let searchValue: string = targetValue;
      if(searchValue.length == 0){
        this.searchResults = [];
      }else if(searchValue.length > 0){
        this.searchForActivities(searchValue.toLowerCase());
      }else{
        console.log("Error with searchValue: " + searchValue);
      }
    }
  }

  arrowCursorIndex: number = -1;
  private arrowDown(){
    if(this.arrowCursorIndex + 1 < this.searchResults.length){
      this.arrowCursorIndex++;
    }
  }
  private arrowUp(){
    if(this.arrowCursorIndex >= 0){
      this.arrowCursorIndex--;
    }
  }

  isArrowSelected(searchResult): boolean{ 
    return this.searchResults.indexOf(searchResult) == this.arrowCursorIndex ? true : false;
  }

  private searchForActivities(searchValue: string){
    let searchResults: ActivityCategoryDefinition[] = [];
    for(let activity of this.activitiesTree.allActivities){
      if(activity.fullNamePath.toLowerCase().includes(searchValue)){
        searchResults.push(activity);
      }
    }
    searchResults = searchResults.sort((result1, result2)=>{
      if(result1.fullNamePath < result2.fullNamePath){
        return -1;
      }
      if(result1.fullNamePath > result2.fullNamePath){
        return 1;
      }
      return 0;
    });
    if(searchResults.length == 1){
      if(searchResults[0].name.toLowerCase().indexOf(this.activityTextInputValue.toLowerCase()) > -1){
        console.log("We have a match for: " + this.activityTextInputValue)
        if((searchResults[0].name + "/").toLowerCase().indexOf(this.activityTextInputValue.toLowerCase()) > -1){
          console.log("create new");
        }
      }
    }
    this.searchResults = searchResults;
  }
  searchResults: ActivityCategoryDefinition[] = [];

  onClickSearchResult(searchResult: ActivityCategoryDefinition){
    this.valueChanged.emit(searchResult);
    this.activityTextInputValue = "";
    this.searchResults = [];
  }


  public fullNamePathStart(searchResult: ActivityCategoryDefinition): string{
    let index: number = searchResult.fullNamePath.toLowerCase().indexOf(this.activityTextInputValue.toLowerCase());
    return searchResult.fullNamePath.substring(0, index);
  }
  public fullNamePathMatch(searchResult: ActivityCategoryDefinition): string{
    let index: number = searchResult.fullNamePath.toLowerCase().indexOf(this.activityTextInputValue.toLowerCase());
    return searchResult.fullNamePath.substring(index, index+this.activityTextInputValue.length);
  }
  public fullNamePathEnd(searchResult: ActivityCategoryDefinition): string{
    let index: number = searchResult.fullNamePath.toLowerCase().indexOf(this.activityTextInputValue.toLowerCase()) + this.activityTextInputValue.length;
    let pathEnd: string = searchResult.fullNamePath.substring(index, searchResult.fullNamePath.length);
    return pathEnd;
  }

  

  public get searchBoxExpanded(): boolean { 
    if(this.searchResults.length > 0){
      return true;
    }
    return false;
  }
  

}
