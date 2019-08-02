import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { faCaretDown, faCaretRight, faSitemap, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { Subscription, Observable, fromEvent } from 'rxjs';
import { ActivityDropdownListItem } from './activity-dropdown-list-item.interface';
import { ActivityTree } from '../document-definitions/activity-category-definition/activity-tree.class';
import { ActivityCategoryDefinition } from '../document-definitions/activity-category-definition/activity-category-definition.class';
import { ActivityCategoryDefinitionService } from '../document-definitions/activity-category-definition/activity-category-definition.service';
import { ActivityInputSearch } from './activity-input-search.class';

@Component({
  selector: 'app-activity-input-dropdown',
  templateUrl: './activity-input-dropdown.component.html',
  styleUrls: ['./activity-input-dropdown.component.css']
})
export class ActivityInputDropdownComponent implements OnInit {


  faSpinner = faSpinner;

  faSitemap = faSitemap;
  faSearch = faSearch;

  searchAction: string = "search";
  onChangeAction(newAction: string) {
    this.searchAction = newAction;
  }

  onActivitySelected(activity: ActivityCategoryDefinition) {
    this.valueChanged.emit(activity);
  }

  activitiesTree: ActivityTree;




  faCaretDown = faCaretDown;
  faCaretRight = faCaretRight;





  @Output() valueChanged: EventEmitter<ActivityCategoryDefinition> = new EventEmitter<ActivityCategoryDefinition>();
  @Input('initialValue') set initialValue(providedParent: ActivityCategoryDefinition) {
    // if(providedParent != null){
    //   this.activityTextInputValue = providedParent.name;
    // }

  };

  constructor(private activityCategoryDefinitionService: ActivityCategoryDefinitionService) { }

  ngOnInit() {
    this.activitiesTree = this.activityCategoryDefinitionService.activitiesTree;
    this.activityCategoryDefinitionService.activitiesTree$.subscribe((newTree)=>{
      console.log("Updating tree");
      this.activitiesTree = newTree;
    })
  }


  activityTextInputValue: string = "";

  onActivityInputKeyDown(event: KeyboardEvent) {
    if(event.key == "Backspace"){
      console.log("keydown")
      this.onInputValueChanged(event);
    }
  }
  onActivityInputKeyUp(event: KeyboardEvent) {
    this.onInputValueChanged(event);
  }

  

  private onInputValueChanged(event: KeyboardEvent){
    let targetValue: string = (event.target as HTMLInputElement).value
    this.activityTextInputValue = targetValue;
    let initiateSearch:boolean = false;
    let searchValue: string;
    if (event.key == "ArrowUp") {
      this.arrowUp();
    } else if (event.key == "ArrowDown") {
      this.arrowDown();
    } else if (event.key == "ArrowRight" ) {
      this.arrowRight();
      initiateSearch = true;
      searchValue = this.activityTextInputValue;
    }else {
      initiateSearch = true;
      searchValue = targetValue;
    }
    if(initiateSearch){
      if (searchValue.length == 0) {
        this.searchResults = [];
      } else if (searchValue.length > 0) {
        this.searchForActivities(searchValue.toLowerCase());
      } else {
        console.log("Error with searchValue: " + searchValue);
      }
    }
  }

  arrowCursorIndex: number = -1;
  private arrowDown() {
    if (this.arrowCursorIndex + 1 < this.searchResults.length) {
      this.arrowCursorIndex++;
    }
  }
  private arrowUp() {
    if (this.arrowCursorIndex >= 0) {
      this.arrowCursorIndex--;
    }
  }
  private arrowRight() {
    this.activityTextInputValue = this.searchResults[this.arrowCursorIndex].name;
  }

  isArrowSelected(searchResult): boolean {
    return this.searchResults.indexOf(searchResult) == this.arrowCursorIndex ? true : false;
  }


  createNewActivities: ActivityCategoryDefinition[] = []; 
  savingActivity: boolean = false;
  onClickSaveNewActivities(){
    this.savingActivity = true;
    // this.activityCategoryDefinitionService.saveActivity$(this.createNewActivity).subscribe((activitySaved)=>{
    //   this.onClickSearchResult(activitySaved);
    //   console.log("Activity was saved:" + activitySaved);
    //   this.savingActivity = false;
    // });
    
  }
  private searchForActivities(searchValue: string) {
    let activitySearch: ActivityInputSearch = new ActivityInputSearch(this.activitiesTree);

    activitySearch.createNewActivity$.subscribe((createNewActivities: ActivityCategoryDefinition[])=>{
      if(createNewActivities && createNewActivities.length > 0){
        this.createNewActivities = createNewActivities;
      }else{
        this.createNewActivities = [];
      }
    })

    this.searchResults = activitySearch.searchForActivities(searchValue);
  }
  searchResults: ActivityCategoryDefinition[] = [];


  onClickSearchResult(searchResult: ActivityCategoryDefinition) {
    this.valueChanged.emit(searchResult);
    this.activityTextInputValue = "";
    this.createNewActivities = [];
    this.searchResults = [];
  }




  public fullNamePathStart(searchResult: ActivityCategoryDefinition): string {
    let subString: string = this.activityTextInputValue;
    let index: number = searchResult.fullNamePath.toLowerCase().indexOf(subString.toLowerCase());
    return searchResult.fullNamePath.substring(0, index);
  }
  public fullNamePathMatch(searchResult: ActivityCategoryDefinition): string {
    let subString: string = this.activityTextInputValue;
    let index: number = searchResult.fullNamePath.toLowerCase().indexOf(subString.toLowerCase());
    return searchResult.fullNamePath.substring(index, index + subString.length);
  }
  public fullNamePathEnd(searchResult: ActivityCategoryDefinition): string {
    let subString: string = this.activityTextInputValue;
    let index: number = searchResult.fullNamePath.toLowerCase().indexOf(subString.toLowerCase()) + subString.length;
    let pathEnd: string = searchResult.fullNamePath.substring(index, searchResult.fullNamePath.length);
    return pathEnd;
  }



  public get searchBoxExpanded(): boolean {
    if (this.searchResults.length > 0) {
      return true;
    }
    if (this.createNewActivities.length > 0){
      return true;
    }
    return false;
  }


}
