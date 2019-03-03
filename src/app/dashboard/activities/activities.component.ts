import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivitiesService } from './activities.service';
import { UserDefinedActivity } from './user-defined-activity.model';
import { IActivityTile } from './activity-tile.interface';
import { ActivityTree } from './activity-tree.model';
import { MenuItem } from '../../nav/header/header-menu/menu-item.model';
import { Subscription } from 'rxjs';
import { HeaderMenu } from '../../nav/header/header-menu/header-menu.model';
import { HeaderService } from '../../nav/header/header.service';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit, OnDestroy {

  constructor(private activitiesService: ActivitiesService, private headerService: HeaderService) { }



  action: string = "default";

  displayedActivity: UserDefinedActivity = null;

  // rootActivityTiles: IActivityTile[] = [];
  // rootActivities: UserDefinedActivity[];

  activityTree: ActivityTree = null;

  private menuItemSubscriptions: Subscription[] = [];

  ngOnInit() {
    this.buildHeaderMenu();



    // this.rootActivities = this.activityTree.rootActivities;
    // this.rootActivityTiles = this.rootActivities.map((activity) => {
    //   return { activity: activity, ifShowActivityDelete: false, ifShowActivityModify: false };
    // });
    // console.log(this.rootActivityTiles);
  }

  
  private buildHeaderMenu(){
    let newActivityMenuItem = new MenuItem("Create New Activity", null, null);
    this.menuItemSubscriptions.push(newActivityMenuItem.clickEmitted$.subscribe((clicked)=>{
      this.onClickCreateNewActivity();
    }));
    let activitiesListMenuItem = new MenuItem("Activities List", null, null);
    this.menuItemSubscriptions.push(activitiesListMenuItem.clickEmitted$.subscribe((clicked)=>{
      this.onClickShowActivitiesList();
    }));

    let activitiesHeaderMenuItems: MenuItem[] = [];
    activitiesHeaderMenuItems.push(newActivityMenuItem);
    activitiesHeaderMenuItems.push(activitiesListMenuItem);

    let daybookHeaderMenu: HeaderMenu = new HeaderMenu('Activities', activitiesHeaderMenuItems);

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
    this.action = "form";
  }

  ngOnDestroy(){
    for(let subscription of this.menuItemSubscriptions){
      subscription.unsubscribe();
    }
    this.headerService.setCurrentMenu(null);
  }



}
