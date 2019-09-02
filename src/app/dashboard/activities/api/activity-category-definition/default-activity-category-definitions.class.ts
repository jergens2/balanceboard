import { ActivityCategoryDefinition } from "./activity-category-definition.class";
import { Guid } from "../../../../shared/utilities/guid.class";
import { ActivityDurationSetting } from "./activity-duration.enum";

export class DefaultActivityCategoryDefinitions {

    public static defaultActivities(userId: string): ActivityCategoryDefinition[] {

        const topLevel: string = "_TOP_LEVEL";

        let activities = [];

        /*
            Blue gradient for work
        */
        const workColor: string = "#cee3ff";
        const workTreeId = userId + "_" + Guid.newGuid();
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: workTreeId,
                parentTreeId: userId + topLevel,
                name: "Work",
                description: "Time spent on jobs, career",
                color: workColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: workTreeId,
                name: "Commuting",
                description: "Time spent commuting to and from job",
                color: workColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: workTreeId,
                name: "Job",
                description: "Time spent on the job",
                color: workColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));


        /*
            Green gradient for Routine;
        */
        const maintenanceColor: string = "#d4ffcc";
        const maintenanceTreeId: string = userId + "_" + Guid.newGuid();
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: maintenanceTreeId,
                parentTreeId: userId + topLevel,
                name: "Maintenance",
                description: "Time spent on routine, maintenance things, and other necessary activities",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));

        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: maintenanceTreeId,
                name: "Eating",
                description: "Eating",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: maintenanceTreeId,
                name: "Making food",
                description: "Making / preparing food",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: maintenanceTreeId,
                name: "Grocery Shopping",
                description: "Getting groceries",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        const choresTreeId: string = userId + "_" + Guid.newGuid();
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: choresTreeId,
                parentTreeId: maintenanceTreeId,
                name: "Household Chores",
                description: "Chores around the house",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: choresTreeId,
                name: "Laundry",
                description: "Laundry",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: choresTreeId,
                name: "Vacuuming",
                description: "Vacuuming",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: choresTreeId,
                name: "Dishes",
                description: "Dishes",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: choresTreeId,
                name: "Cleaning",
                description: "Cleaning",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        const hygieneTreeId: string = userId + "_" + Guid.newGuid();
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: hygieneTreeId,
                parentTreeId: maintenanceTreeId,
                name: "Hygiene",
                description: "Time spent on personal hygiene",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: hygieneTreeId,
                name: "Showering",
                description: "Showering",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: hygieneTreeId,
                name: "Brush teeth",
                description: "Brush teeth",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.Short,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: maintenanceTreeId,
                name: "Errands",
                description: "Miscellaneous errands",
                color: maintenanceColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));


        /*
            Yellow gradient for leisure;
        */

        const leisureColor: string = "#fff899";
        const leisureTreeId: string = userId + "_" + Guid.newGuid();
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: leisureTreeId,
                parentTreeId: userId + topLevel,
                name: "Leisure",
                description: "Time spent on leisurely activities",
                color: leisureColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: leisureTreeId,
                name: "Reading",
                description: "Time spent reading",
                color: leisureColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: leisureTreeId,
                name: "Video games",
                description: "Playing video games",
                color: leisureColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: leisureTreeId,
                name: "Web Browsing",
                description: "Browsing the web, social media, etc.",
                color: leisureColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        activities.push(new ActivityCategoryDefinition(
            {
                _id: "",
                userId: userId,
                treeId: userId + "_" + Guid.newGuid(),
                parentTreeId: leisureTreeId,
                name: "Exercising",
                description: "Excercise activities, e.g. walking, bicycling, etc.",
                color: leisureColor,
                icon: "",
                durationSetting: ActivityDurationSetting.VariableLength,
                specifiedDurationMinutes: -1,
                targets: [],
                isConfigured: true,
            }
        ));
        return activities;
    }
}