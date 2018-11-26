import { CategorizedActivity } from "./activity/categorized-activity.model";


let activities = [];
activities.push(new CategorizedActivity('default_unaccountedFor', 'Unaccounted For', 'A catch-all for any unspecified activity time', 'TOP_LEVEL', [], '#efefef'));

/*
    Blue gradient for work
*/
activities.push(new CategorizedActivity('default_work', 'Work', 'Time spent on jobs, career', 'TOP_LEVEL', ['default_work_commuting', 'default_work_job'], '#cee3ff'));
activities.push(new CategorizedActivity('default_work_commuting', 'Commuting', 'Time spent commuting to and from job', 'default_work', [], '#cee3ff'));
activities.push(new CategorizedActivity('default_work_job', 'Job', 'Time spent on the job', 'default_work', [], '#cee3ff'));

/*
    Green gradient for maintenance;
*/
activities.push(new CategorizedActivity('default_maintenance', 'Maintenance', 'Time spent on routine necessities', 'TOP_LEVEL', ['default_sleep','default_eat','default_makeFood','default_groceryShopping','default_householdChores','default_hygiene','default_errands'], '#d4ffcc'));
activities.push(new CategorizedActivity('default_sleep', 'Sleep', 'Sleeping', 'default_maintenance', [], '#d4ffcc'));
activities.push(new CategorizedActivity('default_eat', 'Eat', 'Eating', 'default_maintenance', [], '#d4ffcc'));
activities.push(new CategorizedActivity('default_makeFood', '', 'Making / preparing food', 'default_maintenance', [], '#d4ffcc'));
activities.push(new CategorizedActivity('default_groceryShopping', 'Grocery Shopping', 'Getting groceries', 'default_maintenance', [], '#d4ffcc'));
activities.push(new CategorizedActivity('default_householdChores', 'Household Chores', 'Cleaning the house, sweeping, vacuuming, dusting, dishes, etc.', 'default_maintenance', ['default_householdChores_laundry','default_householdChores_vacuuming','default_householdChores_dishes','default_householdChores_cleaning'], '#d4ffcc'));
activities.push(new CategorizedActivity('default_householdChores_laundry', 'Laundry', 'Loading laundry, folding, putting away', 'default_householdChores', [], '#d4ffcc'));
activities.push(new CategorizedActivity('default_householdChores_vacuuming', 'Vacuuming', 'Vacuuming', 'default_householdChores', [], '#d4ffcc'));
activities.push(new CategorizedActivity('default_householdChores_dishes', 'Dishes', 'Washing dishes, putting away dishes', 'default_householdChores', [], '#d4ffcc'));
activities.push(new CategorizedActivity('default_householdChores_cleaning', 'Cleaning', 'Time spent cleaning and tidying', 'default_householdChores', [], '#d4ffcc'));

activities.push(new CategorizedActivity('default_hygiene', 'Hygiene', 'Showering, brushing teeth, etc.', 'default_maintenance', [], '#d4ffcc'));
activities.push(new CategorizedActivity('default_errands', 'Errands', 'Miscellaneous things that need to get done', 'default_maintenance', [], '#d4ffcc'));


/*
    Yellow gradient for leisure;
*/
activities.push(new CategorizedActivity('default_leisure', 'Leisure', 'Time spent on preferred activities', 'TOP_LEVEL', ['default_read','default_videoGames','default_webBrowsing','default_exercise'], '#fff899'));
activities.push(new CategorizedActivity('default_read', 'Read', 'Time spent reading (books, magazines, newspapers, etc.)', 'default_leisure', [], '#fff899'));
activities.push(new CategorizedActivity('default_videoGames', 'Video Games', 'Time spent playing video games', 'default_leisure', [], '#fff899'));
activities.push(new CategorizedActivity('default_webBrowsing', 'Web Browsing', 'Time spent on websites', 'default_leisure', [], '#fff899'));
activities.push(new CategorizedActivity('default_exercise', 'Exercising', 'Time spent walking, jogging, bicycling, at the gym, etc.', 'default_leisure', [], '#fff899'));

export const defaultActivities: CategorizedActivity[] = activities;