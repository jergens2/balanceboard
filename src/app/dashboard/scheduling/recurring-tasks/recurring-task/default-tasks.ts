import { RecurringTask } from "./recurring-task.model";
import * as moment from 'moment';


let recurringTasks: RecurringTask[] = [];

recurringTasks.push(new RecurringTask('', '', 'Brush Teeth'));
recurringTasks.push(new RecurringTask('', '', 'Make Bed'));


export const defaultRecurringTasks: RecurringTask[] = recurringTasks;
