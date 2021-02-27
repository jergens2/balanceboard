import { NotebookEntry } from '../notebook-entry/notebook-entry.class';
import * as moment from 'moment';

export class NoteBuilder {
  constructor() { }

  public static buildNoteFromData(data: any): NotebookEntry {

    const id = data._id;
    const userId = data.userId;
    const dateCreatedISO: string = data.dateCreatedISO;
    const dateCreated = moment(dateCreatedISO);
    const dateModifiedISO: string = data.dateModifiedISO;
    let journalDate: moment.Moment = moment(dateCreatedISO);
    if (data.journalDateISO) {
      journalDate = moment(data.journalDateISO);
    }
    const journalDateISO: string = data.journalDateISO;
    const tags = data.tags;
    const textContent = data.textContent;
    const title = data.title;
    const type = data.type;

    const notebookEntry: NotebookEntry = new NotebookEntry(id, userId, dateCreated, type, textContent, title, tags);
    notebookEntry.setDateModified(moment(dateModifiedISO));
    notebookEntry.journalDate = journalDate;
    notebookEntry.data = data.data;

    return notebookEntry;
  }
}
