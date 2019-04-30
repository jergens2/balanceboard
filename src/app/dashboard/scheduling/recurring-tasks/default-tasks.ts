import { RecurringTask } from "./recurring-task.model";
import * as moment from 'moment';
import { RecurringTaskTimeOfDay } from "./recurring-task-time-of-day.enum";


let recurringTasks: RecurringTask[] = [];

recurringTasks.push(new RecurringTask('', '', 'Brush Teeth', 1, RecurringTaskTimeOfDay.Morning , moment()));
recurringTasks.push(new RecurringTask('', '', 'Make Bed', 1, RecurringTaskTimeOfDay.Morning, moment()));
recurringTasks.push(new RecurringTask('', '', 'Take Vitamins', 1, RecurringTaskTimeOfDay.Morning, moment()));
recurringTasks.push(new RecurringTask('', '', '20 Pushups', 1, RecurringTaskTimeOfDay.Morning, moment()));


recurringTasks.push(new RecurringTask('', '', 'Water the hanging baskets', 1, RecurringTaskTimeOfDay.Evening, moment()));
recurringTasks.push(new RecurringTask('', '', 'Task Selection / Task Grabbing', 1, RecurringTaskTimeOfDay.Evening, moment()));
recurringTasks.push(new RecurringTask('', '', 'Brush Teeth', 1, RecurringTaskTimeOfDay.Evening , moment()));


export const defaultRecurringTasks: RecurringTask[] = recurringTasks;
