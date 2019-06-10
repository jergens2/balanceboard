import { ActivityCategoryDefinition } from "./activity-category-definition.class";


let activities = [];
activities.push(new ActivityCategoryDefinition('', '', 'default_unaccountedFor', 'Unaccounted For', 'A catch-all for any unspecified activity time', 'TOP_LEVEL', '#efefef'));

/*
    Blue gradient for work
*/
activities.push(new ActivityCategoryDefinition('', '', 'default_work', 'Work', 'Time spent on jobs, career', 'TOP_LEVEL', '#cee3ff'));
activities.push(new ActivityCategoryDefinition('', '', 'default_work_commuting', 'Commuting', 'Time spent commuting to and from job', 'default_work', '#cee3ff'));
activities.push(new ActivityCategoryDefinition('', '', 'default_work_job', 'Job', 'Time spent on the job', 'default_work', '#cee3ff'));

/*
    Green gradient for maintenance;
*/
activities.push(new ActivityCategoryDefinition('', '', 'default_maintenance', 'Maintenance', 'Time spent on routine necessities', 'TOP_LEVEL', '#d4ffcc'));
activities.push(new ActivityCategoryDefinition('', '', 'default_sleep', 'Sleep', 'Sleeping', 'default_maintenance',  '#d4ffcc'));
activities.push(new ActivityCategoryDefinition('', '', 'default_eat', 'Eat', 'Eating', 'default_maintenance',  '#d4ffcc'));
activities.push(new ActivityCategoryDefinition('', '', 'default_makeFood', 'Make Food', 'Making / preparing food', 'default_maintenance',  '#d4ffcc'));
activities.push(new ActivityCategoryDefinition('', '', 'default_groceryShopping', 'Grocery Shopping', 'Getting groceries', 'default_maintenance', '#d4ffcc'));
activities.push(new ActivityCategoryDefinition('', '', 'default_householdChores', 'Household Chores', 'Cleaning the house, sweeping, vacuuming, dusting, dishes, etc.', 'default_maintenance', '#d4ffcc'));
activities.push(new ActivityCategoryDefinition('', '', 'default_householdChores_laundry', 'Laundry', 'Loading laundry, folding, putting away', 'default_householdChores', '#d4ffcc'));
activities.push(new ActivityCategoryDefinition('', '', 'default_householdChores_vacuuming', 'Vacuuming', 'Vacuuming', 'default_householdChores', '#d4ffcc'));
activities.push(new ActivityCategoryDefinition('', '', 'default_householdChores_dishes', 'Dishes', 'Washing dishes, putting away dishes', 'default_householdChores', '#d4ffcc'));
activities.push(new ActivityCategoryDefinition('', '', 'default_householdChores_cleaning', 'Cleaning', 'Time spent cleaning and tidying', 'default_householdChores', '#d4ffcc'));

activities.push(new ActivityCategoryDefinition('', '', 'default_hygiene', 'Hygiene', 'Showering, brushing teeth, etc.', 'default_maintenance', '#d4ffcc'));
activities.push(new ActivityCategoryDefinition('', '', 'default_errands', 'Errands', 'Miscellaneous things that need to get done', 'default_maintenance', '#d4ffcc'));


/*
    Yellow gradient for leisure;
*/
activities.push(new ActivityCategoryDefinition('', '', 'default_leisure', 'Leisure', 'Time spent on preferred activities', 'TOP_LEVEL', '#fff899'));
activities.push(new ActivityCategoryDefinition('', '', 'default_read', 'Read', 'Time spent reading (books, magazines, newspapers, etc.)', 'default_leisure', '#fff899'));
activities.push(new ActivityCategoryDefinition('', '', 'default_videoGames', 'Video Games', 'Time spent playing video games', 'default_leisure', '#fff899'));
activities.push(new ActivityCategoryDefinition('', '', 'default_webBrowsing', 'Web Browsing', 'Time spent on websites', 'default_leisure', '#fff899'));
activities.push(new ActivityCategoryDefinition('', '', 'default_exercise', 'Exercising', 'Time spent walking, jogging, bicycling, at the gym, etc.', 'default_leisure', '#fff899'));

export const defaultActivities: ActivityCategoryDefinition[] = activities;