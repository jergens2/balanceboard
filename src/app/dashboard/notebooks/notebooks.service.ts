import { Injectable } from '@angular/core';
import { NotebookEntry } from './notebook-entry/notebook-entry.model';
import { serverUrl } from '../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../authentication/auth-status.model';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class NotebooksService {

  constructor(private httpClient: HttpClient) { }

  private _authStatus: AuthStatus;
  login$(authStatus: AuthStatus): Observable<NotebookEntry[]> {
    this._authStatus = authStatus;

    this.fetchNotebookEntries();
    return this._notebookEntries$.asObservable();
  }
  logout() {
    this._authStatus = null;
  }

  private serverUrl = serverUrl;





  private _notebookEntries$: BehaviorSubject<NotebookEntry[]> = new BehaviorSubject([]);
  public get notebookEntries$(): Observable<NotebookEntry[]> {
    return this._notebookEntries$.asObservable();
  }



  public saveNotebookEntry(notebookEntry: NotebookEntry) {

    this.saveNotebookEntryHttp(notebookEntry);
  }



  private fetchNotebookEntries() {
    let requestUrl: string = this.serverUrl + "/api/notebook/" + this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.get<{ message: string, data: any }>(requestUrl, httpOptions)
      .pipe<NotebookEntry[]>(map((response: { message: string, data: any }) => {
        let rd: any[] = response.data;
        let notebookEntries: NotebookEntry[] = [];
        rd.forEach((data: any) => {
          let notebookEntry: NotebookEntry = new NotebookEntry();
          notebookEntry.id = data._id;
          notebookEntry.userId = data.userId;
          notebookEntry.dateCreated = moment(data.dateCreatedISO);
          notebookEntry.dateModified = moment(data.dateModifiedISO);
          notebookEntry.forDate = moment(data.forDateISO);
          notebookEntry.tags = data.tags;
          notebookEntry.textContent = data.textContent;
          notebookEntry.title = data.title;
          notebookEntry.type = data.type;
          notebookEntries.push(notebookEntry);
        })
        return notebookEntries;
      }))
      .subscribe((notebookEntries: NotebookEntry[]) => {
        this._notebookEntries$.next(this.sortNotesByDate(notebookEntries));
      });

  }


  private saveNotebookEntryHttp(notebookEntry: NotebookEntry) {


    let requestUrl: string = this.serverUrl + "/api/notebook/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    let requestBody: any = {
      userId: this._authStatus.user.id,
      forDate: notebookEntry.forDate.toISOString(),
      dateCreated: notebookEntry.dateCreated.toISOString(),
      dateModified: notebookEntry.dateModified.toISOString(),
      type: notebookEntry.type,
      textContent: notebookEntry.textContent,
      title: notebookEntry.title,
      tags: notebookEntry.tags,
    };



    this.httpClient.post<{ message: string, data: any }>(requestUrl, requestBody, httpOptions)
      .subscribe((response: { message: string, data: any }) => {
        let data = response.data;
        let notebookEntry: NotebookEntry = new NotebookEntry();

        notebookEntry.id = data._id;
        notebookEntry.userId = data.userId;
        notebookEntry.dateCreated = moment(data.dateCreatedISO);
        notebookEntry.dateModified = moment(data.dateModifiedISO);
        notebookEntry.forDate = moment(data.forDateISO);
        notebookEntry.tags = data.tags;
        notebookEntry.textContent = data.textContent;
        notebookEntry.title = data.title;
        notebookEntry.type = data.type;

        let notebookEntries = this._notebookEntries$.getValue();
        notebookEntries.push(notebookEntry);
        this._notebookEntries$.next(this.sortNotesByDate(notebookEntries));
      });


  }

  public deleteNotebookEntryHTTP(note: NotebookEntry){
    const postUrl = this.serverUrl + "/api/notebook/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, note, httpOptions)
      .subscribe((response) => {
        // console.log("Response from HTTP delete request:", response)
        let notebookEntries: NotebookEntry[] = this._notebookEntries$.getValue();
        notebookEntries.splice(notebookEntries.indexOf(note),1);
        this._notebookEntries$.next(this.sortNotesByDate(notebookEntries));
      })
  }

  private sortNotesByDate(notes: NotebookEntry[]): NotebookEntry[]{
    return notes.sort((note1, note2)=>{
      if(note1.forDate.isBefore(note2.forDate)){
        return 1
      }
      if(note1.forDate.isAfter(note2.forDate)){
        return -1;
      }
      return 0;
    })
  }
}
