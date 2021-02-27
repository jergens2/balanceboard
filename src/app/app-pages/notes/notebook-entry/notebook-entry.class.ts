

import * as moment from 'moment';
import { NotebookEntryTypes } from './notebook-entry-types.enum';
import { NotebookEntryHttpShape } from './notebook-entry-http-shape.interface';
import { NoteTag } from '../notes-query-bar/nqb-tag-search/note-tag.class';

export class NotebookEntry {
    constructor(id: string, userId: string, dateCreated: moment.Moment,
        type: NotebookEntryTypes, textContent: string, title: string, tags: string[]) {
        this._id = id;
        this._userId = userId;
        this._dateCreated = moment(dateCreated);
        this._dateModified = moment(dateCreated);
        this._journalDate = moment(dateCreated);
        this._type = type;
        this._textContent = textContent;
        this._title = title;
        this._tags = tags.map(t => new NoteTag(t));
        this._displayTime = this._journalDate.format('YYYY-MM-DD h:mm a');
    }

    public get httpShape(): NotebookEntryHttpShape {
        return {
            _id: this._id,
            userId: this._userId,
            journalDate: this._journalDate.toISOString(),
            dateCreated: this._dateCreated.toISOString(),
            dateModified: this._dateModified.toISOString(),
            type: this._type,
            textContent: this._textContent,
            title: this._title,
            tags: this._tags.map(t => t.toString()),
            data: {},
        };
    }


    private _id: string;
    private _userId: string;
    private _journalDate: moment.Moment;
    private _dateCreated: moment.Moment;
    private _dateModified: moment.Moment;

    private _type: NotebookEntryTypes;
    private _textContent: string = "";
    private _title: string = "";
    private _tags: NoteTag[] = [];
    private _data: any = {};
    private _displayTime: string = "";

    public get id(): string { return this._id; }
    public get userId(): string { return this._userId; }
    public get journalDateYYYYMMDD(): string { return moment(this._journalDate).format('YYYY-MM-DD'); }
    public get journalDate(): moment.Moment { return this._journalDate; }
    public get tags(): NoteTag[] { return this._tags; }
    public get textContent(): string { return this._textContent; }
    public get title(): string { return this._title; }
    public get time(): string { return this._displayTime; }

    public get dateModified(): moment.Moment { return this._dateModified; }
    public get dateModifiedYYYYMMDD(): string { return this._dateModified.format('YYYY-MM-DD'); }

    public set userId(userId: string) { this._userId = userId; }
    public setDateModified(time: moment.Moment) { this._dateModified = time; }
    public set journalDate(time: moment.Moment) {
        this._journalDate = time;
        this._displayTime = this._journalDate.format('YYYY-MM-DD h:mm a');
    }
    public set data(data: any) { this._data = data; }

    public tagsMatch(tags: NoteTag[]): boolean {
        return (this._tags.find(noteTag => tags.find(tag => tag.tagValue === noteTag.tagValue)) !== null);
    }


    public clone(): NotebookEntry {
        return new NotebookEntry(this.id, this.userId,
            this._dateCreated, this._type, this.textContent, this.title, this.tags.map(tag => tag.tagValue));
    }

}
