import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { timer, Subscription } from 'rxjs';
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { KeydownService } from '../../shared/keydown.service';
import { ClockService } from '../../shared/clock/clock.service';

@Component({
  selector: 'app-lock-screen',
  templateUrl: './lock-screen.component.html',
  styleUrls: ['./lock-screen.component.css']
})
export class LockScreenComponent implements OnInit, OnDestroy {

  public faLock = faLock;
  public faLockOpen = faLockOpen;

  private _mouseIsOverLock: boolean = false;
  public get mouseIsOverLock(): boolean { return this._mouseIsOverLock; }

  constructor(private keyDownService: KeydownService, private clockService: ClockService) { }



  public get clock(): string { return this.clockService.currentTime.format('h:mm:ss a'); }
  public get date(): string { return this.clockService.currentTime.format('dddd, MMM Do, YYYY'); }

  private _keydownSub: Subscription = new Subscription();

  ngOnInit(): void {

    this._keydownSub = this.keyDownService.keyDown$.subscribe((keyVal: string)=>{
      // console.log("Key val:  ", keyVal);
      if(keyVal === 'Enter' || keyVal === ' '){
        this.onClickUnlock(); 
      }
    });
  }

  ngOnDestroy(){ 
    this._keydownSub.unsubscribe();
    this._keydownSub = null;
  }

  @Output() public unlock: EventEmitter<boolean> = new EventEmitter();

  public onMouseLeaveLock() { this._mouseIsOverLock = false; }
  public onMouseEnterLock() { this._mouseIsOverLock = true; }

  public onClickUnlock(){ 
    this.unlock.next(true);
  }

}
