

import * as moment from 'moment';
import { NotebookEntryTypes } from './notebook-entry-types.enum';

export class NotebookEntry {

    id: string;
    userId: string;

    journalDate: moment.Moment;
    dateCreated: moment.Moment;
    dateModified: moment.Moment;

    type: NotebookEntryTypes;

    textContent: string = "";
    title: string = "";
    tags: string[] = [];
    data: any = {};
    /*
        Data is for future object things or miscellaneous properties.  For example...
        links to other notes, / other note's noteId
        maybe votes.  vote by property
        e.g. maybe I could vote "cool" ,
        or maybe if I have special notes like maybe an Idea note, it does more things than a regular note,
        you can vote it up or down in terms of how you feel about it

    */

    constructor(id: string, userId: string, dateCreated: moment.Moment, type: NotebookEntryTypes, textContent: string, title: string, tags: string[] ){
        this.id = id;
        this.userId = userId;
        this.dateCreated = moment(dateCreated);
        this.dateModified = moment(dateCreated);
        this.journalDate = moment(dateCreated);
        this.type = type;
        this.textContent = textContent;
        this.title = title;
        this.tags = tags;
    }
}