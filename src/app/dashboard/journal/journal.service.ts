import { Injectable } from '@angular/core';
import { JournalEntry } from './journal-entry.model';
import { serverUrl } from '../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../authentication/auth-status.model';

@Injectable({
  providedIn: 'root'
})
export class JournalService {

  constructor(private httpClient: HttpClient) { }

  private _authStatus: AuthStatus;
  login(authStatus: AuthStatus) {
    this._authStatus = authStatus;
  }
  logout() {
    this._authStatus = null;
  }

  private serverUrl = serverUrl;

  public saveJournalEntry(journalEntry: JournalEntry) {

    this.saveJournalEntryHttp(journalEntry);
  }

  private saveJournalEntryHttp(journalEntry: JournalEntry) {
    console.log("Saving journalEntry: ", journalEntry);

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
      .subscribe((response: any) => {
        console.log("response is ", response);
      });


  }
}
