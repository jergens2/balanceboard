import * as moment from 'moment';
import { IvyLeeTask } from './ivyleeTask.model'

export class IvyLeeTaskList {

    forDate: moment.Moment
    tasks: IvyLeeTask[];

    constructor(){
        this.tasks = [];
        this.forDate = moment().add(1,'day');
        
    }
}