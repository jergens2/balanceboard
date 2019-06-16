import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivityCategoryDefinitionService } from '../../shared/document-definitions/activity-category-definition/activity-category-definition.service';
import { ActivityCategoryDefinition } from '../../shared/document-definitions/activity-category-definition/activity-category-definition.class';
import { IActivityTile } from './activity-tile.interface';
import { ActivityTree } from '../../shared/document-definitions/activity-category-definition/activity-tree.class';
import { MenuItem } from '../../nav/header/header-menu/menu-item.model';
import { Subscription } from 'rxjs';
import { HeaderMenu } from '../../nav/header/header-menu/header-menu.model';
import { HeaderService } from '../../nav/header/header.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit, OnDestroy {

  constructor(private activityCategoryDefinitionService: ActivityCategoryDefinitionService, private headerService: HeaderService, private route:ActivatedRoute, private router: Router) { }



  action: string = "default";

  displayedActivity: ActivityCategoryDefinition = null;

  // rootActivityTiles: IActivityTile[] = [];
  activitiesTree: ActivityTree = null;
  treeSubscription: Subscription = new Subscription();

  private menuItemSubscriptions: Subscription[] = [];

  ngOnInit() {
    this.activitiesTree = this.activityCategoryDefinitionService.activitiesTree;
    this.treeSubscription = this.activityCategoryDefinitionService.activitiesTree$.subscribe((newTree)=>{
      this.activitiesTree = newTree;
    });
    this.buildHeaderMenu();
    let routeParameter: string = this.route.snapshot.paramMap.get('activityIdentifier');
    if(routeParameter){
      let foundActivity = this.activitiesTree.findActivityByIdentifier(routeParameter);
      if(foundActivity){
        this.displayedActivity = foundActivity;
        this.action = "display"; 
      }else{
        console.log("Error: could not find an activity");
      }

 
    }else{
      this.action = "default";
    }






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

  onActivitySelected(activity: ActivityCategoryDefinition) {

    if(this.activitiesTree.activityNameIsUnique(activity)){
      this.router.navigate(['/activities/'+activity.name]);
    }else{
      this.router.navigate(['/activities/'+activity.treeId]);
    }
    this.displayedActivity = activity;
    this.action = "display"; 

  }

  onClickCreateNewActivity() {
    this.action = "form";
  }

  ngOnDestroy(){
    this.treeSubscription.unsubscribe();
    for(let subscription of this.menuItemSubscriptions){
      subscription.unsubscribe();
    }
    this.headerService.setCurrentMenu(null);
  }



}
