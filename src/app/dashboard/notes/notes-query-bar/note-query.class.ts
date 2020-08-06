import { NoteTag } from "./note-tag.class";
import * as moment from 'moment';

export class NoteQuery{
    

    private _tags: NoteTag[] = [];
    private _rangeStartYYYYMMDD: string;
    private _rangeEndYYYYMMDD: string;
    private _resultsDisplayLimit: number = 100;

    
    constructor(startYYYYMMDD?: string, endYYYYMMDD?:string){
        if(startYYYYMMDD && endYYYYMMDD){
            this._rangeStartYYYYMMDD = startYYYYMMDD;
            this._rangeEndYYYYMMDD = endYYYYMMDD;
        }else{
            this._rangeStartYYYYMMDD = moment().subtract(1, 'year').format('YYYY-MM-DD');
            this._rangeEndYYYYMMDD = moment().format('YYYY-MM-DD');
        }
        console.log("QUERY: ", this._rangeStartYYYYMMDD, this._rangeEndYYYYMMDD)
    }

    public get tags(): NoteTag[] { return this._tags; }
    public get rangeEndYYYYMMDD(): string { return this._rangeEndYYYYMMDD; }
    public get rangeStartYYYYMMDD(): string { return this._rangeStartYYYYMMDD; }
    public get resultsDisplayLimit(): number { return this._resultsDisplayLimit; }
}