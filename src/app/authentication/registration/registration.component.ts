import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import { AuthData } from '../auth-data.interface';
import * as moment from 'moment';
import { RegistrationController } from '../registration-controller.class';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  constructor(private authService: AuthenticationService) { }

  public faArrowLeft = faArrowLeft;
  private _formMessage: string[] = [];

  private _action: 'INITIAL' | 'CONFIRM_PASSWORD' | 'CREATE_PIN' | 'TERMS' |
    'SUCCESSFUL_REG_START' | 'WAITING' | 'ERROR' | 'FINAL' = 'INITIAL';

  public get formMessage(): string[] { return this._formMessage; }
  public get action(): 'INITIAL' | 'CONFIRM_PASSWORD' | 'CREATE_PIN' | 'TERMS' |
    'SUCCESSFUL_REG_START' | 'WAITING' | 'ERROR' | 'FINAL' { return this._action; }
  public get email(): string { return this.authService.registrationController.email }

  @Output() public cancel: EventEmitter<boolean> = new EventEmitter();
  @Output() public login: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
    this.authService.setInitialRegistrationData({
      email: '',
      username: '',
      usernameStylized: '',
      password: '',
      pin: '',
    });
  }

  public onTermsComplete(acceptance: boolean){
    if(acceptance === true){
      this.setAction('WAITING');
      this._finalizeRegistration();
    }else{
      this.setAction('INITIAL')
    }
  }

  public setAction(action: 'INITIAL' | 'CONFIRM_PASSWORD' | 'CREATE_PIN' | 'TERMS' |
    'SUCCESSFUL_REG_START' | 'WAITING' | 'ERROR' | 'FINAL') {
    this._action = action;
    this._formMessage = [];

  }

  public onClickContinueToApp(){
    this.login.emit(true);

  }

  public onJumpToConfirmation(){
    this.setAction('SUCCESSFUL_REG_START')
  }

  public onMessageChanged(message: string[]){
    this._formMessage = message;
  }

  public onError(err: string){
    this._formMessage = [err];
    this.setAction('ERROR');
  }

  public onPinCreated(pin: string) {
    if (pin.length >= 4 && pin.length <= 8) {
      this.authService.registrationController.onPinCreated(pin);
      this.setAction('TERMS');
    } else {
      this.setAction('ERROR');
      console.log("Error with pin: ", pin);
    }
  }

  private _finalizeRegistration() {
    const regController: RegistrationController = this.authService.registrationController;   
    const authData = regController.getAuthData();
    this.authService.registerNewUserAccount$(authData).subscribe((response) => {
      this.setAction('SUCCESSFUL_REG_START');
    }, (err) => {
      console.log("Error registering: ", err);
      this._formMessage =[err.message];
      this.setAction('ERROR');
    });
  }

  




  onCancel() {
    this.cancel.emit(true);
  }



}
