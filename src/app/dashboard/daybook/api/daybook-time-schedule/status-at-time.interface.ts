import * as moment from 'moment';
import { ReferencerTimeEventName } from './referencer-time-event-name.enum';

export class StatusAtTime {
    startTime: moment.Moment;
    endTime: moment.Moment;
    isAWake: boolean;
    isActive: boolean;
    isSet: boolean;
    name: ReferencerTimeEventName;
}
