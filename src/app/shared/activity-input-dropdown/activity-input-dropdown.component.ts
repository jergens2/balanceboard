import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { faCaretDown, faCaretRight, faSitemap, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { Subscription, Observable, fromEvent, Subject, timer } from 'rxjs';
import { ActivityDropdownListItem } from './activity-dropdown-list-item.interface';
import { ActivityTree } from '../../dashboard/activities/api/activity-tree.class';
import { ActivityCategoryDefinition } from '../../dashboard/activities/api/activity-category-definition.class';
import { ActivityCategoryDefinitionService } from '../../dashboard/activities/api/activity-category-definition.service';
import { ActivityInputSearch } from './activity-input-search.class';
import { ActivityChainLink, SaveActivityChain } from './save-activity-chain.class';

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
    this.activityCategoryDefinitionService.activitiesTree$.subscribe((newTree) => {
      console.log("Updating tree");
      this.activitiesTree = newTree;
    })
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



  private onInputValueChanged(event: KeyboardEvent) {
    let target: HTMLInputElement = (event.target as HTMLInputElement);
    if (target != null && target.value != null && target.value != ""){
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
        this.searchForActivities(searchValue);
      }
    }else{
      this.searchResults = [];
      this.createNewActivities = [];
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
      console.log("index is " + this.arrowCursorIndex)
      console.log("Search results is ", this.searchResults);
      this.activityTextInputValue = this.searchResults[this.arrowCursorIndex].activity.name;
      this.arrowCursorIndex = -1;
    }
  }

  isArrowSelected(searchResult): boolean {
    return this.searchResults.indexOf(searchResult) == this.arrowCursorIndex ? true : false;
  }



  private saveActivityChain: SaveActivityChain;
  private searchForActivities(searchValue: string) {
    let activitySearch: ActivityInputSearch = new ActivityInputSearch(this.activityCategoryDefinitionService);

    activitySearch.createNewActivity$.subscribe((createNewActivities: ActivityCategoryDefinition[]) => {
      if (createNewActivities && createNewActivities.length > 0) {
        this.createNewActivities = createNewActivities;
        this.saveActivityChain = new SaveActivityChain(createNewActivities, this.activityCategoryDefinitionService);
      } else {
        this.createNewActivities = [];
        this.saveActivityChain = null;
      }
    })

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
    this.valueChanged.emit(searchResult);
    this.activityTextInputValue = "";
    this.createNewActivities = [];
    this.searchResults = [];
    this.arrowCursorIndex = -1;
  }

  createNewActivities: ActivityCategoryDefinition[] = [];
  savingActivity: boolean = false;
  onClickSaveNewActivities() {
    this.savingActivity = true;
    let isCompleteSubscription: Subscription = new Subscription();
    isCompleteSubscription = this.saveActivityChain.saveActivities$().subscribe((bottomActivity: ActivityCategoryDefinition)=>{
      if(bottomActivity != null){
        this.savingActivity = false;
        this.onClickSearchResult(bottomActivity);
        isCompleteSubscription.unsubscribe();
      }
      console.log("Back in the component now:  its complete.");
    })
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
