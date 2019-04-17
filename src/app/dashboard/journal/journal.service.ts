import { Injectable } from '@angular/core';
import { JournalEntry } from './journal-entry/journal-entry.model';
import { serverUrl } from '../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../authentication/auth-status.model';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { JournalEntryTypes } from './journal-entry/journal-entry-types.enum';

@Injectable({
  providedIn: 'root'
})
export class JournalService {

  constructor(private httpClient: HttpClient) { }

  private _authStatus: AuthStatus;
  login$(authStatus: AuthStatus): Observable<JournalEntry[]> {
    this._authStatus = authStatus;

    this.fetchJournalEntries();
    return this._journalEntries$.asObservable();
  }
  logout() {
    this._authStatus = null;
  }

  private serverUrl = serverUrl;





  private _journalEntries$: BehaviorSubject<JournalEntry[]> = new BehaviorSubject([]);
  public get journalEntries$(): Observable<JournalEntry[]> {
    return this._journalEntries$.asObservable();
  }



  public saveJournalEntry(journalEntry: JournalEntry) {

    this.saveJournalEntryHttp(journalEntry);
  }



  private fetchJournalEntries() {
    let requestUrl: string = this.serverUrl + "/api/journal/" + this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.get<{ message: string, data: any }>(requestUrl, httpOptions)
      .pipe<JournalEntry[]>(map((response: { message: string, data: any }) => {
        let rd: any[] = response.data;
        let journalEntries: JournalEntry[] = [];
        rd.forEach((data: any) => {
          let journalEntry: JournalEntry = new JournalEntry();
          journalEntry.id = data._id;
          journalEntry.userId = data.userId;
          journalEntry.dateCreated = moment(data.dateCreatedISO);
          journalEntry.dateModified = moment(data.dateModifiedISO);
          journalEntry.forDate = moment(data.forDateISO);
          journalEntry.tags = data.tags;
          journalEntry.textContent = data.textContent;
          journalEntry.title = data.title;
          journalEntry.type = data.type;
          journalEntries.push(journalEntry);
        })
        return journalEntries;
      }))
      .subscribe((journalEntries: JournalEntry[]) => {
        this._journalEntries$.next(journalEntries);
      });

  }


  private saveJournalEntryHttp(journalEntry: JournalEntry) {


    let requestUrl: string = this.serverUrl + "/api/journal/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    let requestBody: any = {
      userId: this._authStatus.user.id,
      forDate: journalEntry.forDate.toISOString(),
      dateCreated: journalEntry.dateCreated.toISOString(),
      dateModified: journalEntry.dateModified.toISOString(),
      type: journalEntry.type,
      textContent: journalEntry.textContent,
      title: journalEntry.title,
      tags: journalEntry.tags,
    };



    this.httpClient.post<{ message: string, data: any }>(requestUrl, requestBody, httpOptions)
      .subscribe((response: { message: string, data: any }) => {
        let data = response.data;
        let journalEntry: JournalEntry = new JournalEntry();

        journalEntry.id = data._id;
        journalEntry.userId = data.userId;
        journalEntry.dateCreated = moment(data.dateCreatedISO);
        journalEntry.dateModified = moment(data.dateModifiedISO);
        journalEntry.forDate = moment(data.forDateISO);
        journalEntry.tags = data.tags;
        journalEntry.textContent = data.textContent;
        journalEntry.title = data.title;
        journalEntry.type = data.type;

        let journalEntries = this._journalEntries$.getValue();
        journalEntries.push(journalEntry);
        this._journalEntries$.next(journalEntries);
      });


  }
}
