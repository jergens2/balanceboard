import { NotebookEntry } from "../../notebook-entry/notebook-entry.class";
import { NotesTag } from "./notes-tag.class";

export class NotesTagsBuilder{

    private _notesTags: NotesTag[] = [];

    public get notesTags(): NotesTag[] { return this._notesTags; }

    constructor(allNotes: NotebookEntry[]){
        if(allNotes.length > 0){
            let earliestDateYYYYMMDD: string = allNotes[0].journalDateYYYYMMDD;
            let latestDateYYYYMMDD: string = allNotes[0].journalDateYYYYMMDD;


            let tagCounts: {
                tag: string,
                noteCount: number
            }[] = [];

            let largestCount: number = 0;

            for(let noteIndex=0; noteIndex < allNotes.length; noteIndex++){
                if(allNotes[noteIndex].journalDateYYYYMMDD < earliestDateYYYYMMDD){
                    earliestDateYYYYMMDD = allNotes[noteIndex].journalDateYYYYMMDD;
                }
                if(allNotes[noteIndex].journalDateYYYYMMDD > latestDateYYYYMMDD){
                    latestDateYYYYMMDD = allNotes[noteIndex].journalDateYYYYMMDD;
                }
                const noteTags: string[] = allNotes[noteIndex].tags;
                noteTags.forEach(noteTag => {
                    const foundIndex = tagCounts.findIndex(item => item.tag === noteTag)
                    if(foundIndex >= 0){
                        tagCounts[foundIndex].noteCount ++;
                        if(tagCounts[foundIndex].noteCount > largestCount){
                            largestCount = tagCounts[foundIndex].noteCount;
                        }
                    }else{
                        tagCounts.push({
                            tag: noteTag,
                            noteCount: 1,
                        });
                        if(largestCount > 1){
                            largestCount = 1;
                        }
                    }
                });
            }

            const notesTags: NotesTag[] = tagCounts.map(tc => new NotesTag(tc.tag, tc.noteCount)).sort((tag1, tag2)=>{
                if(tag1.count > tag2.count){
                    return -1;
                }else if(tag1.count < tag2.count){
                    return 1;
                }else if(tag1.count === tag2.count){
                    if(tag1.name < tag2.name){
                        return -1;
                    }else if(tag1.name > tag2.name){
                        return 1;
                    }else{
                        return 0;
                    }
                }
            });

            notesTags.forEach(nt => {
                // console.log("note tag... "+ nt.name)
                nt.setMax(largestCount);
                
                const notes: NotebookEntry[] = [];
                allNotes.forEach(note => {
                    if(note.hasTag(nt.name)){
                        // console.log("  ** Note (" + note.tags + ") has tag! (" + nt.name+")")
                        notes.push(note);
                    }
                });
                // console.log("NOTES FOR :  " + nt.name, notes)
                nt.setNotes(notes);
            });

            this._notesTags = notesTags;

        }

    }
}