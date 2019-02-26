import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivitiesService } from './activities.service';
import { UserDefinedActivity } from './user-defined-activity.model';
import { IActivityTile } from './activity-tile.interface';
import { ActivityTree } from './activity-tree.model';
import { NavItem } from '../../nav/nav-item.model';
import { Subscription } from 'rxjs';
import { IHeaderMenu } from '../../nav/header/header-menu/header-menu.interface';
import { HeaderService } from '../../nav/header/header.service';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit, OnDestroy {

  constructor(private activitiesService: ActivitiesService, private headerService: HeaderService) { }



  action: string = "default";
  formAction: string = "new";

  displayedActivity: UserDefinedActivity = null;

  private activityNameFromForm: string = null;
  rootActivityTiles: IActivityTile[] = [];
  rootActivities: UserDefinedActivity[];

  activityTree: ActivityTree = null;

  modifyActivity: UserDefinedActivity;
  private menuItemSubscriptions: Subscription[] = [];

  ngOnInit() {
    this.buildHeaderMenu();

    this.activityTree = this.activitiesService.activitiesTree;

    this.rootActivities = this.activityTree.rootActivities;
    this.rootActivityTiles = this.rootActivities.map((activity) => {
      return { activity: activity, ifShowActivityDelete: false, ifShowActivityModify: false };
    });

    // console.log(this.rootActivityTiles);
  }

  
  private buildHeaderMenu(){
    let newActivityNavItem = new NavItem("Create New Activity", null, null);
    this.menuItemSubscriptions.push(newActivityNavItem.clickEmitted$.subscribe((clicked)=>{
      this.onClickCreateNewActivity();
    }));
    let activitiesListNavItem = new NavItem("Activities List", null, null);
    this.menuItemSubscriptions.push(activitiesListNavItem.clickEmitted$.subscribe((clicked)=>{
      this.onClickShowActivitiesList();
    }));

    let activitiesHeaderMenuItems: NavItem[] = [];
    activitiesHeaderMenuItems.push(newActivityNavItem);
    activitiesHeaderMenuItems.push(activitiesListNavItem);

    let daybookHeaderMenu: IHeaderMenu = { name:"Activities" , isOpen: false, menuOpenSubscription: new Subscription() , menuItems: activitiesHeaderMenuItems }

    this.headerService.setCurrentMenu(daybookHeaderMenu);
  }

  onClickShowActivitiesList(){
    this.action = "activities_list";
  }

  onDisplayClosed() {
    this.action = "default";
  }
  onFormClosed(){
    this.action = "default";
  }

  onActivitySelected(activity: UserDefinedActivity) {
    this.displayedActivity = activity;
    this.action = "display";
  }

  onClickCreateNewActivity() {
    this.formAction = "new";
    this.action = "form";
  }

  ngOnDestroy(){
    for(let subscription of this.menuItemSubscriptions){
      subscription.unsubscribe();
    }
    this.headerService.setCurrentMenu(null);
  }



}
