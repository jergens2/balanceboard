import { ActivityDurationSetting } from "./activity-duration.enum";
import { ActivityScheduleConfiguration } from "./activity-schedule-configuration.interface";

import { ActivityPointsConfiguration } from "./activity-points-configuration.interface";

export interface ActivityCategoryDefinitionHttpShape{
    _id: string;
    userId: string;

    treeId: string;
    parentTreeId: string;

    name: string;
    description: string;
    color: string;
    icon: string; 
    
    durationSetting: ActivityDurationSetting;
    specifiedDurationMinutes: number;
    
    scheduleConfiguration: ActivityScheduleConfiguration;
    currentPointsConfiguration: ActivityPointsConfiguration;
    pointsConfigurationHistory: ActivityPointsConfiguration[];


    isRoutine: boolean;
    routineMembersActivityIds: string[];
    // eventually perhaps a property to contain "non-activity" items, whatever they may be.  "Conditions", for example.
    // "House is clean" could be a condition.
    // not sure if those things would go here or not.

    isConfigured: boolean;
}


  /*
  Some ideas:

  For each activity, properties to have:
  -increase or decrease hours per week?
  -generic priority
  -activity related to time (duration) or incidences (count), example brush teeth, smoke cigarette, thc, alcohol, etc.  
  -mental focus required (high, normal, low)
  -enjoyment (high, normal, low)
  -purpose statement (why do you do this?)
  -ideal range rules, recurrences:
    -- this will merge into recurring activities  
    e.g. once per day, twice per day, 45 min per day is good, 2 hours per day is too much / unnecessary
    overwatch:  0-5 hours per week is good
                5-10 hours per week is acceptable
                over 10 hours per week is bad.
  -mandatoryness
  
  */
