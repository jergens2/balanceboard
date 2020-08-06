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
export class NotesHttpService {

  constructor(private httpClient: HttpClient) { }

  private _userId: string;
  private get _serverUrl(): string { return serverUrl };
  public setUserId(userId: string) { this._userId = userId; }
  public logout() { this._userId = null; }
  public saveNotebookEntry(notebookEntry: NotebookEntry) {1
    notebookEntry.userId = this._userId;
    let requestUrl: string = this._serverUrl + "/api/notebook/create";
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

  public fetchNotebookEntriesHTTP$(): Observable<NotebookEntry[]> {
    const allNotes$: Subject<boolean> = new Subject();
    let requestUrl: string = this._serverUrl + "/api/notebook/" + this._userId;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.httpClient.get<{ message: string, data: any }>(requestUrl, httpOptions)
      .pipe<NotebookEntry[]>(map((response: { message: string, data: any[] }) => {
        return response.data.map(d => NoteBuilder.buildNoteFromData(d));
      }));
  }

  updateNotebookEntryHTTP$(notebookEntry: NotebookEntry): Observable<NotebookEntry> {
    let requestUrl: string = this._serverUrl + "/api/notebook/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    const requestBody: NotebookEntryHttpShape = notebookEntry.httpShape;
    requestBody.dateModified = moment().toISOString();
    return this.httpClient.post<{ message: string, data: any }>(requestUrl, requestBody, httpOptions)
      .pipe<NotebookEntry>(map(response => NoteBuilder.buildNoteFromData(response.data)));
  }

  public deleteNotebookEntryHTTP$(note: NotebookEntry) {
    const isComplete$: Subject<boolean> = new Subject();
    const postUrl = this._serverUrl + "/api/notebook/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, note, httpOptions)
      .subscribe((response) => {
        console.log("Response from HTTP delete request:", response)
        isComplete$.next(true);
      });
    return isComplete$.asObservable();
  }



}
