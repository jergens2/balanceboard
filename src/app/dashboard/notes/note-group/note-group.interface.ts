import { NotebookEntry } from '../notebook-entry/notebook-entry.class';

export interface NoteGroup {
    dateYYYYMMDD: string;
    dateString: string;
    daysAgo: string;
    notes: NotebookEntry[];
    noNotesEndDateYYYYMMDD: string;
    noNotesDateString: string;
}
