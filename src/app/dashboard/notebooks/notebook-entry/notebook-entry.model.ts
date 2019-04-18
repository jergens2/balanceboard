

import * as moment from 'moment';
import { NotebookEntryTypes } from './notebook-entry-types.enum';

export class NotebookEntry {

    id: string;
    userId: string;

    forDate: moment.Moment;
    dateCreated: moment.Moment;
    dateModified: moment.Moment;

    type: NotebookEntryTypes;

    textContent: string = "";
    title: string = "";
    tags: string[] = [];

    constructor(){

    }
}