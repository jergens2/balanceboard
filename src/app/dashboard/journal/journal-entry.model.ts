

import * as moment from 'moment';
import { JournalEntryTypes } from './journal-entry-types.enum';

export class JournalEntry {

    id: string;
    userId: string;

    forDate: moment.Moment;
    dateCreated: moment.Moment;
    dateModified: moment.Moment;

    type: JournalEntryTypes;

    textContent: string = "";
    title: string = "";
    tags: string[] = [];

    constructor(){

    }
}