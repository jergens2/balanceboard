import { NotebookEntry } from "../../notebook-entry/notebook-entry.class";
import { NoteTag } from "./note-tag.class";

export class NoteTagBuilder {

    public tags: NoteTag[] = [];
    constructor(notes: NotebookEntry[]) {
        let currentTags: NoteTag[] = [];
        notes.forEach(note => {
            note.tags.forEach(noteTag => {
                const foundItem = currentTags.find(item => item.tagValue === noteTag.tagValue);
                if (foundItem) {
                    foundItem.count++;
                } else {
                    currentTags.push(new NoteTag(noteTag.tagValue));
                }
            });
        });
        this.tags = currentTags.sort((t1, t2) => {
            if (t1.count > t2.count) { return -1; }
            else if (t1.count < t2.count) { return 1; }
            else {
                if (t1.tagValue < t2.tagValue) { return -1; }
                else if (t1.tagValue > t2.tagValue) { return 1; }
            }
            return 0;
        });
        if(this.tags.length > 0){
            let sum = 0;
            this.tags.forEach(t => sum += t.count );
            const average = sum / this.tags.length;
            const topSectionIndex = Math.floor(this.tags.length * 0.25);
            const bottomSectionIndex = Math.floor(this.tags.length * 0.75);
            for(let i=0; i<this.tags.length; i++){
                if(i < topSectionIndex){
                    this.tags[i].ngStyle = {'font-size':'1.5em',};
                }else if(i >= topSectionIndex && i <bottomSectionIndex){
                    this.tags[i].ngStyle = {'font-size':'1.0em',};
                }else if(i >=bottomSectionIndex){
                    this.tags[i].ngStyle = {'font-size':'0.8em',};
                }
            }
        }
        


    }
}