

import * as moment from 'moment';
import { NotebookEntryTypes } from './notebook-entry-types.enum';
import { NotebookEntryHttpShape } from './notebook-entry-http-shape.interface';

export class NotebookEntry {
    constructor(id: string, userId: string, dateCreated: moment.Moment,
        type: NotebookEntryTypes, textContent: string, title: string, tags: string[]) {
        this._id = id;
        this._userId = userId;
        this._dateCreated = moment(dateCreated);
        this._dateModified = moment(dateCreated);
        this.journalDate = moment(dateCreated);
        this._type = type;
        this._textContent = textContent;
        this._title = title;
        this._tags = tags;
        this._wordCount = this._getWordCount(this._textContent);
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

    public toString(): string { 
        return this.journalDateYYYYMMDD + " - "  + this.title; 
     }


    private _id: string;
    private _userId: string;
    private _journalDate: moment.Moment;
    private _journalDateYYYYMMDD: string;
    private _dateCreated: moment.Moment;
    private _dateModified: moment.Moment;

    private _type: NotebookEntryTypes;
    private _textContent: string = "";
    private _title: string = "";
    private _tags: string[] = [];
    private _data: any = {};
    private _displayTime: string = "";

    private _wordCount: number = 0;

    public get id(): string { return this._id; }
    public get userId(): string { return this._userId; }
    public get journalDateYYYYMMDD(): string { return this._journalDateYYYYMMDD; }
    public get journalDate(): moment.Moment { return this._journalDate; }
    public get tags(): string[] { return this._tags; }
    public get textContent(): string { return this._textContent; }
    public get title(): string { return this._title; }
    public get time(): string { return this._displayTime; }

    public get wordCount(): number { return this._wordCount; }

    public get dateCreated(): moment.Moment { return this._dateCreated; }
    public get dateModified(): moment.Moment { return this._dateModified; }
    public get dateModifiedYYYYMMDD(): string { return this._dateModified.format('YYYY-MM-DD'); }

    public set userId(userId: string) { this._userId = userId; }
    public setDateModified(time: moment.Moment) { this._dateModified = time; }

    public set journalDate(time: moment.Moment) {
        this._journalDate = time;
        this._journalDateYYYYMMDD = moment(this._journalDate).format('YYYY-MM-DD');
        this._displayTime = this._journalDate.format('YYYY-MM-DD h:mm a');
    }
    public set data(data: any) { this._data = data; }

    public tagsMatch(tags: string[]): boolean {
        return (this._tags.find(noteTag => tags.find(tag => tag === noteTag)) !== null);
    }


    public clone(): NotebookEntry {
        return new NotebookEntry(this.id, this.userId,
            this._dateCreated, this._type, this.textContent, this.title, this.tags);
    }


    private _getWordCount(textContent: string): number{
        return textContent.split(' ').length;
    }

}
