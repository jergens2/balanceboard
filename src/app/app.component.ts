import { Component, OnInit, HostListener } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';
import { AppScreenSizeService } from './shared/app-screen-size/app-screen-size.service';
import { Subscription, Observable, Subject, BehaviorSubject, timer } from 'rxjs';
import * as moment from 'moment';
import { KeydownService } from './shared/keydown.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private _authSubs: Subscription[] = [];
  private _isAuthenticated: boolean = false;
  private _userActivitySub: Subscription = new Subscription();

  public get isAuthenticated(): boolean { return this._isAuthenticated; }

  constructor(
    private authService: AuthenticationService,
    private sizeService: AppScreenSizeService,
    private keydownService: KeydownService,

  ) { }

  @HostListener('window:resize', ['$event']) onResize(event) {
    let innerWidth = event.target.innerWidth;
    let innerHeight = event.target.innerHeight;
    this.sizeService.updateSize(innerWidth, innerHeight);
    this._resetUserInactiveTimer();
  }

  @HostListener('window:mousemove') refreshUserState() {
    this._resetUserInactiveTimer();
  }

  private _keyDown$: BehaviorSubject<string> = new BehaviorSubject(null);
  public get keyDown$(): Observable<string> { return this._keyDown$.asObservable(); }
  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    this.keydownService.keyDown(event.key);
    this._resetUserInactiveTimer();
  }

  ngOnInit() {
    // console.log("APP COMPONENT NG ON INIT")
    this._resetUserInactiveTimer();
    this._authSubs.forEach(sub => sub.unsubscribe());
    this._authSubs = [
      this.authService.logout$.subscribe(onLogout => this._isAuthenticated = false),
      this.authService.appComponentLogin$.subscribe(login => {
        if (login === true) {
          this._isAuthenticated = true;
        } else {
          this._isAuthenticated = false;
        }
      }),
    ];
  }

  private _inactivityStartTime: moment.Moment;
  private _resetUserInactiveTimer() {
    this._inactivityStartTime = moment();
    this._userActivitySub.unsubscribe();
    this._userActivitySub = timer(0, 3000).subscribe((tick) => {
      const diffMin = moment().diff(this._inactivityStartTime, "minutes");
      if (diffMin > 15) {
        this.authService.lock();
      }
    });
  }

}
