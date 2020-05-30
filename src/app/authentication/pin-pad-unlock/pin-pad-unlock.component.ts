import { Component, OnInit, Output, Input, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { faTimes, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../authentication.service';
import { Observable, Subscription, timer } from 'rxjs';
import * as moment from 'moment';
import { KeydownService } from '../../shared/keydown.service';

@Component({
  selector: 'app-pin-pad-unlock',
  templateUrl: './pin-pad-unlock.component.html',
  styleUrls: ['./pin-pad-unlock.component.css']
})
export class PinPadUnlockComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthenticationService, private keydownService: KeydownService) { }

  private _pinItems: number[] = [];
  public get pinItems(): number[] { return this._pinItems; }

  public faTimes = faTimes;
  public faArrowLeft = faArrowLeft;
  public faArrowRight = faArrowRight;

  private _pinAction: 'UNLOCK' | 'CREATE' | 'CONFIRM_CREATE' = 'UNLOCK';
  private _showConfirmButton: boolean = false;
  private _showUnlockButton: boolean = false;
  private _showLoadingButton: boolean = false;
  private _formMessage: string = '';

  private _createPin: string = '';
  private _unlockDisabled: boolean = false;
  public get unlockDisabled(): string { return this._unlockDisabled === true ? 'disabled' : ''; }

  public get showConfirmButton(): boolean { return this._showConfirmButton; }
  public get showUnlockButton(): boolean { return this._showUnlockButton; }
  public get showLoadingButton(): boolean { return this._showLoadingButton; }

  public get formMessage(): string { return this._formMessage; }

  @Input() public set create(create: boolean) {
    if (create === true) {
      this._pinAction = 'CREATE';
    }
  }
  @Output() public close: EventEmitter<boolean> = new EventEmitter();
  @Output() public savedPin: EventEmitter<string> = new EventEmitter();


  private _unlockAttempts: number = 0;

  public get pinAction(): 'UNLOCK' | 'CREATE' | 'CONFIRM_CREATE' { return this._pinAction; }
  public get pinActionMessage(): string {
    if (this.pinAction === 'UNLOCK') {
      return 'Use your PIN to unlock the app';
    } else if (this.pinAction === 'CREATE') {
      return 'Set a 4 to 8 digit PIN';
    } else if (this.pinAction === 'CONFIRM_CREATE') {
      return 'Confirm your PIN';
    }
  }

  private _keySub: Subscription = new Subscription();

  ngOnInit() {
    this._keySub = this.keydownService.keyDown$.subscribe((keyValue)=>{
      // console.log("Keyvalue: ", keyValue)
      if(keyValue === '0'){ this.onClickButton(0); }
      else if(keyValue === '1'){ this.onClickButton(1); }
      else if(keyValue === '2'){ this.onClickButton(2); }
      else if(keyValue === '3'){ this.onClickButton(3); }
      else if(keyValue === '4'){ this.onClickButton(4); }
      else if(keyValue === '5'){ this.onClickButton(5); }
      else if(keyValue === '6'){ this.onClickButton(6); }
      else if(keyValue === '7'){ this.onClickButton(7); }
      else if(keyValue === '8'){ this.onClickButton(8); }
      else if(keyValue === '9'){ this.onClickButton(9); }
      else if(keyValue === 'Enter') { this.onClickUnlock(); }
    });
  }

  ngOnDestroy(){
    this._keySub.unsubscribe();
  }

  public onClickButton(num: number) {
    if (this._pinItems.length < 8) {
      this._pinItems.push(num);
    }
    if (this._pinItems.length >= 4) {
      if (this._pinAction === 'CREATE') {
        this._showConfirmButton = true;
      } else if (this._pinAction === 'UNLOCK' || this._pinAction === 'CONFIRM_CREATE') {
        this._showUnlockButton = true;
      }
    }
  }
  public onClickDeletePinItem() {
    this._pinItems.pop();
  }


  public onClickUnlock() {
    this._formMessage = "";
    this._showLoadingButton = true;
    this._showUnlockButton = false;


    this._showConfirmButton = false;

    if (this.pinAction === 'UNLOCK') {
      this._attemptUnlock();
    } else if (this.pinAction === 'CONFIRM_CREATE') {
      let confirmPin: string = '';
      this._pinItems.forEach(item => confirmPin += item);
      this._pinItems = [];
      if (confirmPin === this._createPin) {
        this.savedPin.emit(confirmPin);
      } else {
        this._formMessage = 'PINs do not match, try again'
        this._pinAction = 'CREATE';
      }
    }
  }

  private _subs: Subscription[] = [];
  private _attemptUnlock() {

    let pinValue: string = '';
    this._pinItems.forEach(item => pinValue += item);
    this._pinItems = [];

    const email: string = localStorage.getItem("email");
    if (email) {

      const startTime: moment.Moment = moment();
      const waitDurationMS: number = 1500;

      this._subs.forEach(sub => sub.unsubscribe());
      this._subs = [
        this.authService.loginAttempt$.subscribe((attempt) => {
          if (attempt === false) {
            let millisecondsElapsed = moment().diff(startTime, 'milliseconds');
            if (millisecondsElapsed < waitDurationMS) {
              const remainder = waitDurationMS - millisecondsElapsed;
              timer(remainder).subscribe((tick) => {
                this._stopLoginAttempt();
              });
            } else {
              this._stopLoginAttempt();
            }
          }
        }),
      ];
      console.log("PIN UNLOCK: " , pinValue, email)
      this.authService.unlockWithPin(pinValue, email);
    } else {
      console.log("Error: no email found in localstorage.")
    }


  }

  private _stopLoginAttempt() {
    this._showLoadingButton = false;
    this._showUnlockButton = true;
    this._formMessage = "Login attempt failed";
    this._subs.forEach(sub => sub.unsubscribe());
  }

  public onClickClose() {
    if (this.pinAction === 'CONFIRM_CREATE') {
      this._pinAction = 'CREATE';
      this._showConfirmButton = false;
      this._showLoadingButton = false;
      this._showUnlockButton = false;
    } else {
      this.close.emit(true);
    }

  }

  public onClickConfirmPin() {
    let createPin: string = ''
    this._pinItems.forEach(item => createPin += item);
    this._createPin = createPin;
    this._pinItems = [];
    this._pinAction = 'CONFIRM_CREATE';
    this._showConfirmButton = false;
    this._showLoadingButton = false;
    this._showUnlockButton = false;
  }


  private _confirmPins() {

  }
}
