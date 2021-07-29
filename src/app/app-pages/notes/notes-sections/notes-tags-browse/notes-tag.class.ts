import { NotebookEntry } from "../../notebook-entry/notebook-entry.class";

export class NotesTag{

    private _name: string;
    private _count: number;

    private _largestCount: number;
    private _scaleColorClass: string = '';
    private _ngClass: string[] = [];
    private _percentOfMax: number = 0;

    private _notes: NotebookEntry[] = [];

    private _isExpanded: boolean = false;

    public get name(): string { return this._name; }
    public get count(): number { return this._count; }
    public get ngClass(): string[] { return this._ngClass; }
    public get scaleColorClass(): string { return this._scaleColorClass; }
    public get percentOfMax(): number { return this._percentOfMax; }

    public get isExpanded(): boolean { return this._isExpanded; }

    public get notes(): NotebookEntry[] { return this._notes; }

    constructor(tag: string, count: number){
        this._name = tag;
        this._count = count;
    }

    public setNotes(notes: NotebookEntry[]){
        this._notes = notes;
    }

    public setMax(largestNoteCount: number){
        this._largestCount = largestNoteCount;
        const colorScaleClasses: string[] = [
            'tag-color-scale-0',
            'tag-color-scale-1',
            'tag-color-scale-2',
            'tag-color-scale-3',
            'tag-color-scale-4',
            'tag-color-scale-5',
            'tag-color-scale-6',
        ];
        if (this._count === 0) {
            this._scaleColorClass = colorScaleClasses[0];
        } else if (this._count > 0) {
            const colorCount = colorScaleClasses.length - 1;
            const percentage = (this._count / largestNoteCount) * 100;
            const index = Math.ceil((percentage * colorCount) / 100);
            this._scaleColorClass = colorScaleClasses[index];
            this._ngClass.push(this._scaleColorClass);
        }

        let percentOfMax = ((this.count / this._largestCount)*100)

        // console.log(this.name + ": % of max ("+this.count + " / " + this._largestCount +") = " + percentOfMax)

        this._percentOfMax = percentOfMax;
        // console.log()
    }

    public openTagRow(){
        this._isExpanded = true;
    }
    public closeTagRow(){
        this._isExpanded = false;
    }
}