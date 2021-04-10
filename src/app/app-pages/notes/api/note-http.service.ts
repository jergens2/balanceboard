import { Injectable } from '@angular/core';
import { serverUrl } from '../../../serverurl';
import { NotebookEntry } from '../notebook-entry/notebook-entry.class';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { NoteBuilder } from '../notebook-entry/note-builder.class';
import { NotebookEntryHttpShape } from '../notebook-entry/notebook-entry-http-shape.interface';

@Injectable({
  providedIn: 'root'
})
export class NoteHttpService {

  constructor(private httpClient: HttpClient) { }

  private _userId: string;
  private _rangeStart: moment.Moment;
  private _allNotes$: BehaviorSubject<NotebookEntry[]> = new BehaviorSubject([]);

  public get rangeStart(): moment.Moment { return this._rangeStart; }
  public get allNotes(): NotebookEntry[] { return this._allNotes$.getValue(); }
  public get allNotes$(): Observable<NotebookEntry[]> { return this._allNotes$.asObservable(); }



  public login$(userId: string): Observable<boolean> {
    this._userId = userId;
    return this.fetchAllNotebookEntriesHTTP$();
  }
  public logout() {
    this._userId = null;
    this._rangeStart = null;
    this._allNotes$.next([]);
  }
  public saveNotebookEntry$(notebookEntry: NotebookEntry): Observable<NotebookEntry> {
    console.log("SAVING NOTE: ", notebookEntry)
    notebookEntry.userId = this._userId;
    const requestUrl: string = serverUrl + '/api/notebook/create';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    const requestBody: NotebookEntryHttpShape = notebookEntry.httpShape;
    const savedNote$: Subject<NotebookEntry> = new Subject();
    this.httpClient.post<{ message: string, data: any }>(requestUrl, requestBody, httpOptions)
      .pipe<NotebookEntry>(map((response: { message: string, data: any }) => {
        return NoteBuilder.buildNoteFromData(response.data);
      })).subscribe(notebookSaved => {
        const allNotes = this._sortNotes([...this.allNotes, notebookSaved]);
        this._allNotes$.next(allNotes);
        savedNote$.next(notebookSaved);
        savedNote$.complete();
      }, () => { }, () => { savedNote$.complete(); });
    return savedNote$;
  }





  public fetchAllNotebookEntriesHTTP$(): Observable<boolean> {
    const isComplete$: Subject<boolean> = new Subject();
    const requestUrl: string = serverUrl + '/api/notebook/' + this._userId;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    this.httpClient.get<{ message: string, data: any }>(requestUrl, httpOptions)
      .pipe<NotebookEntry[]>(map((response: { message: string, data: any[] }) => {
        return response.data.map(d => NoteBuilder.buildNoteFromData(d));
      }))
      .subscribe({
        next: (notes) => {
          // console.log("It took this many MS to build notes: ", moment().diff(before, 'milliseconds'))
          this._allNotes$.next(notes);
          isComplete$.next(true);
        },
        error: e => console.log('Error with notebooks', e),
        complete: () => isComplete$.complete()
      });
    return isComplete$.asObservable();
  }









  /**
   *
   * @param startISO the range start time. will get all notes between start and now
   */
  public getNotebookEntriesFromDateHTTP$(startTime: moment.Moment): Observable<boolean> {
    this._rangeStart = moment(startTime);
    const isComplete$: Subject<boolean> = new Subject();
    const requestUrl: string = serverUrl + '/api/notebook/' + this._userId + '/' + startTime.toISOString();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const before = moment();
    // console.log("starting notes...")
    this.httpClient.get<{ message: string, data: any }>(requestUrl, httpOptions)
      .pipe<NotebookEntry[]>(map((response: { message: string, data: any[] }) => {
        return response.data.map(d => NoteBuilder.buildNoteFromData(d));
      }))
      .subscribe({
        next: (notes) => {
          // console.log("It took this many MS to build notes: ", moment().diff(before, 'milliseconds'))
          this._allNotes$.next(notes);
          isComplete$.next(true);
        },
        error: e => console.log('Error with notebooks', e),
        complete: () => isComplete$.complete()
      });
    return isComplete$.asObservable();
  }

  public updateNotebookEntryHTTP$(notebookEntry: NotebookEntry): Observable<boolean> {
    const requestUrl: string = serverUrl + '/api/notebook/update';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    const requestBody: NotebookEntryHttpShape = notebookEntry.httpShape;
    console.log("Updating: request body: ", requestBody)
    const isComplete$: Subject<boolean> = new Subject();
    this.httpClient.post<{ message: string, data: any }>(requestUrl, requestBody, httpOptions)
      .pipe<NotebookEntry>(map(response => NoteBuilder.buildNoteFromData(response.data)))
      .subscribe(note => {
        const allNotes = this.allNotes;
        const index = this.allNotes.findIndex(existingNote => existingNote.id === notebookEntry.id);
        if (index >= 0) {
          allNotes.splice(index, 1, note);
        }
        this._allNotes$.next(this._sortNotes(allNotes));
        isComplete$.next(true);
      });
    return isComplete$.asObservable();
  }

  public deleteNotebookEntryHTTP$(note: NotebookEntry): Observable<boolean> {
    const isComplete$: Subject<boolean> = new Subject();
    const postUrl = serverUrl + '/api/notebook/delete';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, note, httpOptions)
      .subscribe((response) => {
        console.log('Response from HTTP delete request:', response);
        const allNotes = this.allNotes;
        const index = this.allNotes.findIndex(existingNote => existingNote.id === note.id);
        if (index >= 0) { 
          allNotes.splice(index, 1);
        }
        this._allNotes$.next(this._sortNotes(allNotes));
        isComplete$.next(true);
      });
    return isComplete$.asObservable();
  }


  private _sortNotes(notes: NotebookEntry[]): NotebookEntry[] {
    return notes.sort((note1, note2) => {
      if (note1.journalDateYYYYMMDD > note2.journalDateYYYYMMDD) {
        return -1;
      } else if (note1.journalDateYYYYMMDD < note2.journalDateYYYYMMDD) {
        return 1;
      } else {
        return 0;
      }
    });
  }

}
