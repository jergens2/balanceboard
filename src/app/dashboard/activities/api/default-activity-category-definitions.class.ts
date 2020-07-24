import { ActivityCategoryDefinition } from "./activity-category-definition.class";
import { Guid } from "../../../shared/utilities/guid.class";
import { ActivityDurationSetting } from "./activity-duration.enum";
import * as moment from 'moment';
import { ActivityCategoryDefinitionHttpShape } from "./activity-category-definition-http-shape.interface";
import { TimeUnit } from "../../../shared/time-utilities/time-unit.enum";
import { TimeOfDay } from "../../../shared/time-utilities/time-of-day-enum";


export class DefaultActivityCategoryDefinitions {

    public static newTreeId(userId: string): string {
        return userId + "_" + Guid.newGuid();
    }

    public static blankActivity(userId: string): ActivityCategoryDefinitionHttpShape {
        let newBlankActivity: ActivityCategoryDefinitionHttpShape = {
            _id: "",
            userId: userId,
            treeId: DefaultActivityCategoryDefinitions.newTreeId(userId),
            parentTreeId: userId + "_TOP_LEVEL",
            name: "name",
            description: "description",
            color: "#eeeeee",
            icon: "",
            // isRootLevel: true,
            isSleepActivity: false,
            canDelete: true,
            isInTrash: false,
            durationSetting: ActivityDurationSetting.Duration,
            specifiedDurationMinutes: -1,
            scheduleRepititions: [],
            currentPointsConfiguration: null,
            pointsConfigurationHistory: [],
            isConfigured: false,
            isRoutine: false,
            routineMembersActivityIds: [],
        }
        return newBlankActivity;
    }

    public static defaultActivities(userId: string): ActivityCategoryDefinition[] {

        const topLevelTreeId: string = userId + "_TOP_LEVEL";

        let activities = [];

        /*
            Blue gradient for work
        */

        let work: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        work.parentTreeId = topLevelTreeId;
        work.name = "Work";
        work.description = "Time spent on jobs, career"
        work.color = "#cee3ff";
        // work.isRootLevel = true;

        activities.push(work);

        let commuting: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        commuting.parentTreeId = work.treeId;
        commuting.name = "Commuting";
        commuting.description = "Time spent commuting to and from job"
        commuting.color = work.color;

        activities.push(commuting);

        let job: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        job.parentTreeId = work.treeId;
        job.name = "Job";
        job.description = "Time spent on the job"
        job.color = work.color;

        activities.push(job);


        /*
            Green gradient for Routine;
        */

        let maintenance: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        maintenance.parentTreeId = topLevelTreeId;
        maintenance.name = "Maintenance";
        maintenance.description = "Time spent on routine, maintenance things, and other necessary activities"
        maintenance.color = "#d4ffcc";
        // maintenance.isRootLevel = true;

        activities.push(maintenance);

        let eating: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        eating.parentTreeId = maintenance.treeId;
        eating.name = "Eating";
        eating.description = "Eating"
        eating.color = maintenance.color;

        activities.push(eating);

        let makingFood: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        makingFood.parentTreeId = maintenance.treeId;
        makingFood.name = "Making food";
        makingFood.description = "Making / preparing food"
        makingFood.color = maintenance.color;

        activities.push(makingFood);

        let groceryShopping: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        groceryShopping.parentTreeId = maintenance.treeId;
        groceryShopping.name = "Grocery Shopping";
        groceryShopping.description = "Getting groceries"
        groceryShopping.color = maintenance.color;

        activities.push(groceryShopping);


        let chores: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        chores.parentTreeId = maintenance.treeId;
        chores.name = "Household Chores";
        chores.description = "Chores around the house"
        chores.color = maintenance.color;

        activities.push(chores);


        let makeBed: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        makeBed.parentTreeId = chores.treeId;
        makeBed.name = "Make the bed";
        makeBed.description = "Make the the bed so that it is tidy"
        makeBed.color = chores.color;
        makeBed.durationSetting = ActivityDurationSetting.Occurrence,
        makeBed.specifiedDurationMinutes = 5;
        makeBed.scheduleRepititions = [
            {
                unit: TimeUnit.Day,
                frequency: 1,
                occurrences: [
                    {
                        index: 0,
                        unit: TimeUnit.Day,
                        minutesPerOccurrence: makeBed.specifiedDurationMinutes,
                        timeOfDayQuarter: TimeOfDay.Any,
                        timeOfDayHour: -1,
                        timeOfDayMinute: -1,
                        timesOfDay: [],
                        timesOfDayRanges: [],
                        timesOfDayExcludedRanges: [],
                        daysOfWeek: [],
                        daysOfWeekExcluded: [],
                        daysOfYear: [],
                    },
                ],
                startDateTimeISO: moment().startOf("year").toISOString(),
            },
        ],


        activities.push(makeBed);


        let laundry: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        laundry.parentTreeId = chores.treeId;
        laundry.name = "Laundry";
        laundry.description = "Laundry"
        laundry.color = chores.color;

        activities.push(laundry);

        let vacuuming: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        vacuuming.parentTreeId = chores.treeId;
        vacuuming.name = "Vacuuming";
        vacuuming.description = "Vacuuming"
        vacuuming.color = chores.color;

        activities.push(vacuuming);

        let dishes: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        dishes.parentTreeId = chores.treeId;
        dishes.name = "Dishes";
        dishes.description = "Dishes"
        dishes.color = chores.color;

        activities.push(dishes);

        let cleaning: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        cleaning.parentTreeId = chores.treeId;
        cleaning.name = "Cleaning";
        cleaning.description = "Cleaning"
        cleaning.color = chores.color;

        activities.push(cleaning);

        let hygiene: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        hygiene.parentTreeId = maintenance.treeId;
        hygiene.name = "Hygiene";
        hygiene.description = "Time spent on personal hygiene"
        hygiene.color = maintenance.color;

        activities.push(hygiene);

        let shower: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        shower.parentTreeId = hygiene.treeId;
        shower.name = "Shower";
        shower.description = "Shower"
        shower.color = hygiene.color;

        activities.push(shower);


        let brushTeeth: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        brushTeeth.parentTreeId = hygiene.treeId;
        brushTeeth.name = "Brush teeth";
        brushTeeth.description = "Brush teeth"
        brushTeeth.color = hygiene.color;
        brushTeeth.durationSetting = ActivityDurationSetting.Occurrence;
        brushTeeth.specifiedDurationMinutes = 2;
        brushTeeth.scheduleRepititions = [
            {
                unit: TimeUnit.Day,
                frequency: 1,
                occurrences: [
                    {
                        index: 0,
                        unit: TimeUnit.Day,
                        minutesPerOccurrence: brushTeeth.specifiedDurationMinutes,
                        timeOfDayQuarter: TimeOfDay.Morning,
                        timeOfDayHour: -1,
                        timeOfDayMinute: -1,
                        timesOfDay: [],
                        timesOfDayRanges: [],
                        timesOfDayExcludedRanges: [],
                        daysOfWeek: [],
                        daysOfWeekExcluded: [],
                        daysOfYear: [],
                    },
                    {
                        index: 1,
                        unit: TimeUnit.Day,
                        minutesPerOccurrence: brushTeeth.specifiedDurationMinutes,
                        timeOfDayQuarter: TimeOfDay.Evening,
                        timeOfDayHour: -1,
                        timeOfDayMinute: -1,
                        timesOfDay: [],
                        timesOfDayRanges: [],
                        timesOfDayExcludedRanges: [],
                        daysOfWeek: [],
                        daysOfWeekExcluded: [],
                        daysOfYear: [],
                    },
                ],
                startDateTimeISO: moment().startOf("year").toISOString(),
            },
        ],



        activities.push(brushTeeth);



        let errands: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        errands.parentTreeId = maintenance.treeId;
        errands.name = "Errands";
        errands.description = "Miscellaneous errands"
        errands.color = maintenance.color;

        activities.push(errands);

        /*
            Yellow gradient for leisure;
        */

        let leisure: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        leisure.name = "Leisure";
        leisure.description = "Time spent on leisurely activities"
        leisure.color = "#fff899";

        activities.push(leisure);

        let reading: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        reading.parentTreeId = leisure.treeId;
        reading.name = "Reading";
        reading.description = "Time spent reading"
        reading.color = leisure.color;

        activities.push(reading);


        let videoGames: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        videoGames.parentTreeId = leisure.treeId;
        videoGames.name = "Video Games";
        videoGames.description = "Playing video games"
        videoGames.color = leisure.color;

        activities.push(videoGames);

        let webBrowsing: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        webBrowsing.parentTreeId = leisure.treeId;
        webBrowsing.name = "Web Browsing";
        webBrowsing.description = "Browsing the web, social media, etc."
        webBrowsing.color = leisure.color;

        activities.push(webBrowsing);

        let exercise: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        exercise.parentTreeId = leisure.treeId;
        exercise.name = "Exercising";
        exercise.description = "Excercise activities, e.g. walking, bicycling, etc."
        exercise.color = leisure.color;


        let sleep: ActivityCategoryDefinition = new ActivityCategoryDefinition(DefaultActivityCategoryDefinitions.blankActivity(userId));
        sleep.parentTreeId = leisure.treeId;
        sleep.name = "Sleeping";
        sleep.description = "Sleeping"
        sleep.color = leisure.color;
        // sleep.isRootLevel = true;
        sleep.isSleepActivity = true;
        sleep.canDelete = false;

        activities.push(exercise);

        return activities;
    }
}