import * as moment from 'moment';
const defaultWakeupTime = moment().startOf('day').hour(7).minute(30);
export default defaultWakeupTime;
