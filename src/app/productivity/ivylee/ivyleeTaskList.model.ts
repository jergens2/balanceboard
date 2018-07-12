import * as moment from 'moment';
import { IvyLeeTask } from './ivyleeTask.model'

export class IvyLeeTaskList {

    forDate: string;
    tasks: IvyLeeTask[];

    constructor(tasks: IvyLeeTask[], forDate: string){
        this.tasks = tasks;
        this.forDate = forDate;
    }
}