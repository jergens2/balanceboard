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
  private _loginComplete: BehaviorSubject<boolean> = new BehaviorSubject(null);
  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;

    this.fetchNotebookEntries();
    return this._loginComplete.asObservable();
  }
  logout() {
    this._authStatus = null;
  }

  private serverUrl = serverUrl;





  private _notebookEntries$: BehaviorSubject<NotebookEntry[]> = new BehaviorSubject([]);
  public get notebookEntries$(): Observable<NotebookEntry[]> {
    return this._notebookEntries$.asObservable();
  }
  public get notebookEntries(): NotebookEntry[] {
    return this._notebookEntries$.getValue();
  }

  private _tags$: BehaviorSubject<string[]> = new BehaviorSubject([]);
  public get tags$(): Observable<string[]> {
    return this._tags$.asObservable();
  }
  public get tags(): string[] {
    return this._tags$.getValue();
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
          let notebookEntry: NotebookEntry = new NotebookEntry(data._id, data.userId, data.dateCreatedISO, data.type, data.textContent, data.title, data.tags);

          notebookEntry.dateModified = moment(data.dateModifiedISO);
          notebookEntry.journalDate = moment(data.journalDateISO);
          notebookEntry.data = data.data;

          if(data.journalDateISO){

          }else{
            console.log("No journal Date")
          }

          notebookEntries.push(notebookEntry);
        })
        return notebookEntries;
      }))
      .subscribe((notebookEntries: NotebookEntry[]) => {
        this.getTags(notebookEntries);
        this._notebookEntries$.next(this.sortNotesByDate(notebookEntries));
        this._loginComplete.next(true);
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
      journalDate: notebookEntry.journalDate.toISOString(),
      dateCreated: notebookEntry.dateCreated.toISOString(),
      dateModified: notebookEntry.dateModified.toISOString(),
      type: notebookEntry.type,
      textContent: notebookEntry.textContent,
      title: notebookEntry.title,
      tags: notebookEntry.tags,
      data: notebookEntry.data,
    };



    this.httpClient.post<{ message: string, data: any }>(requestUrl, requestBody, httpOptions)
      .subscribe((response: { message: string, data: any }) => {
        let data = response.data;


        let notebookEntry: NotebookEntry = this.buildNoteFromData(data);


    
        let notebookEntries = this._notebookEntries$.getValue();
        notebookEntries.push(notebookEntry);
        this.getTags(notebookEntries);
        this._notebookEntries$.next(this.sortNotesByDate(notebookEntries));
      });


  }

  updateNotebookEntryHTTP(notebookEntry: NotebookEntry) {


    let requestUrl: string = this.serverUrl + "/api/notebook/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    let requestBody: any = {
      id: notebookEntry.id,
      userId: notebookEntry.userId,
      journalDate: notebookEntry.journalDate.toISOString(),
      dateCreated: notebookEntry.dateCreated.toISOString(),
      dateModified: moment().toISOString(),
      type: notebookEntry.type,
      textContent: notebookEntry.textContent,
      title: notebookEntry.title,
      tags: notebookEntry.tags,
      data: notebookEntry.data,
    };



    this.httpClient.post<{ message: string, data: any }>(requestUrl, requestBody, httpOptions)
      .subscribe((response: { message: string, data: any }) => {
        let data = response.data;


        let updatedNotebookEntry: NotebookEntry = this.buildNoteFromData(data);
        let notebookEntries = this._notebookEntries$.getValue();

        let index:number = -1;
        for(let entry of notebookEntries){
          if(entry.id == notebookEntry.id){
            index = notebookEntries.indexOf(entry);
          }
        }
        
        
        notebookEntries.splice(index, 1, updatedNotebookEntry)
        
        this.getTags(notebookEntries);
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
        this.getTags(notebookEntries);
        this._notebookEntries$.next(this.sortNotesByDate(notebookEntries));
      })
  }

  private getTags(notebookEntries: NotebookEntry[]){
    let tags: string[] = [];
    for(let notebookEntry of notebookEntries){
      notebookEntry.tags.forEach((tag: string)=>{
        if(!tags.includes(tag)){
          tags.push(tag);
        }
      })
    }

    tags = tags.filter((tag: string)=>{
      if(tag != ""){
        return tag;
      }
    })

    

    this._tags$.next(tags);
  }

  private buildNoteFromData(data: any): NotebookEntry {
    
    let notebookEntry: NotebookEntry = new NotebookEntry(data._id, data.userId, data.dateCreatedISO, data.type, data.textContent, data.title, data.tags);

        if(data.journalDateISO){

        }else{
          console.log("No journal Date")
        }

        notebookEntry.dateModified = moment(data.dateModifiedISO);
        notebookEntry.journalDate = moment(data.journalDateISO);
        
        notebookEntry.data = data.data;

    return notebookEntry;
  }

  private sortNotesByDate(notes: NotebookEntry[]): NotebookEntry[]{
    return notes.sort((note1, note2)=>{
      if(note1.journalDate.isBefore(note2.journalDate)){
        return 1
      }
      if(note1.journalDate.isAfter(note2.journalDate)){
        return -1;
      }
      return 0;
    })
  }
}
