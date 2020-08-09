import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { faCaretDown, faCaretRight, faSitemap, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { Subscription, Observable, fromEvent, Subject, timer } from 'rxjs';
import { ActivityDropdownListItem } from './activity-dropdown-list-item.interface';
import { ActivityTree } from '../../dashboard/activities/api/activity-tree.class';
import { ActivityCategoryDefinition } from '../../dashboard/activities/api/activity-category-definition.class';
import { ActivityHttpService } from '../../dashboard/activities/api/activity-http.service';
import { ActivityInputSearch } from './activity-input-search.class';
import { ActivityChainLink, SaveActivityChain } from './save-activity-chain.class';
import { ItemState } from '../utilities/item-state.class';
import { CreateNewActivityItem } from './create-new-activity-item.class';

@Component({
  selector: 'app-activity-input-dropdown',
  templateUrl: './activity-input-dropdown.component.html',
  styleUrls: ['./activity-input-dropdown.component.css']
})
export class ActivityInputDropdownComponent implements OnInit, OnDestroy {


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

  public placeHolder: string = "Search for activity";

  private _isReadOnly: boolean = false;
  @Output() valueChanged: EventEmitter<ActivityCategoryDefinition> = new EventEmitter<ActivityCategoryDefinition>();
  @Input('initialValue') set initialValue(providedParent: ActivityCategoryDefinition) {
    // if(providedParent != null){
    //   this.activityTextInputValue = providedParent.name;
    // }

  };


  @Input() public set readOnly(setting: boolean) { this._isReadOnly = setting };

  constructor(private activityCategoryDefinitionService: ActivityHttpService) { }

  ngOnInit() {
    this._itemState = new ItemState(null);
    this.activitiesTree = this.activityCategoryDefinitionService.activityTree;
    this.activityCategoryDefinitionService.activityTree$.subscribe((newTree) => {
      // console.log("Updating tree");
      this.activitiesTree = newTree;
    });


    this._itemState.mouseIsOver$.subscribe((mouseIsOver: boolean)=>{
      if(mouseIsOver === false && this.activityTextInputValue === ""){
        this._itemState.reset();
      }
    });
  }

  ngOnDestroy(){
    this._createNewSub.unsubscribe();
  }


  activityTextInputValue: string = "";

  onActivityInputKeyDown(event: KeyboardEvent) {
    if (event.key == "Backspace") {
      this.onInputValueChanged(event);
    }
  }
  onActivityInputKeyUp(event: KeyboardEvent) {
    this.onInputValueChanged(event);
  }

  public onClickSearchButton(){
    this._itemState.startEditing();
    if(this.activityTextInputValue === ""){
      this.activityTextInputValue = "/";
      this._searchForActivities("/");
    }
  }

  private onInputValueChanged(event: KeyboardEvent) {
    let target: HTMLInputElement = (event.target as HTMLInputElement);
    if (target != null && target.value != null && target.value != ""){
      this._itemState.startEditing();
      let targetValue: string = (event.target as HTMLInputElement).value;
      this.activityTextInputValue = targetValue;
      let initiateSearch: boolean = false;
      let searchValue: string = this.activityTextInputValue;
      if (event.key == "ArrowUp") {
        this.arrowUp();
      } else if (event.key == "ArrowDown") {
        this.arrowDown();
      } else if (event.key == "ArrowRight") {
        this.arrowRight();
        initiateSearch = true;
        searchValue = this.activityTextInputValue;
      } else if (event.key == "Enter") {
        if(this.searchResults.length == 1){
          this.onClickSearchResult(this.searchResults[0].activity);
        }else if(this.arrowCursorIndex >= 0 && this.arrowCursorIndex < this.searchResults.length){
          this.onClickSearchResult(this.searchResults[this.arrowCursorIndex].activity);
        }
      }else{
        initiateSearch = true;
        searchValue = targetValue;
      }
  
      if (searchValue.length == 0) {
        this.searchResults = [];
        this.createNewActivities = [];
      }
  
      if (initiateSearch) {
        this._searchForActivities(searchValue);
      }
    }else{
      this.searchResults = [];
      this.createNewActivities = [];
      this.activityTextInputValue = "";
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
    if (this.arrowCursorIndex >= 0 && this.arrowCursorIndex < this.searchResults.length) {
      // console.log("index is " + this.arrowCursorIndex)
      // console.log("Search results is ", this.searchResults);
      this.activityTextInputValue = this.searchResults[this.arrowCursorIndex].activity.name;
      this.arrowCursorIndex = -1;
    }
  }

  isArrowSelected(searchResult): boolean {
    return this.searchResults.indexOf(searchResult) == this.arrowCursorIndex ? true : false;
  }



  private _saveActivityChain: SaveActivityChain;
  private _createNewSub: Subscription = new Subscription();
  private _searchForActivities(searchValue: string) {
    let activitySearch: ActivityInputSearch = new ActivityInputSearch(this.activityCategoryDefinitionService);

    this._createNewSub.unsubscribe();
    if(!this._isReadOnly){
      this._createNewSub = activitySearch.createNewActivity$.subscribe((createNewActivities: ActivityCategoryDefinition[]) => {
        if (createNewActivities && createNewActivities.length > 0) {
          this.createNewActivities = createNewActivities.map((newActivity)=>{ return new CreateNewActivityItem(newActivity)});
          this.updateActivityChangeSubscriptions();
        } else {
          this.createNewActivities = [];
          this._saveActivityChain = null;
        }
      });
    }

    this.searchResults = activitySearch.searchForActivities(searchValue).map((searchResult) => {
      let result = {
        activity: searchResult,
        sections: this.parseSearchResultSections(searchResult),
      }
      return result;
    }).sort((searchResult1, searchResult2)=>{
      if(searchResult1.activity.fullNamePath < searchResult2.activity.fullNamePath){
        return -1;
      }
      if(searchResult1.activity.fullNamePath > searchResult2.activity.fullNamePath){
        return 1;
      }
      return 0;
    })
  }
  searchResults: {
    activity: ActivityCategoryDefinition,
    sections: {
      value: string,
      isBold: boolean
    }[],
  }[] = [];

  onClickSearchResult(searchResult: ActivityCategoryDefinition) {
    if(this.activitiesTree.findActivityByTreeId(searchResult.treeId)){
      this.valueChanged.emit(searchResult);
      this.activityTextInputValue = "";
      this.createNewActivities = [];
      this.searchResults = [];
      this.arrowCursorIndex = -1; 
      this._itemState.reset();
    }else{
      /*
        In this case, a non-existent activity name was typed, e.g. "asdfasdf" and then the name in the list was clicked on
      */
     if(!this._isReadOnly){
      this.onClickSaveNewActivities();
     }

    }
  }

  createNewActivities: CreateNewActivityItem[] = [];
  savingActivity: boolean = false;
  onClickSaveNewActivities() {
    this.savingActivity = true;
    let isCompleteSubscription: Subscription = new Subscription();
    isCompleteSubscription = this._saveActivityChain.saveActivities$().subscribe((bottomActivity: ActivityCategoryDefinition)=>{
      if(bottomActivity != null){
        this.savingActivity = false;
        this.onClickSearchResult(bottomActivity);
        isCompleteSubscription.unsubscribe();
      }
      // console.log("Back in the component now:  its complete.");
    });
  }


  private _newActivityChangedSubscriptions: Subscription[] = [];
  private updateActivityChangeSubscriptions(){
    this._newActivityChangedSubscriptions.forEach((sub)=>{ sub.unsubscribe(); });
    this._newActivityChangedSubscriptions = [];
    this.createNewActivities.forEach((item)=>{
      this._newActivityChangedSubscriptions.push(item.activityChanged$.subscribe((activityTreeId: string)=>{
        let foundIndex: number = this.createNewActivities.findIndex((newActivityItem)=>{ return newActivityItem.activity.treeId === activityTreeId;});
        if(foundIndex > -1){
          if(foundIndex < this.createNewActivities.length-1){
            for(let i=foundIndex+1; i< this.createNewActivities.length; i++){
              this.createNewActivities[i].updateColor(this.createNewActivities[foundIndex].color);
              this._saveActivityChain = new SaveActivityChain(this.createNewActivities.map((newActivityItem)=>{ return newActivityItem.activity; }), this.activityCategoryDefinitionService);
            }
          }
        }
      }));
    });
    this._saveActivityChain = new SaveActivityChain(this.createNewActivities.map((newActivityItem)=>{ return newActivityItem.activity; }), this.activityCategoryDefinitionService);
  }



  private parseSearchResultSections(searchResult: ActivityCategoryDefinition): { value: string, isBold: boolean }[] {
    let sections: any[] = [];
    let searchValue = this.activityTextInputValue.toLowerCase();
    let fullPath: string = searchResult.fullNamePath.toLowerCase();


    if (fullPath.indexOf(searchValue) > -1) {
      let startIndex: number = fullPath.indexOf(searchValue);
      let endIndex: number = startIndex + searchValue.length;

      let startSection = {
        value: searchResult.fullNamePath.slice(0, startIndex),
        isBold: false,
      };
      let midSection = {
        value: searchResult.fullNamePath.slice(startIndex, endIndex),
        isBold: true,
      };
      let endSection = {
        value: searchResult.fullNamePath.slice(endIndex, fullPath.length - 1),
        isBold: false,
      };
      sections = [startSection, midSection, endSection];
    } else {
      let matchFound: boolean = false;
      let matchStartIndex: number = -1;
      let matchEndIndex: number = -1;
      for (let currentFullPathIndex = 0; currentFullPathIndex < fullPath.length; currentFullPathIndex++) {
        let searchEndIndex = searchValue.length;
        let currentFullPath: string = fullPath.slice(currentFullPathIndex, fullPath.length);
        if (searchValue.length > currentFullPath.length) {
          searchEndIndex = currentFullPath.length;
        }
        let currentSearchValue: string = searchValue.slice(0, searchEndIndex);
        for (let currentSearchValueEndIndex = currentSearchValue.length; currentSearchValueEndIndex > 0; currentSearchValueEndIndex--) {
          let reducedSearchValue: string = currentSearchValue.slice(0, currentSearchValueEndIndex);
          if (currentFullPath.indexOf(reducedSearchValue) > -1) {
            if (!matchFound) {
              matchStartIndex = currentFullPath.indexOf(reducedSearchValue) + currentFullPathIndex;
              matchEndIndex = matchStartIndex + reducedSearchValue.length;
              matchFound = true;
            }
          }
        }
      }

      if (matchFound) {
        let startSection = {
          value: searchResult.fullNamePath.slice(0, matchStartIndex),
          isBold: false,
        };
        let midSection = {
          value: searchResult.fullNamePath.slice(matchStartIndex, matchEndIndex),
          isBold: true,
        };
        let endSection = {
          value: searchResult.fullNamePath.slice(matchEndIndex, fullPath.length),
          isBold: false,
        };
        sections = [startSection, midSection, endSection];
      } else {
        sections = [{
          value: searchResult.fullNamePath,
          isBold: false,
        }]
      }

    }
    return sections;
  }


  private _itemState: ItemState;
  public get itemState(): ItemState{ return this._itemState; };

  public get searchBoxActive(): boolean{ 
    return this._itemState.isEditing;
  }

  public onMouseEnter(){
    this._itemState.onMouseEnter();
    if(this.activityTextInputValue !== ""){
      this._itemState.startEditing();
    }
  }


  public get searchBoxExpanded(): boolean {
    if (this.searchResults.length > 0) {
      return true;
    }
    if (this.createNewActivities.length > 0) {
      return true;
    }
    return false;
  }


}
