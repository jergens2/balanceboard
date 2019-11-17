import { Injectable } from '@angular/core';
import { LogEntry } from './log-entry.class';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  constructor() { }

  private _logEntries: LogEntry[] = [];

  public logNewError(errorMessage: string) {
    this._logEntries.push(new LogEntry(errorMessage, true));
  }
  public logNewMessage(message: string) {
    this._logEntries.push(new LogEntry(message));
  }

  public getLog(): LogEntry[] { return this._logEntries; }
}
