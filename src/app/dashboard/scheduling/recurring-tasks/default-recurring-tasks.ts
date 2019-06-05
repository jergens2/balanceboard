import { RecurringTaskDefinition } from "../../../shared/document-definitions/recurring-task/recurring-task-definition.class";
import * as moment from 'moment';
import { RecurringTaskRepititionPeriod } from "../../../shared/document-definitions/recurring-task/recurring-task-form/rt-repititions/recurring-task-repitition.interface";


let recurringTasks: RecurringTaskDefinition[] = [];


let morning: string = moment().hour(7).minute(45).second(0).millisecond(0).toISOString();
let evening: string = moment().hour(22).minute(30).second(0).millisecond(0).toISOString();
recurringTasks.push(new RecurringTaskDefinition('', '', 'Brush Teeth',
    [
        {
            value: 24,
            period: RecurringTaskRepititionPeriod.Hours,
            startDate: morning
        },
        {
            value:24,
            period: RecurringTaskRepititionPeriod.Hours,
            startDate: evening
        }
    ]
));

recurringTasks.push(new RecurringTaskDefinition('', '', 'Make Bed', [{value:24, period: RecurringTaskRepititionPeriod.Hours, startDate: morning}]));
recurringTasks.push(new RecurringTaskDefinition('', '', 'Take Vitamins', [{value:24, period: RecurringTaskRepititionPeriod.Hours, startDate: morning}]));
recurringTasks.push(new RecurringTaskDefinition('', '', '20 Pushups', [{value:24, period: RecurringTaskRepititionPeriod.Hours, startDate: morning}]));


recurringTasks.push(new RecurringTaskDefinition('', '', 'Water the hanging baskets', [{value:24, period: RecurringTaskRepititionPeriod.Hours, startDate: evening}]));
// recurringTasks.push(new RecurringTaskDefinition('', '', 'Ask Kristine if there is anything I can do to help her');
recurringTasks.push(new RecurringTaskDefinition('', '', 'Task Selection / Task Grabbing', [{value:24, period: RecurringTaskRepititionPeriod.Hours, startDate: evening}]));


export const defaultRecurringTasks: RecurringTaskDefinition[] = recurringTasks;
