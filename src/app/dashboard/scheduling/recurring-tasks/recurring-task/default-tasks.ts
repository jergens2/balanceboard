import { RecurringTask } from "./recurring-task.model";
import * as moment from 'moment';


let recurringTasks: RecurringTask[] = [];

recurringTasks.push(new RecurringTask('', '', 'Brush Teeth'));
recurringTasks.push(new RecurringTask('', '', 'Make Bed'));
recurringTasks.push(new RecurringTask('', '', 'Take Vitamins'));
recurringTasks.push(new RecurringTask('', '', '20 Pushups'));
recurringTasks.push(new RecurringTask('', '', 'Water the hanging baskets'));

recurringTasks.push(new RecurringTask('', '', 'Task Selection / Task Grabbing'));


export const defaultRecurringTasks: RecurringTask[] = recurringTasks;
