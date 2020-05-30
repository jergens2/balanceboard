import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { timer } from 'rxjs';
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-lock-screen',
  templateUrl: './lock-screen.component.html',
  styleUrls: ['./lock-screen.component.css']
})
export class LockScreenComponent implements OnInit {

  public faLock = faLock;
  public faLockOpen = faLockOpen;

  private _mouseIsOverLock: boolean = false;
  public get mouseIsOverLock(): boolean { return this._mouseIsOverLock; }

  constructor() { }

  private _clock: moment.Moment;

  public get clock(): string { return this._clock.format('h:mm:ss a'); }
  public get date(): string { return this._clock.format('dddd, MMM Do, YYYY'); }


  ngOnInit(): void {
    this._clock = moment();
    timer(1000, 1000).subscribe((tick) => {
      this._clock = moment();
    })
  }

  @Output() public unlock: EventEmitter<boolean> = new EventEmitter();

  public onMouseLeaveLock() { this._mouseIsOverLock = false; }
  public onMouseEnterLock() { this._mouseIsOverLock = true; }

  public onClickUnlock(){ 
    this.unlock.next(true);
  }

}
