import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { UserDefinedActivity } from '../user-defined-activity.model';
import { ActivityTree } from '../activity-tree.model';
import { ActivitiesService } from '../activities.service';
import { IActivityDropdownListItem } from './activity-dropdown-list-item.interface';

@Component({
  selector: 'app-activity-input-dropdown',
  templateUrl: './activity-input-dropdown.component.html',
  styleUrls: ['./activity-input-dropdown.component.css']
})
export class ActivityInputDropdownComponent implements OnInit {


  faCaretDown = faCaretDown;
  faCaretRight = faCaretRight;


  activitiesDropDownList: IActivityDropdownListItem[] = [];
  private dropdownListTree: IActivityDropdownListItem[] = [];
  activityTextInputValue: string = "";

  private activitiesTree: ActivityTree = null;
  private selectedActivity: UserDefinedActivity = null;


  @Output() valueChanged: EventEmitter<UserDefinedActivity> = new EventEmitter<UserDefinedActivity>();

  constructor(private activitiesService: ActivitiesService) { }

  ngOnInit() {
    this.activitiesTree = this.activitiesService.activitiesTree;
    this.buildDropdownListTree();
  }

  private buildDropdownListTree() {
    function buildChildDropdownItems(parent: UserDefinedActivity, generationNumber: number): IActivityDropdownListItem {
      if (parent.children.length > 0) {
        let children: IActivityDropdownListItem[] = [];
        for (let child of parent.children) {
          children.push(buildChildDropdownItems(child, generationNumber + 1));
        }
        return { activity: parent, isExpanded: false, generationNumber: generationNumber, children: children };
      } else {
        return { activity: parent, isExpanded: false, generationNumber: generationNumber, children: [] };
      }
    }

    let listItems: IActivityDropdownListItem[] = []
    for (let activity of this.activitiesTree.rootActivities) {
      if (activity.children.length == 0) {
        listItems.push({ activity: activity, isExpanded: false, generationNumber: 0, children: [] })
      } else {
        let children: IActivityDropdownListItem[] = [];
        for (let child of activity.children) {
          children.push(buildChildDropdownItems(child, 1));
        }
        listItems.push({ activity: activity, isExpanded: false, generationNumber: 0, children: children })
      }
    }
    this.dropdownListTree = listItems;
  }



  onActivityInputKeyUp($event) {
    let searchValue: string = $event.target.value;
    this.activityTextInputValue = searchValue;
    if (searchValue.length > 0) {
      this.searchForActivities(searchValue);
    } else {
      this.activitiesDropDownList = [];
    }

  }

  onClickActivityDropdownArrow() {
    if (this.activitiesDropDownList.length > 0) {
      //if it's already open (has more than 0 items), clear it.
      this.activitiesDropDownList = [];
    } else {
      if (this.activityTextInputValue.length > 0) {
        this.searchForActivities(this.activityTextInputValue);
      } else {
        this.viewTreeList();
      }
    }
  }
  onClickActivityDropdownItem(listItem: IActivityDropdownListItem) {

    this.activityTextInputValue = listItem.activity.name;
    this.selectedActivity = listItem.activity;
    this.activitiesDropDownList = [];
    this.onValueChanged(this.selectedActivity);
  }

  onClickActivityDropdownItemArrow(listItem: IActivityDropdownListItem) {
    if (listItem.isExpanded) {
      listItem.isExpanded = false;
    } else {
      listItem.isExpanded = true;
    }
    this.viewTreeList();
  }



  private viewTreeList() {
    function getChildListItems(listItem: IActivityDropdownListItem): IActivityDropdownListItem[] {
      let children: IActivityDropdownListItem[] = [];
      if (listItem.isExpanded && listItem.children.length > 0) {
        for (let child of listItem.children) {
          children.push(child);
          children.push(...getChildListItems(child));
        }
      }
      return children;
    }


    if (this.activitiesDropDownList.length > 0) {
      let updatedDropdownList: IActivityDropdownListItem[] = [];
      for (let listItem of this.activitiesDropDownList) {
        updatedDropdownList.push(listItem);
        updatedDropdownList.push(...getChildListItems(listItem))
      }
      this.activitiesDropDownList = Object.assign([], updatedDropdownList);
    } else {
      let updatedDropdownList: IActivityDropdownListItem[] = [];
      for (let listItem of this.dropdownListTree) {
        updatedDropdownList.push(listItem);
        updatedDropdownList.push(...getChildListItems(listItem))
      }
      this.activitiesDropDownList = Object.assign([], updatedDropdownList);
    }

  }





  private onValueChanged(activity: UserDefinedActivity) {
    this.valueChanged.emit(activity);
  }

  private searchForActivities(searchValue: string) {



    let searchResults: IActivityDropdownListItem[] = [];
    // let activityResults: UserDefinedActivity[] = [];
    let activitiesArray: UserDefinedActivity[] = Object.assign([], this.activitiesTree.allActivities);
    for (let activity of activitiesArray) {
      if (activity.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {

        let listItem: IActivityDropdownListItem = { activity: activity, isExpanded: false, generationNumber: 0, children: [] }

        searchResults.push(listItem);


      }
    }



    this.activitiesDropDownList = searchResults;

  }

  activityHasChildren(listItem: IActivityDropdownListItem) {
    if (listItem.activity.children.length > 0) {
      return true;
    }
    return false;
  }

  get activityDropdownHeight(): string {
    let px = this.activitiesDropDownList.length * 30;
    if (px <= 30) {
      return "30px";
    } else if (px >= 200) {
      return "200px";
    } else {
      return "" + px + "px";
    }
  }

  dropdownListItemMarginLeft(listItem: IActivityDropdownListItem): string {
    let px = listItem.generationNumber * 15;
    return "" + px + "px";
  }

}
