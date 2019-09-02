import { ActivityDurationSetting } from "./activity-duration.enum";
import { ActivityTargetConfiguration } from "./activity-target-configuration.interface";

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
    targets: ActivityTargetConfiguration[];

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
