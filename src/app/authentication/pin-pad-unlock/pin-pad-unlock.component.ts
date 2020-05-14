import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { faTimes, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-pin-pad-unlock',
  templateUrl: './pin-pad-unlock.component.html',
  styleUrls: ['./pin-pad-unlock.component.css']
})
export class PinPadUnlockComponent implements OnInit {

  constructor(private authService: AuthenticationService) { }

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

  public get showConfirmButton(): boolean { return this._showConfirmButton; }
  public get showUnlockButton(): boolean { return this._showUnlockButton; }
  public get showLoadingButton(): boolean { return this._showLoadingButton; }

  public get formMessage(): string { return this._formMessage; }

  @Input() public set create(create: boolean){
    if(create === true){
      this._pinAction = 'CREATE';
    }
  }
  @Output() public close: EventEmitter<boolean> = new EventEmitter();
  @Output() public savedPin: EventEmitter<string> = new EventEmitter();

  public get pinAction(): 'UNLOCK' | 'CREATE' | 'CONFIRM_CREATE' { return this._pinAction; }
  public get pinActionMessage(): string { 
    if(this.pinAction === 'UNLOCK'){
      return 'Use your PIN to unlock the app';
    }else if(this.pinAction === 'CREATE'){
      return 'Set a 4 to 8 digit PIN';
    }else if(this.pinAction === 'CONFIRM_CREATE'){
      return 'Confirm your PIN';
    }
  }
  
  ngOnInit() {
  }

  public onClickButton(num: number){
    if(this._pinItems.length < 8){
      this._pinItems.push(num);
    }
    if(this._pinItems.length >= 4){
      if(this._pinAction === 'CREATE'){
        this._showConfirmButton = true;
      }else if(this._pinAction === 'UNLOCK' || this._pinAction === 'CONFIRM_CREATE'){
        this._showUnlockButton = true;
      }
    }
  }
  public onClickDeletePinItem(){
    this._pinItems.pop();
  }

  private _checkPin(){
    
  }

  public onClickUnlock(){
    this._showLoadingButton = true;
    this._showConfirmButton = false;
    this._showUnlockButton = false;

    if(this.pinAction === 'UNLOCK'){
      let pinValue: string = '';
      this._pinItems.forEach(item => pinValue += item);
      this._pinItems = [];
      this.authService.unlockWithPin$(pinValue).subscribe((response)=>{
        console.log("Response: " , response);
      })
    }else if(this.pinAction === 'CONFIRM_CREATE'){
      let confirmPin: string = '';
      this._pinItems.forEach(item => confirmPin += item);
      this._pinItems = [];
      if(confirmPin === this._createPin){
        this.savedPin.emit(confirmPin);
      }else{
        this._formMessage = 'PINs do not match, try again'
        this._pinAction = 'CREATE';
      }
    }
  }

  public onClickClose(){
    if(this.pinAction === 'CONFIRM_CREATE'){
      this._pinAction = 'CREATE';
      this._showConfirmButton = false;
      this._showLoadingButton = false;
      this._showUnlockButton = false;
    }else{
      this.close.emit(true);
    }
    
  }

  public onClickConfirmPin(){
    let createPin: string = ''
    this._pinItems.forEach(item => createPin += item);
    this._createPin = createPin;
    this._pinItems = [];
    this._pinAction = 'CONFIRM_CREATE';
    this._showConfirmButton = false;
    this._showLoadingButton = false;
    this._showUnlockButton = false;
  }


  private _confirmPins(){

  }
}
