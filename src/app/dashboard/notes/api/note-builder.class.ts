import { NotebookEntry } from "../notebook-entry/notebook-entry.class";
import * as moment from 'moment';

export class NoteBuilder{
    constructor(){}

    public static buildNoteFromData(data: any): NotebookEntry{
        let notebookEntry: NotebookEntry = new NotebookEntry(data._id, data.userId, data.dateCreatedISO, data.type, data.textContent, data.title, data.tags);
        notebookEntry.dateModified = moment(data.dateModifiedISO);
        notebookEntry.journalDate = moment(data.journalDateISO);
        notebookEntry.data = data.data;
        if (data.journalDateISO) {

        } else {
          console.log("No journal Date")
        }
        return notebookEntry;
    }
}