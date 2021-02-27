import { Injectable } from '@angular/core';
import { ActivityCategoryDefinition } from './activity-category-definition.class';
import { ActivityCategoryDefinitionHttpShape } from './activity-category-definition-http-shape.interface';
import { ActivityDurationSetting } from './activity-duration.enum';

@Injectable({
  providedIn: 'root'
})


export class UpdateActivityDatabaseItemsService {
  /**
   * This service is generally for development purposes only.
   * 
   * 
   * 
   * This Service is for the purpose of updating existing documents in the database to a newer version.
   * For example, I add a property to activity called isSuperDuperActivity: boolean
   * this service can be used to add property 'isSuperDuperActivity' to each existing document in the DB.
   */
  constructor() { }



  public updateActivities(oldActivities: ActivityCategoryDefinition[]): ActivityCategoryDefinition[] {

    let newActivities: ActivityCategoryDefinition[] = [];

    oldActivities.forEach((oldActivity) => {
      let isRootLevel: boolean = false;
      let isSleepActivity: boolean = false;
      let canDelete: boolean = true;
      let isInTrash: boolean = false;


      let sleepTreeId: string = "5b9c362dd71b00180a7cf701_default_sleep";
      if (oldActivity.treeId === sleepTreeId) {
        canDelete = false;
        isSleepActivity = true;
        console.log(oldActivity.name + " is the sleep activity.")
      }

      let topLevelID: string = oldActivity.userId + "_TOP_LEVEL";
      if (oldActivity.parentTreeId === topLevelID) {
        console.log(oldActivity.name + " is a Top Level activity");
        isRootLevel = true;
      }




      let newActivityHttpShape: ActivityCategoryDefinitionHttpShape = {
        _id: oldActivity.id,
        userId: oldActivity.userId,

        treeId: oldActivity.treeId,
        parentTreeId: oldActivity.parentTreeId,

        name: oldActivity.name,
        description: oldActivity.description,
        color: oldActivity.color,
        icon: oldActivity.icon,

        // isRootLevel: isRootLevel,
        isSleepActivity: isSleepActivity,
        canDelete: canDelete,
        isInTrash: isInTrash,

        durationSetting: ActivityDurationSetting.Duration,
        specifiedDurationMinutes: -1,
        scheduleRepititions: [],
        currentPointsConfiguration: null,
        pointsConfigurationHistory: [],
        isConfigured: false,
        isRoutine: false,
        routineMembersActivityIds: [],
      }
      let newActivity: ActivityCategoryDefinition = new ActivityCategoryDefinition(newActivityHttpShape);
      newActivities.push(newActivity);
    })


    return newActivities;
  }
}
