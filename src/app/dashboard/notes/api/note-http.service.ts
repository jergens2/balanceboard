import { Injectable } from '@angular/core';
import { serverUrl } from '../../../serverurl';
import { NotebookEntry } from '../notebook-entry/notebook-entry.class';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { NoteBuilder } from './note-builder.class';
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
    const startTime: moment.Moment = moment().subtract(365, 'days').startOf('day');
    return this.fetchNotebookEntriesHTTP$(startTime);
  }
  public logout() { 
    this._userId = null; 
    this._rangeStart = null;
    this._allNotes$.next([]);
  }
  public saveNotebookEntry(notebookEntry: NotebookEntry) {1
    notebookEntry.userId = this._userId;
    let requestUrl: string = serverUrl + "/api/notebook/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    let requestBody: NotebookEntryHttpShape = notebookEntry.httpShape;
    return this.httpClient.post<{ message: string, data: any }>(requestUrl, requestBody, httpOptions)
      .pipe<NotebookEntry[]>(map((response: { message: string, data: any[] }) => {
        return response.data.map(d => NoteBuilder.buildNoteFromData(d));
      }));
  }

  /**
   * 
   * @param startISO the range start time. will get all notes between start and now
   */
  public fetchNotebookEntriesHTTP$(startTime: moment.Moment): Observable<boolean> {
    this._rangeStart = moment(startTime);
    const isComplete$: Subject<boolean> = new Subject();
    let requestUrl: string = serverUrl + "/api/notebook/" + this._userId +"/" + startTime.toISOString();
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
        next: (notes)=>{
          this._allNotes$.next(notes);
          isComplete$.next(true)
        },
        error: e => console.log("Error", e),
        complete: () => isComplete$.complete()
      });
    return isComplete$.asObservable();
  }

  updateNotebookEntryHTTP$(notebookEntry: NotebookEntry): Observable<boolean> {
    let requestUrl: string = serverUrl + "/api/notebook/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    const requestBody: NotebookEntryHttpShape = notebookEntry.httpShape;
    requestBody.dateModified = moment().toISOString();
    const isComplete$: Subject<boolean> = new Subject();
    this.httpClient.post<{ message: string, data: any }>(requestUrl, requestBody, httpOptions)
      .pipe<NotebookEntry>(map(response => NoteBuilder.buildNoteFromData(response.data)))
      .subscribe(note =>{
        const allNotes = this.allNotes;
        const index = this.allNotes.indexOf(notebookEntry);
        if(index >= 0){
          allNotes.splice(index, 1, note);
        }
        this._allNotes$.next(allNotes);
        isComplete$.next(true);
      })
      return isComplete$.asObservable();
  }

  public deleteNotebookEntryHTTP$(note: NotebookEntry): Observable<boolean> {
    const isComplete$: Subject<boolean> = new Subject();
    const postUrl = serverUrl + "/api/notebook/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, note, httpOptions)
      .subscribe((response) => {
        console.log("Response from HTTP delete request:", response)
        const allNotes = this.allNotes;
        const index = this.allNotes.indexOf(note);
        if(index >= 0){
          allNotes.splice(index, 1);
        }
        this._allNotes$.next(allNotes);
        isComplete$.next(true);
      });
    return isComplete$.asObservable();
  }



}
